var cnv;
var isPlayWithBot = false;
let isSpectating = false;
var isMultiplayer = false;
var opponentCanvas;
var opponentSword;
var score,
  points = 0;
var isMobile = window.innerWidth <= 768;
var lives,
  x = 0;
var isPlay = false;
var gravity = 0.1;
var sword;
var fruit = [];
var fruitsList = [
  "apple",
  "banana",
  "peach",
  "strawberry",
  "watermelon",
  "boom",
];

var opponentFruitList = [
  "apple",
  "banana",
  "peach",
  "strawberry",
  "watermelon",
  "boom",
];

var fruitsImgs = [],
  slicedFruitsImgs = [],
  splashImgs = [];
var livesImgs = [],
  livesImgs2 = [];
var boom, spliced, missed, over, start;
let opponentState = {
  swordX: 0,
  swordY: 0,
  fruits: [],
  score: 0,
  lives: 26,
};
let socket;

function preload() {
  boom = loadSound("sounds/boom.mp3");
  spliced = loadSound("sounds/splatter.mp3");
  missed = loadSound("sounds/missed.mp3");
  start = loadSound("sounds/start.mp3");
  over = loadSound("sounds/over.mp3");

  for (var i = 0; i < fruitsList.length - 1; i++) {
    slicedFruitsImgs[2 * i] = loadImage("images/" + fruitsList[i] + "-1.png");
    slicedFruitsImgs[2 * i + 1] = loadImage(
      "images/" + fruitsList[i] + "-2.png"
    );
  }
  for (var i = 0; i < fruitsList.length; i++) {
    fruitsImgs[i] = loadImage("images/" + fruitsList[i] + ".png");
    if (fruitsList[i] != "boom") {
      splashImgs[i] = loadImage("images/" + fruitsList[i] + "-splash.png");
    }
  }
  for (var i = 0; i < 3; i++) {
    livesImgs[i] = loadImage("images/x" + (i + 1) + ".png");
  }
  for (var i = 0; i < 3; i++) {
    livesImgs2[i] = loadImage("images/xx" + (i + 1) + ".png");
  }
  bg = loadImage("images/fbg2.png");
  foregroundImg = loadImage("images/home-mask.png");
  fruitLogo = loadImage("images/fruit.png");
  ninjaLogo = loadImage("images/ninja.png");
  scoreImg = loadImage("images/score.png");
  newGameImg = loadImage("images/new-game.png");
  fruitImg = loadImage("images/fruitMode.png");
  gameOverImg = loadImage("images/game-over.png");
}

function setup() {
  cnv = createCanvas(windowWidth, windowHeight);
  cnv.position(0, 0);
  cnv.style("z-index", "-1");
  sword = new Sword(color("#FFFFFF"));
  frameRate(60);
  score = 0;
  lives = 26;
  showGameModePopup(); // Show the popup when the game starts

  // Create singleplayer button
  let singleplayerBtn = createButton("");
  singleplayerBtn.id("singleplayerBtn");

  singleplayerBtn.style("background", "url(images/Start_icon.png) no-repeat center");

  singleplayerBtn.style("background-size", "contain");
  singleplayerBtn.style("border", "none");
  singleplayerBtn.style("padding", "0");
  singleplayerBtn.style("cursor", "pointer");
  singleplayerBtn.mousePressed(startSingleplayer);

  // Responsive positioning and sizing
  singleplayerBtn.style("position", "fixed");
  singleplayerBtn.style("right", "10px");
  singleplayerBtn.style("bottom", "20px");

  // Base size for most screens
  singleplayerBtn.style("width", "clamp(100px, 20vw, 400px)");
  singleplayerBtn.style("height", "clamp(100px, 20vw, 400px)");

  // Adjust size for larger screens

  // Create multiplayer button
  let multiplayerBtn = createButton("");
  multiplayerBtn.id("multiplayerBtn");
  // multiplayerBtn.position(300, 150);
  // multiplayerBtn.size(500, 500);
  multiplayerBtn.style(
    "background",
    "url(images/Multiplayer_Icon.png) no-repeat center"
  );
  multiplayerBtn.style("background-size", "contain");
  multiplayerBtn.style("background-size", "contain");
  multiplayerBtn.style("border", "none");
  multiplayerBtn.style("padding", "0");
  multiplayerBtn.style("cursor", "pointer");

  // Responsive positioning and sizing
  multiplayerBtn.style("position", "fixed");
  multiplayerBtn.style("left", "10px");
  multiplayerBtn.style("bottom", "20px");
  multiplayerBtn.style("width", "clamp(100px, 20vw, 400px)");
  multiplayerBtn.style("height", "clamp(100px, 20vw, 400px)");

  multiplayerBtn.mousePressed(startMultiplayer);
}

function draw() {
  clear();
  // background(bg);

  if (isPlay) {
    background(bg);
    game();
  } else {
    // image(this.newGameImg, 310, 360, 200, 200);
    // image(this.fruitImg, 365, 415, 90, 90);
  }

  cnv.mouseClicked(check);
}

function updateOpponentState(data) {
  opponentState.swordX = data.swordX;
  opponentState.swordY = data.swordY;
  opponentState.fruits = data.fruits;
  opponentState.score = data.score;
  opponentState.lives = data.lives;
}

function drawMultiplayer() {
  // document.getElementById("defaultCanvas0").style.width = "50%";
  // document.getElementById("defaultCanvas0").style.height = "50%";
  // new p5(sketch2);
}

function showGameModePopup() {
  // document.getElementById("gameModePopup").style.display = "block";
  console.log("showGameModePopup");
  //  document
  //     .getElementById("singleplayerBtn")
  //     .addEventListener("click", startSingleplayer);
  //   document
  //     .getElementById("multiplayerBtn")
  //     .addEventListener("click", startMultiplayer);
}

function showSearchingState() {
  // Hide the game canvas
  cnv.style("display", "none");
  const queryString = window.location.search;

  // Create a loading message
  let loadingMsg = createP("Searching for a player...");
  loadingMsg.id("loadingMsg");
  loadingMsg.style("text-align", "center");
  loadingMsg.style("font-size", "clamp(24px, 5vw, 36px)");
  loadingMsg.style("margin-top", "50px");
  loadingMsg.style("color", "white");
  loadingMsg.style("font-weight", "bold");

  const urlParams = new URLSearchParams(queryString);
  const player1Id = urlParams.get('player1Id');

  if (player1Id.startsWith('a99') || player1Id.startsWith('b99')) {
    // alert()
    loadingMsg.remove();
    startBotGame(true);
    return;
     // Stop further execution
  } 

  // Initialize the socket and set up multiplayer listeners
  else{
    setupMultiplayerListeners(socket, playerName);
    loop();} 

  // Create a timer

  // let timerInterval = setTimeout(() => {
  //     showPlayWithBothSuggestion();
  // }, 5000);
}

function check() {
  if (!isPlay && mouseX > 300 && mouseX < 520 && mouseY > 350 && mouseY < 550) {
    showGameModePopup();
  }
}

function game() {
  clear();
  background(bg);
  sword.swipe(mouseX, mouseY);
  sword.update();
  sword.draw();

  if (frameCount % 5 === 0) {
    if (noise(frameCount) > 0.69) {
      fruit.push(randomFruit());
    }
  }
  points = 0;

  for (var i = fruit.length - 1; i >= 0; i--) {
    fruit[i].update();
    fruit[i].draw();
    if (!fruit[i].visible) {
      if (!fruit[i].sliced && fruit[i].name != "boom") {
        image(this.livesImgs2[0], fruit[i].x, fruit[i].y - 120, 50, 50);
        missed.play();
        lives--;
        x++;
      }
      if (lives < 1) {
        console.log(playerName, "Player lost the game");
       
        if (isMultiplayer) socket.emit("gameOver", playerName);
        if (isPlayWithBot) gameOver("bot");
        gameOver();
      }
      fruit.splice(i, 1);
    } else {
      if (fruit[i].sliced && fruit[i].name == "boom") {
        boom.play();
        if (isMultiplayer) socket.emit("gameOver", playerName);
        if (isPlayWithBot) gameOver("bot");
        gameOver();
      }
      if (sword.checkSlice(fruit[i]) && fruit[i].name != "boom") {
        spliced.play();
        showSplash(fruit[i].name, fruit[i].x, fruit[i].y);
        points++;
        fruit[i].update();
        fruit[i].draw();
      }
    }
  }
  if (frameCount % 2 === 0) {
    sword.update();
  }
  sword.draw();
  score += points;
  drawScore(score);
  drawLives(lives);
  if (isMultiplayer) {
    cnv.textSize(32);
    cnv.textStyle(BOLD);
    cnv.fill(0, 0, 255);
    cnv.textAlign(CENTER);
    cnv.text("Oponent Score: " + opponentState.score, 800 / 2, 30);
    cnv.text("Oponent Lives: " + opponentState.lives, 800 / 2, 60);
  }

  if (isMultiplayer) {
    socket.emit("updateOpponentData", {
      score: score,
      lives: lives,
      swordX: mouseX,
      swordY: mouseY,
      fruits: fruit.map((f) => ({
        name: f.name,
        x: f.x,
        y: f.y,
        visible: f.visible,
        sliced: f.sliced,
      })),
    });
    if(isMultiplayer){
      let spectateBtn = document.getElementById("spectateBtn");
      if (!spectateBtn) {
        const spectateBtn = document.createElement("button");
        spectateBtn.id = "spectateBtn";
        spectateBtn.innerText = "Spectate";
        spectateBtn.style.position = "absolute";
        spectateBtn.style.top = "75px";
        spectateBtn.style.marginTop = "40px";
  
        spectateBtn.style.right = "10px";
  
        // Style the button
        spectateBtn.style.padding = "10px 20px";
        spectateBtn.style.border = "2px solid #8B4513"; // Dark brown border to match the wooden background
        spectateBtn.style.borderRadius = "15px"; // Rounded corners for a more polished look
        spectateBtn.style.backgroundColor = "#FFA500"; // Bright orange color for a fruit-like appearance
        spectateBtn.style.color = "#fff"; // White text for good contrast
        spectateBtn.style.fontFamily =
          "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"; // A clean and modern font
        spectateBtn.style.fontSize = "16px";
        spectateBtn.style.cursor = "pointer";
        spectateBtn.style.boxShadow = "0px 4px 6px rgba(0, 0, 0, 0.3)"; // Subtle shadow for depth
  
        // Add a hover effect
        spectateBtn.addEventListener("mouseover", () => {
          spectateBtn.style.backgroundColor = "#FF8C00"; // Darker orange on hover
        });
  
        spectateBtn.addEventListener("mouseout", () => {
          spectateBtn.style.backgroundColor = "#FFA500"; // Revert to original color
        });
  
        document.body.appendChild(spectateBtn);
  
        spectateBtn.addEventListener("click", () => {
          isSpectating = !isSpectating;
          if (isSpectating) {
            spectateBtn.innerText = "Return";
            document.getElementById("defaultCanvas0").style.border = "none";
          } else {
            spectateBtn.innerText = "Spectate";
            document.getElementById("defaultCanvas0").style.border = "none";
          }
        });}


        let remoteVideo = document.getElementById("remoteVideo");
        if (!remoteVideo) {
          remoteVideo = document.createElement("video");
          remoteVideo.id = "remoteVideo";
          remoteVideo.style.position = "absolute";
          remoteVideo.style.bottom = "10px";
          remoteVideo.style.right = "10px";
          remoteVideo.style.width = "300px";
          remoteVideo.style.height = "200px";
          remoteVideo.style.border = "2px solid #8B4513";
          remoteVideo.style.borderRadius = "15px";
          remoteVideo.style.backgroundColor = "#000"; // Black background
      
          // Append video element to the body
          document.body.appendChild(remoteVideo);
        }



    }
  }
  if (isPlayWithBot) {
    let spectateBtn = document.getElementById("spectateBtn");

    // var finalTime = new Date().getTime();
    // console.error(finalTime - initTime);
    if (!spectateBtn) {
      const spectateBtn = document.createElement("button");
      spectateBtn.id = "spectateBtn";
      spectateBtn.innerText = "Spectate";
      spectateBtn.style.position = "absolute";
      spectateBtn.style.top = "75px";
      spectateBtn.style.marginTop = "40px";

      spectateBtn.style.right = "10px";

      // Style the button
      spectateBtn.style.padding = "10px 20px";
      spectateBtn.style.border = "2px solid #8B4513"; // Dark brown border to match the wooden background
      spectateBtn.style.borderRadius = "15px"; // Rounded corners for a more polished look
      spectateBtn.style.backgroundColor = "#FFA500"; // Bright orange color for a fruit-like appearance
      spectateBtn.style.color = "#fff"; // White text for good contrast
      spectateBtn.style.fontFamily =
        "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"; // A clean and modern font
      spectateBtn.style.fontSize = "16px";
      spectateBtn.style.cursor = "pointer";
      spectateBtn.style.boxShadow = "0px 4px 6px rgba(0, 0, 0, 0.3)"; // Subtle shadow for depth

      // Add a hover effect
      spectateBtn.addEventListener("mouseover", () => {
        spectateBtn.style.backgroundColor = "#FF8C00"; // Darker orange on hover
      });

      spectateBtn.addEventListener("mouseout", () => {
        spectateBtn.style.backgroundColor = "#FFA500"; // Revert to original color
      });

      document.body.appendChild(spectateBtn);

      spectateBtn.addEventListener("click", () => {
        isSpectating = !isSpectating;
        if (isSpectating) {
          spectateBtn.innerText = "Return";
          document.getElementById("defaultCanvas0").style.border = "none";
        } else {
          spectateBtn.innerText = "Spectate";
          document.getElementById("defaultCanvas0").style.border = "none";
        }
      });

      if (!isSpectating) {
        const botScores = [3, 5, 8, 11, 7];
        botscore = botScores[Math.floor(Math.random() * botScores.length)];
        botlives = 25;
        botpoints = 0;

        // Randomly decrease lives, increase points, and scores
        if (Math.random() < 0.6) {
          // 60% chance to decrease a life
          botlives--;
          console.log("Bot lost a life. Lives left:", botlives);
        }

        // if (Math.random() < 0.05) {
        //   // 5% chance to increase points
        //   botPoints += Math.floor(Math.random() * 3) + 1; // Increase by 1 to 3 points

        //   console.log("Bot gained points. Points:", botpoints);
        // }

        // if (Math.random() < 0.05) {
        //   // 5% chance to increase score
        //   botscore += Math.floor((Math.floor(Math.random() * 1) + 1)/100); // Increase by 1 to 10 score
        //   console.log("Bot gained score. Score:", botscore);
        // }

        // Check if lives are zero and trigger gameOver
        if (botlives <= 0) {
          console.log("Bot lost all lives. Game over.");
          gameOver("player");
        }
      }
    }
  }

  if (isSpectating && isPlayWithBot) {
    // Show bot's POV
    drawBotPOV();
  }
}

let botX, botY;
let lastUpdateTime = 0;
const updateInterval = 250; // Update bot position every 100ms
const movementSpeed = 0.3;

function drawBotPOV() {
  clear();
  background(bg);
  cnv.style("border", "5px solid red");

  if (isSpectating) {
    cnv.mousePressed(() => false);
    cnv.mouseReleased(() => false);
    cnv.mouseMoved(() => false);
  }

  let gameCanvas = document.getElementById("defaultCanvas0");
  gameCanvas.style.pointerEvents = isSpectating ? "none" : "auto";

  // Update bot's target position at regular intervals
  if (millis() - lastUpdateTime > updateInterval) {
    if (fruit.length > 0) {
      let targetFruit = fruit[Math.floor(Math.random() * fruit.length)];
      targetX = targetFruit.x;
      targetY = targetFruit.y;
    } else {
      targetX = random(width);
      targetY = random(height);
    }
    lastUpdateTime = millis();
  }

  // Gradually move towards the target position
  if (!botX) botX = width / 2;
  if (!botY) botY = height / 3;
  botX = lerp(botX, targetX, movementSpeed);
  botY = lerp(botY, targetY, movementSpeed);

  sword.swipe(botX, botY);
  sword.update();
  sword.draw();

  if (frameCount % 5 === 0) {
    if (noise(frameCount) > 0.69) {
      fruit.push(randomFruit());
    }
  }

  for (var i = fruit.length - 1; i >= 0; i--) {
    fruit[i].update();
    fruit[i].draw();
    if (!fruit[i].visible) {
      if (!fruit[i].sliced && fruit[i].name != "boom") {
        image(this.livesImgs2[0], fruit[i].x, fruit[i].y - 120, 50, 50);
        missed.play();
        botlives--;
        x++;
      }
      if (botlives < 1) {
        if (isPlayWithBot) gameOver("player");
        botpoints = botscore;
        gameOver();
      }
      fruit.splice(i, 1);
    } else {
      if (fruit[i].sliced && fruit[i].name == "boom") {
        boom.play();
        if (isPlayWithBot) gameOver("player");
if (isMultiplayer) {
          socket.emit("gameOver", { loser: playerName, roomId: currentRoom });
        }        gameOver();
      }
      if (sword.checkSlice(fruit[i]) && fruit[i].name != "boom") {
        spliced.play();
        showSplash(fruit[i].name, fruit[i].x, fruit[i].y);
        // botpoints++; FUCKS UP THE Points into 100's
        botscore++;
        fruit[i].update();
        fruit[i].draw();
      }
    }
  }

  if (frameCount % 2 === 0) {
    sword.update();
  }
  sword.draw();
  botscore += botpoints;
  drawScore(botpoints);
  drawLives(botlives);


  if (isMultiplayer) {
    socket.emit("updateBotState", {
      score: botscore,
      lives: botlives,
      swordX: botX,
      swordY: botY,
      fruits: fruit.map((f) => ({
        name: f.name,
        x: f.x,
        y: f.y,
        visible: f.visible,
        sliced: f.sliced,
      })),
      roomId: currentRoom,
    });
  }
}

let splashTimer = 6000; // Adjust this value to change the display duration

function showSplash(fruitName, x, y) {
  let splashImg = splashImgs[fruitsList.indexOf(fruitName)];
  if (splashImg && splashTimer > 0) {
    image(splashImg, x, y, 250, 250);
    splashTimer--; // Decrease the timer on each frame
  }
}

function drawLives(lives) {
  image(
    this.livesImgs[0],
    width - 110,
    20,
    livesImgs[0].width,
    livesImgs[0].height
  );
  image(
    this.livesImgs[1],
    width - 88,
    20,
    livesImgs[1].width,
    livesImgs[1].height
  );
  image(
    this.livesImgs[2],
    width - 60,
    20,
    livesImgs[2].width,
    livesImgs[2].height
  );
  if (lives <= 2) {
    image(
      this.livesImgs2[0],
      width - 110,
      20,
      livesImgs2[0].width,
      livesImgs2[0].height
    );
  }
  if (lives <= 1) {
    image(
      this.livesImgs2[1],
      width - 88,
      20,
      livesImgs2[1].width,
      livesImgs2[1].height
    );
  }
  if (lives === 0) {
    image(
      this.livesImgs2[2],
      width - 60,
      20,
      livesImgs2[2].width,
      livesImgs2[2].height
    );
  }
}

function drawScore(score) {
  image(this.scoreImg, 10, 10, 40, 40);
  textAlign(LEFT);
  noStroke();
  fill(255, 147, 21);
  textSize(50);
  text(score, 50, 50);
}
function singlegameOver(score1, score2) {
  return max(score1, score2);
  // TODO winning logic redfine
}
function gameOver(winner) {
  isPlay = false;
  noLoop();
  over.play();
  clear();
  background(bg);

  // Set dimensions based on screen size
  const canvasWidth = width;
  const canvasHeight = height;

  // Calculate the image dimensions based on the canvas size
  const imgWidth = min(canvasWidth * 0.8, 490); // Max width of 490, or 80% of canvas width
  const imgHeight = imgWidth * (85 / 490); // Maintain aspect ratio

  // Calculate the position to center the image
  const imgX = (canvasWidth - imgWidth) / 2;
  const imgY = (canvasHeight - imgHeight) / 2;

  // Display the image at the calculated position and size
  image(this.gameOverImg, imgX, imgY, imgWidth, imgHeight);

  if (isPlayWithBot) {
    let title, text, icon;

    if (winner === "bot") {
      title = "Game Over!";
      text = "Opponent Won the game";
      icon = "info";
    } else if (winner === "player") {
      title = "Congratulations!";
      text = "You Won the game";
      icon = "success";
    }

    Swal.fire({
      title: title,
      html: `
        ${text}<br><br>
        Your score: ${score}<br>
        Opponent's Score: ${botscore}
      `,
      icon: icon,
      confirmButtonText: "OK",
    });

    isPlayWithBot = false;
  }

  lives = 0;
  if (isMultiplayer) {
    socket.emit("gameOver", { loser: playerName, roomId: currentRoom });
    opponentScore = opponentState.score;

    socket.emit("leaveRoom", { roomId: currentRoom });
  }

  setTimeout(() => {
    if (isMultiplayer) {
      // Instead of reloading, reset the game state and wait for a new opponent
      resetGameState();
      socket.emit("waitForOpponent");
    } else {
      location.reload();
      const currentUrl = window.location.href;

    // Remove all searchParams from the URL
    const cleanedUrl = currentUrl.split('?')[0];

    // Redirect to the cleaned URL
    window.location.href = cleanedUrl;
    }
  }, 2000);
}

function resetGameState() {
  // Reset all game variables here
  score = 0;
  lives = 25;
  fruit = [];
  // ... reset any other necessary variables

  // Clear the canvas
  clear();
  background(bg);

  // Display a "Waiting for opponent" message
  textAlign(CENTER, CENTER);
  textSize(32);
  fill(255);
  text("Waiting for opponent...", width/2, height/2);
}




function sketch2(p) {
  let prevX = null;
  let prevY = null;

  p.setup = function () {
    opponentCanvas = p.createCanvas(windowWidth, windowHeight);
    opponentCanvas.id("opponentCanvas");
    opponentSword = new Sword(color("#FFFFFF"));
    opponentCanvas.position(0, 0);
    opponentCanvas.style("z-index", "-1");
  };

  p.draw = function () {
    p.clear();
    p.background(bg);

    if (isPlay && isMultiplayer) {
      multiplayerGame(p);
    } else {
      p.image(this.foregroundImg, 0, 0, 800, 350);
      p.image(this.fruitLogo, 40, 20, 358, 195);
      p.image(this.ninjaLogo, 420, 50, 318, 165);
      p.image(this.newGameImg, 310, 360, 200, 200);
      p.image(this.fruitImg, 365, 415, 90, 90);
    }
  };
}

function multiplayerGame(p) {
  console.log("Multiplayer game");
  p.clear();
  p.background(bg);

  opponentSword.swipe(opponentState.swordX, opponentState.swordY);
  opponentSword.update();
  opponentSword.draw();

  // Draw score and lives
  p.textSize(32);
  p.fill(255);
  p.text("Score: " + opponentState.score, 10, 30);
  p.text("Lives: " + opponentState.lives, 10, 60);
}