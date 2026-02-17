import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSettings } from './useSettings';

const getSocketUrl = () => {
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL.replace('/api', '');
    const { protocol, hostname } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') return 'http://localhost:5000';
    return `${protocol}//${hostname}:5000`;
};

const SOCKET_URL = getSocketUrl();

export const useSocket = (sessionId?: string) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!sessionId) return;

        // Initialize socket
        const socketInstance = io(SOCKET_URL, {
            transports: ['websocket'],
            autoConnect: true,
        });

        socketRef.current = socketInstance;

        socketInstance.on('connect', () => {
            console.log('Socket connected:', socketInstance.id);
            setIsConnected(true);
            socketInstance.emit('join_session', sessionId);
        });

        socketInstance.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, [sessionId]);

    return { socket, isConnected };
};
