import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { DatabaseService } from '../services/DatabaseService';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export const createAuthMiddleware = (database: DatabaseService) => {
  const authService = new AuthService();

  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const decoded = authService.verifyToken(token);
      if (!decoded) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      const user = await database.getUserById(decoded.userId);
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      req.user = {
        id: user.id,
        email: user.email,
        name: user.name
      };

      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};
