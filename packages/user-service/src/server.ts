import express, { Application } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import routes from './routes';
import errorMiddleware from './middleware/error.middleware';
import dotenv from 'dotenv';

dotenv.config();

const app: Application = express();

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI as string;
if (!mongoUri) {
  throw new Error('MONGODB_URI environment variable is not defined');
}

mongoose.connect(mongoUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use(cors());
app.use(express.json());

// Use routes
app.use('/api', routes);

// Error handling middleware
app.use(errorMiddleware);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
