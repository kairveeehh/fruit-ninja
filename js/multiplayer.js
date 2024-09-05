let playerName;
let gameEnded = false;
let opponentScore = 0;
let currentRoom = null;

function setupMultiplayerListeners(socket, playerName) {
  socket.on("joinedRoom", (roomData) => {
    currentRoom = roomData.roomId;
    console.error(currentRoom);
  });

  socket.on('roomFull', ({ roomId }) => {
    alert(`Room ${roomId} is full. Please try another room.`);
    // Handle this scenario in your UI
  });

  socket.on("playerConnected", (players) => {
    if (players.length === 2) {
      startCapture();

      function delay(ms) {
        return new Promise((resolve) => {
          setTimeout(resolve, ms);
        });
      }

      async function startSreenshare() {
        await delay(10000); // Wait for 10 seconds

        let loadingMsg = select("#loadingMsg");
        if (loadingMsg) loadingMsg.remove();
        cnv.style("display", "block");
        isMultiplayer = true;
        drawMultiplayer();
        isPlay = true;
        score = 0;
        opponentScore = 0;
        lives = 3;
        gameEnded = false;
        loop();
        let delayedbox = document.getElementById("delayed-box");
     
        delayedbox.style.top = "50%";
        delayedbox.style.right = "0";
        delayedbox.style.transform = "translateY(-50%)";
        delayedbox.style.width = "0px";
        delayedbox.style.height = "0px";

        delayedbox.style.border = "1px solid #ccc";
        
      }

      startSreenshare();
    }
  });

  socket.on("updateOpponentState", (data) => {
    updateOpponentState(data);
  });

  socket.on("updateScores", (scores) => {
    if (scores[playerName] !== undefined) {
      score = scores[playerName];
    }
    for (let player in scores) {
      if (player !== playerName) {
        opponentScore = scores[player];

        break;
      }
    }
  });

  socket.on("gameOver", (data) => {
    if (!gameEnded && data.roomId === currentRoom) {
      gameEnded = true;

      if (score > opponentState.score) {
        showGameOverAlert("You won!", "Congratulations!", "success");
      } else if (score < opponentState.score) {
        showGameOverAlert("You lost!", "Game Over", "error");
      } else {
        showGameOverAlert("It's a tie!", "The game ended in a tie.", "warning");
      }
    }
  });

  socket.on("disconnect", () => {
    socket.emit("playerDisconnected", { playerName, roomId: currentRoom });
  });

  socket.on("playerDisconnected", (data) => {
    if (!gameEnded && data.roomId === currentRoom) {
      gameEnded = true;
      gameOver();
      if (data.disconnectedPlayerName !== playerName) {
        showGameOverAlert(
          "You won!",
          "The other player has disconnected.",
          "success"
        );
      }
    }
  });

  socket.on("roomClosed", () => {
    showGameOverAlert("Room Closed", "The game room has been closed.", "info");
  });
}

function updateScore(newScore) {
  score = newScore;
  socket.emit("updateScore", { score: newScore });
}

function showGameOverAlert(title, text, icon) {
  Swal.fire({
    title: title,
    html: `
      ${text}<br><br>
      Your score: ${score}<br>
      Opponent's score: ${opponentState.score}

    `,
    icon: icon,
    confirmButtonText: "Play Again",
  }).then((result) => {
    if (result.isConfirmed) {
      startMultiplayer();
    }
  });
}

function startMultiplayer() {
  socket = io();
  // Frontend code

  const queryString = window.location.search;


  const urlParams = new URLSearchParams(queryString);

  const matchId = urlParams.get('matchId');

  socket.emit("joinRoom", { playerName: "PlayerName", roomId: matchId });
  showSearchingState();

  // setupMultiplayerListeners(socket, playerName);
  // loop();
}
