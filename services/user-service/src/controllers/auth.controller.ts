import { Response } from "express"; // Import for Request and Response types
import {
  RegisterRequest,
  LoginRequest,
} from "../interfaces/auth-request.interface"; // Import Login and Register Requests for Request types
import User from "../models/user.model"; // Import User interface and type
import Token from "../models/token.model";
import config from "../config/config";
import validator from "../utils/validator"; // Import validation functions
import logger from "../utils/logger"; // Import logger
import { JwtPayload, sign, verify } from "jsonwebtoken"; // Import sign function from jwt

export const register = async (req: RegisterRequest, res: Response) => {
  try {
    logger.info(`Registration attempt for email: ${req.body.email}`);

    const { error } = validator.validateUser(req.body);
    if (error) {
      logger.warn(
        `Validation error during registration for email: ${req.body.email}`
      );
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password, firstName, lastName } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      logger.warn(`User already exists: ${email}`);
      return res.status(400).json({ error: "User already exists" });
    }

    user = new User({ email, password, firstName, lastName }); // Use constructor
    await user.save();

    logger.info(`User registered successfully: ${email}`);

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      logger.error("JWT_SECRET is not defined");
      throw new Error("JWT_SECRET is not defined");
    }

    const token = sign({ id: user._id }, jwtSecret, { expiresIn: "1d" });

    logger.info(`JWT token created for user: ${email}`);

    res.status(201).json({
      message: "User is successfully registered.",
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    logger.error("Error in user registration:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const login = async (req: LoginRequest, res: Response) => {
  try {
    logger.info(`Login attempt for email: ${req.body.email}`);

    const { error } = validator.validateLogin(req.body);
    if (error) {
      logger.warn(`Validation error during login for email: ${req.body.email}`);
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      logger.warn(`Invalid email or password for email: ${email}`);
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const isMatch = await user.checkPassword(password);
    if (!isMatch) {
      logger.warn(`Invalid password for email: ${email}`);
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      logger.error("JWT_SECRET is not defined");
      throw new Error("JWT_SECRET is not defined");
    }

    const token = sign({ id: user._id }, jwtSecret, { expiresIn: "1d" });

    logger.info(`JWT token created for user: ${email}`);

    res.json({
      message: "User is successfully logged in.",
      token,
      user,
    });
  } catch (error) {
    logger.error("Error in user login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// export const logout = async (req: Request, res: Response) => {
//   try {
//     const authHeader = req.headers['authorization'];
//     if (!authHeader) {
//       return res.status(401).json({ error: 'Access denied. No token provided.' });
//     }

//     const token = authHeader.split(' ')[1];
//     if (!token) {
//       return res.status(401).json({ error: 'Access denied. Invalid token format.' });
//     }

//     // Verify the token using the named import
//     let decoded: JwtPayload;
//     try {
//       decoded = verify(token, config.jwtSecret as string) as JwtPayload;
//     } catch (err) {
//       return res.status(401).json({ error: 'Access denied. Invalid token.' });
//     }

//     const expirationDate = new Date(decoded.exp! * 1000); // Convert exp to Date, assume exp is always defined

//     // Add the token to the blacklist
//     await Token.create({
//       token,
//       expiresAt: expirationDate,
//     });

//     res.status(200).json({ message: 'Logged out successfully.' });
//   } catch (error) {
//     console.error('Error during logout:', error);
//     res.status(500).json({ error: 'Internal server error.' });
//   }
// };
