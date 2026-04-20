import { Router } from 'express';

import {
    getMeController,
    loginController,
    registerController,
    verifyEmail,
} from '../controllers/auth.controller.js';

import {
    registerValidator,
    validateRequest,
} from '../validators/auth.validator.js';

import { authUser } from '../middlewares/auth.middleware.js';

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

/**
 * @route GET /api/auth/get-me
 * @description get the user details using token
 * @access Public
 * @body none
 */
authRoutes.get('/get-me', authUser, getMeController);

export default authRoutes;
