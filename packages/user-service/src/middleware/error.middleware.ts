import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

interface MongooseValidationError extends Error {
  errors: Record<string, { message: string }>;
}

interface MongooseDuplicateKeyError extends Error {
  code: number;
  keyValue: Record<string, string>;
}

interface JWTError extends Error {
  name: string;
}

const errorHandler = (err: Error | MongooseValidationError | MongooseDuplicateKeyError | JWTError, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.stack || err.message);

  // Mongoose validation error
  if (err.name === 'ValidationError' && 'errors' in err) {
    const errors = Object.values(err.errors).map(error => error.message);
    return res.status(400).json({ error: errors });
  }

  // Mongoose duplicate key error
  if ('code' in err && err.code === 11000 && 'keyValue' in err) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ error: `${field} already exists.` });
  }

  // JWT authentication error
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // Default to 500 server error
  res.status(500).json({ error: 'Internal Server Error' });
};

export default errorHandler;
