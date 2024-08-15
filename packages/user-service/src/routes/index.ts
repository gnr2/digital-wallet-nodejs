import { Router } from 'express';
import authRoutes from './auth.routes';
// import walletRoutes from './wallet.routes';
// import stripeRoutes from './stripe.routes';

// Create a new router instance
const router = Router();

// Use the routes for different paths
router.use('/auth', authRoutes);
// router.use('/wallet', walletRoutes);
// router.use('/stripe', stripeRoutes);

// Export the router as the default export
export default router;
