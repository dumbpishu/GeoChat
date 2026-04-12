import { Socket, Server } from "socket.io";
import { getRoom } from "../utils/room";
import { pubClient } from "../config/redis";

export const registerLocationEvents = (io: Server, socket: Socket) => {
    socket.on("update_location", async (data: { lat: number, long: number }) => {
        try {
            const { lat, long } = data;
    
            const userId = socket.data.userId;
            const newRoom = getRoom(lat, long);
            const currentRoom = socket.data.currentRoom;
    
            if (currentRoom === newRoom) {
                return;
            }
    
            if (currentRoom) {
                socket.leave(currentRoom);
    
                const removeUser = await pubClient.sRem(`online_users:${currentRoom}`, userId);
    
                if (removeUser) {
                    const onlineUsersCount = await pubClient.sCard(`online_users:${currentRoom}`);
                    io.to(currentRoom).emit("online_users_count", onlineUsersCount);
                }
            }
    
            socket.join(newRoom);
            socket.data.currentRoom = newRoom;
    
            const addUser = await pubClient.sAdd(`online_users:${newRoom}`, userId);
    
            const onlineUsersCount = await pubClient.sCard(`online_users:${newRoom}`);
            
            socket.emit("online_users_count", onlineUsersCount);
    
            if (addUser) {
                socket.to(newRoom).emit("online_users_count", onlineUsersCount);
            }
    
            const messages = await pubClient.lRange(`chat:${newRoom}`, 0, 49);
            const parsedMessages = messages.map(msg => JSON.parse(msg));
            socket.emit("recent_messages", parsedMessages.reverse());
        } catch (error) {
            console.error("Error updating location:", error);
        }
    })
}