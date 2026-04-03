import React, { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import { SocketContext } from './Context'
import { useAuth } from '@clerk/clerk-react'

const SocketProvider = (props) => {
  const { getToken } = useAuth()
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    let currentSocket;

    const initSocket = async () => {
      try {
        const token = await getToken()
        if (!token) {
          console.warn("No auth token available yet");
          return;
        }

        const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
        console.log("Initializing socket connection to:", API_BASE);
        
        const newSocket = io(API_BASE, {
          auth: {
            token: token
          },
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        })

        newSocket.on('connect', () => {
          console.log("Socket connected successfully:", newSocket.id);
        });

        newSocket.on('disconnect', (reason) => {
          console.warn("Socket disconnected:", reason);
        });

        // Handle authentication errors and refresh token
        newSocket.on('connect_error', async (err) => {
          if (err.message.includes("Authentication error") || err.message.includes("JWT is expired")) {
            console.log("Socket auth error, refreshing token...");
            const newToken = await getToken({ skipCache: true });
            if (newToken) {
              newSocket.auth.token = newToken;
              newSocket.connect();
            }
          }
        });

        setSocket(newSocket)
        currentSocket = newSocket;
      } catch (error) {
        console.error("Failed to initialize socket:", error);
      }
    }

    initSocket()

    return () => {
      if (currentSocket) {
        currentSocket.disconnect()
      }
    }
  }, [getToken])
  return (
    <SocketContext.Provider value={socket}>
      {props.children}
    </SocketContext.Provider>
  )
}

export { SocketProvider };
