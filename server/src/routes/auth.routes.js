import { Router } from 'express';

import {
    getMeController,
    logoutController,
    createGuestSession,
    claimGuestChats,
    sendSignUpEmailController,
    verifySignUpEmailController,
} from '../controllers/auth.controller.js';

import { SignUpEmailValidator } from '../validators/auth.validator.js';

import { authUser } from '../middlewares/auth.middleware.js';

const authRouter = Router();

authRouter.post(
    '/signup-email',
    SignUpEmailValidator,
    sendSignUpEmailController,
);

/**
 * @route POST /api/auth/verifiy-email?token={verificationToken}
 * @description Verify the registered email
 * @access Public
 * @body none
 */
authRouter.get('/verify-email', verifySignUpEmailController);

/**
 * @route POST /api/auth/guest-session
 * @description Create or reuse a guest session
 * @access Public
 */
authRouter.post('/guest-session', createGuestSession);

/**
 * @route GET /api/auth/get-me
 * @description get the user details using token
 * @access Public
 * @body none
 */
authRouter.get('/get-me', authUser, getMeController);

/**
 * @route POST /api/auth/logout
 * @description logout a user
 * @access Public
 * @body none
 */
authRouter.post('/logout', authUser, logoutController);

/**
 * @route POST /api/auth/claim-guest-chats
 * @description Claim guest chats after login
 * @access Private
 */
authRouter.post('/claim-guest-chats', authUser, claimGuestChats);

export default authRouter;
