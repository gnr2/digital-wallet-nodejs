import dotenv from 'dotenv';
import { Config } from '../interfaces/config.interface';

// Load environment variables from .env file
dotenv.config();

const config: Config = {
  port: parseInt(process.env.PORT || '3000', 10), // Optional, default to 3000
  mongoURI: process.env.MONGO_URI as string, // Required
  jwtSecret: process.env.JWT_SECRET as string, 
  stripeSecretKey: process.env.STRIPE_SECRET_KEY as string, // Required
};

// Ensure that critical environment variables are defined
if (!config.mongoURI || !config.jwtSecret || !config.stripeSecretKey) {
  throw new Error('Missing required environment variables.');
}

export default config;
