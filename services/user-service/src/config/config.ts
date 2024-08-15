import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

interface Config {
  port: number;
  mongoURI: string;
  jwtSecret: string;
  stripeSecretKey: string;
}

const config: Config = {
  port: parseInt(process.env.PORT || '3000', 10),
  mongoURI: process.env.MONGO_URI as string,
  jwtSecret: process.env.JWT_SECRET as string,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY as string,
};

// Ensure that critical environment variables are defined
if (!config.mongoURI || !config.jwtSecret || !config.stripeSecretKey) {
  throw new Error('Missing required environment variables.');
}

export default config;
