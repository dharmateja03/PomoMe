import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

export interface AuthenticatedSocket extends Socket {
  userId: number;
  userEmail: string;
  userName: string | null;
}

interface JWTPayload {
  id: string;
  email: string;
  name?: string;
}

export function authenticateSocket(socket: Socket, next: (err?: Error) => void) {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error('Authentication required'));
  }

  try {
    // NextAuth uses AUTH_SECRET to sign JWTs
    const secret = process.env.AUTH_SECRET;
    if (!secret) {
      return next(new Error('Server configuration error'));
    }

    const decoded = jwt.verify(token, secret) as JWTPayload;

    (socket as AuthenticatedSocket).userId = parseInt(decoded.id);
    (socket as AuthenticatedSocket).userEmail = decoded.email;
    (socket as AuthenticatedSocket).userName = decoded.name || null;

    next();
  } catch (error) {
    console.error('JWT verification failed:', error);
    next(new Error('Invalid token'));
  }
}
