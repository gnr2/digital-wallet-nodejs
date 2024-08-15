import { Router } from 'express';
import { register, login } from '../controllers/auth.controller';

// Create a new router instance
const router = Router();

// Define the routes and link them to controller methods
router.post('/register', register);
router.post('/login', login);

// Export the router
export default router;
