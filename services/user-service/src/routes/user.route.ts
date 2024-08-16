import express from 'express';
import { getUser, getAllUsers, updateUser, deleteUser } from '../controllers/user.controller';
import authenticateJWT from '../middleware/auth.middleware';
import checkTokenBlacklist from '../middleware/tokenBlacklist.middleware';

const router = express.Router();

router.use(authenticateJWT);
router.use(checkTokenBlacklist);
router.get('/:id', getUser);
router.get('/', getAllUsers);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
