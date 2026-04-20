import { Router } from 'express';
import {
    loginController,
    registerController,
    verifyEmail,
} from '../controllers/auth.controller.js';
import {
    registerValidator,
    validateRequest,
} from '../validators/auth.validator.js';

const authRoutes = Router();

/**
 * @route POST /api/auth/register
 * @description Register a user
 * @access Public
 * @body {username,email,password}
 */
authRoutes.post('/register', registerValidator, registerController);

/**
 * @route POST /api/auth/verifiy-email?token={verificationToken}
 * @description Verify the registered email
 * @access Public
 * @body none
 */
authRoutes.get('/verify-email', verifyEmail);

/**
 * @route POST /api/auth/login
 * @description login a user
 * @access Public
 * @body {username,email,password}
 */
authRoutes.post('/login', registerValidator, loginController);

export default authRoutes;
