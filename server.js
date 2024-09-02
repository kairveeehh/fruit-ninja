const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("./"));

const rooms = new Map();

function createGameState() {
  return {
    fruits: [],
    scores: {},
    lives: {},
    swordX: {},
    swordY: {},
    players: new Map(),
  };
}

function gameLoop(roomId) {
  const gameState = rooms.get(roomId);
  if (!gameState) return;

  gameState.players.forEach((playerName, socketId) => {
    const opponentId = Array.from(gameState.players.keys()).find((id) => id !== socketId);
    if (opponentId) {
      io.to(opponentId).emit("updateOpponentState", {
        swordX: gameState.swordX[socketId],
        swordY: gameState.swordY[socketId],
        fruits: gameState.fruits[socketId],
        score: gameState.scores[socketId],
        lives: gameState.lives[socketId],
      });
    }
  });
}

io.on("connection", (socket) => {
  console.log("A user connected");

  // Fetch the matchId and playerName from query params
  const { matchId, playerName } = socket.handshake.query;
  let currentRoom = matchId; // Use matchId as the room name

  if (!rooms.has(currentRoom)) {
    rooms.set(currentRoom, createGameState());
  }

  socket.join(currentRoom);

  const gameState = rooms.get(currentRoom);
  gameState.players.set(socket.id, playerName);
  gameState.scores[socket.id] = 0;
  gameState.lives[socket.id] = 26;
  gameState.swordX[socket.id] = 0;
  gameState.swordY[socket.id] = 0;
  gameState.fruits[socket.id] = [];

  socket.emit("joinedRoom", { roomId: currentRoom });
  io.to(currentRoom).emit("playerConnected", Array.from(gameState.players.values()));

  // Start the game only if there are exactly 2 players in the same room (matchId)
  if (gameState.players.size === 2) {
    io.to(currentRoom).emit("startGame");
    setInterval(() => gameLoop(currentRoom), 1000 / 60); // 60 FPS
  }

  socket.on("updateOpponentData", (data) => {
    const opponentId = Array.from(gameState.players.keys()).find((id) => id !== socket.id);
    if (opponentId) {
      io.to(opponentId).emit("updateOpponentState", data);
    }
  });
 
  socket.on("disconnect", () => {
    console.log("A player disconnected");

    if (!currentRoom) return;

    const gameState = rooms.get(currentRoom);
    if (!gameState) return;

    io.to(currentRoom).emit("playerDisconnected", {
      roomId: currentRoom,
      disconnectedPlayerName: gameState.players.get(socket.id),
    });

    gameState.players.delete(socket.id);
    delete gameState.scores[socket.id];
    delete gameState.lives[socket.id];
    delete gameState.swordX[socket.id];
    delete gameState.swordY[socket.id];
    delete gameState.fruits[socket.id];

    if (gameState.players.size === 1) {
      const winningPlayerName = Array.from(gameState.players.values())[0];
      io.to(currentRoom).emit("gameOver", {
        roomId: currentRoom,
        winner: winningPlayerName,
      });
    } else if (gameState.players.size === 0) {
      rooms.delete(currentRoom);
    }

    socket.leave(currentRoom);
  });

  socket.on("gameOver", (data) => {
    if (currentRoom) {
      io.to(currentRoom).emit("gameOver", {
        roomId: currentRoom,
      });
    }
  });

  socket.on("updateScore", (data) => {
    if (!currentRoom) return;
    const gameState = rooms.get(currentRoom);
    if (gameState) {
      gameState.scores[socket.id] = data.score;
    }
  });

  socket.on("leaveRoom", () => {
    if (currentRoom) {
      const gameState = rooms.get(currentRoom);
      if (gameState) {
        gameState.players.delete(socket.id);
        if (gameState.players.size === 0) {
          rooms.delete(currentRoom);
        }
      }
      socket.leave(currentRoom);
      currentRoom = null;
    }
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
