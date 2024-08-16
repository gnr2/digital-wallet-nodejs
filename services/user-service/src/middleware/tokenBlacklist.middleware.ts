import { Request, Response, NextFunction } from 'express';
import Token from '../models/token.model';

const checkTokenBlacklist = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Access denied. Invalid token format.' });
    }

    const blacklistedToken = await Token.findOne({ token });
    if (blacklistedToken) {
        return res.status(401).json({ error: 'Token has been invalidated.' });
    }

    next();
};

export default checkTokenBlacklist;
