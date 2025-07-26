const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Servidor TELEBOLITO corriendo en puerto ${PORT}`);
});

let players = {};
let watchers = [];

io.on("connection", (socket) => {
  console.log("Usuario conectado:", socket.id);

  if (Object.keys(players).length < 2) {
    players[socket.id] = { id: socket.id };
    socket.emit("player", { id: socket.id });
  } else {
    watchers.push(socket.id);
    socket.emit("watcher", { id: socket.id });
  }

  socket.on("move", (data) => {
    socket.broadcast.emit("move", data);
  });

  socket.on("disconnect", () => {
    console.log("Usuario desconectado:", socket.id);
    if (players[socket.id]) {
      delete players[socket.id];
    } else {
      watchers = watchers.filter((id) => id !== socket.id);
    }
    socket.broadcast.emit("user-disconnected", socket.id);
  });
});