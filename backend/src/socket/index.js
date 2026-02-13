import { Server } from 'socket.io';
import prisma from '../config/database.js';

let io;

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*", // Allow all for development, restrict in production
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);

        socket.on('join_session', (sessionId) => {
            socket.join(sessionId);
            console.log(`User ${socket.id} joined session ${sessionId}`);
        });

        socket.on('send_message', async (data) => {
            // data: { sessionId, senderId, content, type, fileUrl, fileName, fileSize }
            const { sessionId, senderId, content, type, fileUrl, fileName, fileSize } = data;
            const messageType = type || 'TEXT';

            try {
                // Check if session is closed
                const session = await prisma.chatSession.findUnique({
                    where: { id: sessionId },
                    select: { status: true }
                });

                if (!session || session.status === 'CLOSED') {
                    console.log(`Rejected message for closed/non-existent session: ${sessionId}`);
                    return;
                }

                // Save to DB
                const message = await prisma.chatMessage.create({
                    data: {
                        sessionId,
                        senderId,
                        content: content || '',
                        type: messageType,
                        fileUrl: fileUrl || null,
                        fileName: fileName || null,
                        fileSize: fileSize || null,
                        isRead: false
                    }
                });

                // Broadcast to room
                io.to(sessionId).emit('receive_message', message);
            } catch (error) {
                console.error("Error saving message:", error);
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected', socket.id);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};
