import { Router } from 'express';

import {
    forgotPasswordEmail,
    getMeController,
    loginController,
    logoutController,
    registerController,
    resendVerificationEmail,
    updatePasswordControlller,
    verifyEmail,
} from '../controllers/auth.controller.js';

import {
    forgotPasswordValidator,
    loginValidator,
    registerValidator,
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
authRoutes.post('/login', loginValidator, loginController);

/**
 * @route GET /api/auth/get-me
 * @description get the user details using token
 * @access Public
 * @body none
 */
authRoutes.get('/get-me', authUser, getMeController);

/**
 * @route GET /api/auth/resend-verify-email
 * @description resend the email verification link to the registered user
 * @access Public
 * @body {email}
 */
authRoutes.post('/resend-verify-email', resendVerificationEmail);

/**
 * @route POST /api/auth/logout
 * @description logout a user
 * @access Public
 * @body none
 */
authRoutes.post('/logout', authUser, logoutController);

/**
 * @route POST /api/auth/forgot-password
 * @description send an email to reset the password
 * @access Public
 * @body email
 */
authRoutes.post(
    '/forgot-password',
    forgotPasswordValidator,
    forgotPasswordEmail,
);

/**
 * @route PATCH /api/auth/update-password?token={token-sent-on-email}
 * @description reset password of registered email
 * @access Private
 * @body password
 */
authRoutes.patch('/update-password', updatePasswordControlller);

export default authRoutes;
