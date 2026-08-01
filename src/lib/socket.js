import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';

let socket = null;
let activeToken = null;

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (typeof window !== 'undefined' ? window.location.origin : '');

function attachDebugListeners(instance) {
  instance.on('connect', () => {
    console.info('[socket] connected', instance.id);
  });
  instance.on('disconnect', (reason) => {
    console.warn('[socket] disconnected:', reason);
  });
  instance.on('connect_error', (err) => {
    console.warn('[socket] connect_error:', err.message);
  });
}

export function connectSocket(token) {
  if (socket?.connected) return socket;
  if (socket) socket.disconnect();
  socket = io(SOCKET_URL || '/', {
  if (socket) {
    if (token && token !== activeToken) {
      socket.removeAllListeners();
      socket.disconnect();
      socket = null;
      activeToken = null;
    } else {
      return socket;
    }
  }

  activeToken = token ?? null;
  socket = io(SOCKET_URL || undefined, {
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    auth: token ? { token } : undefined,
    withCredentials: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
    reconnectionAttempts: Infinity,
  });

  attachDebugListeners(socket);

  return socket;
}

export function disconnectSocket() {
  if (!socket) return;
  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
  activeToken = null;
}

export function getSocket() {
  return socket;
}

export default { connectSocket, disconnectSocket, getSocket };
