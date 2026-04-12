import { Server, Socket } from "socket.io";

export const registerTypingEvents = (io: Server, socket: Socket) => {

  socket.on("typing_start", () => {
    try {
      const userId = socket.data.userId;
      const roomId = socket.data.currentRoom;

      if (!userId || !roomId) return;

      // notify others in room
      socket.to(roomId).emit("user_typing", {
        userId,
      });

    } catch (err) {
      console.error("typing_start error:", err);
    }
  });

  socket.on("typing_stop", () => {
    try {
      const userId = socket.data.userId;
      const roomId = socket.data.currentRoom;

      if (!userId || !roomId) return;

      socket.to(roomId).emit("user_stop_typing", {
        userId,
      });

    } catch (err) {
      console.error("typing_stop error:", err);
    }
  });

};