let io;

const initSocket = (server) => {
  const { Server } = require("socket.io");
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.auth?.userId;
    if (userId) {
      socket.join(userId.toString());
      console.log(`User connected: ${userId}`);
    }

    socket.on("disconnect", () => {
      if (userId) {
        console.log(`User disconnected: ${userId}`);
      }
    });
  });
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io is not initialized");
  }
  return io;
};

module.exports = { initSocket, getIO };
