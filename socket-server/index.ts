import 'dotenv/config';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { authenticateSocket, AuthenticatedSocket } from './middleware/auth';
import { setupRoomHandlers } from './handlers/room';
import { setupPresenceHandlers } from './handlers/presence';

const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// Create HTTP server
const httpServer = createServer((req, res) => {
  // Health check endpoint
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
    return;
  }

  res.writeHead(404);
  res.end();
});

// Create Socket.io server
const io = new Server(httpServer, {
  cors: {
    origin: CORS_ORIGIN.split(','),
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Apply authentication middleware
io.use(authenticateSocket);

// Handle connections
io.on('connection', (socket) => {
  const authSocket = socket as AuthenticatedSocket;
  console.log(`User ${authSocket.userId} connected (${authSocket.userEmail})`);

  // Setup handlers
  setupRoomHandlers(io, authSocket);
  setupPresenceHandlers(io, authSocket);

  // Send connection confirmation
  authSocket.emit('connected', {
    userId: authSocket.userId,
    email: authSocket.userEmail,
    name: authSocket.userName,
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`);
  console.log(`CORS origin: ${CORS_ORIGIN}`);
});
