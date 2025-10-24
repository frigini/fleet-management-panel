import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from '../services/AuthService';
import { DatabaseService } from '../services/DatabaseService';
import { LoginRequest, RegisterRequest, ResetPasswordRequest, ResetPasswordConfirm, AuthUser } from '../types';

const router = express.Router();

export const createAuthRoutes = (database: DatabaseService) => {
  const authService = new AuthService();

  // Register endpoint
  router.post('/register', async (req, res) => {
    try {
      const { email, name, password }: RegisterRequest = req.body;

      // Validation
      if (!email || !name || !password) {
        return res.status(400).json({ error: 'Email, name, and password are required' });
      }

      if (!authService.validateEmail(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      const passwordValidation = authService.validatePassword(password);
      if (!passwordValidation.valid) {
        return res.status(400).json({ error: passwordValidation.message });
      }

      // Check if user already exists
      const existingUser = await database.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: 'User with this email already exists' });
      }

      // Hash password and create user
      const hashedPassword = await authService.hashPassword(password);
      const userId = uuidv4();

      const newUser: Omit<AuthUser, 'createdAt'> = {
        id: userId,
        email,
        name,
        password: hashedPassword
      };

      await database.createUser(newUser);

      // Generate token and return response
      const token = authService.generateToken(userId, email);
      const authResponse = authService.createAuthResponse(
        { ...newUser, createdAt: new Date() },
        token
      );

      res.status(201).json(authResponse);
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Login endpoint
  router.post('/login', async (req, res) => {
    try {
      const { email, password }: LoginRequest = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // Find user
      const user = await database.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Verify password
      const isValidPassword = await authService.comparePassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Update last login
      await database.updateUserLastLogin(user.id);

      // Generate token and return response
      const token = authService.generateToken(user.id, user.email);
      const authResponse = authService.createAuthResponse(user, token);

      res.json(authResponse);
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Request password reset
  router.post('/forgot-password', async (req, res) => {
    try {
      const { email }: ResetPasswordRequest = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const user = await database.getUserByEmail(email);
      if (!user) {
        // Don't reveal whether email exists or not for security
        return res.json({ message: 'If the email exists, a reset link has been sent' });
      }

      // Generate reset token (expires in 1 hour)
      const resetToken = authService.generateResetToken();
      const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await database.setResetToken(email, resetToken, expiry);

      // In a real application, you would send an email here
      // For now, we'll just log it (in development only)
      if (process.env.NODE_ENV === 'development') {
        console.log(`Password reset token for ${email}: ${resetToken}`);
        console.log(`Reset URL: http://localhost:3000/reset-password?token=${resetToken}`);
      }

      res.json({ message: 'If the email exists, a reset link has been sent' });
    } catch (error) {
      console.error('Password reset request error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Reset password with token
  router.post('/reset-password', async (req, res) => {
    try {
      const { token, newPassword }: ResetPasswordConfirm = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({ error: 'Token and new password are required' });
      }

      const passwordValidation = authService.validatePassword(newPassword);
      if (!passwordValidation.valid) {
        return res.status(400).json({ error: passwordValidation.message });
      }

      // Find user by reset token
      const user = await database.getUserByResetToken(token);
      if (!user) {
        return res.status(400).json({ error: 'Invalid or expired reset token' });
      }

      // Hash new password and update
      const hashedPassword = await authService.hashPassword(newPassword);
      await database.updatePassword(user.id, hashedPassword);

      res.json({ message: 'Password reset successfully' });
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Verify token endpoint
  router.get('/verify', async (req, res) => {
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

      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      });
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
};
