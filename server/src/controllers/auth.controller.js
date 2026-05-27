import redis from '../config/cache.js';
import userModel from '../models/user.model.js';
import chatModel from '../models/chat.model.js';
import { sendEmail } from '../services/mail/mail.service.js';
import {
    getVerificationEmailTemplate,
    getForgotPasswordEmailTemplate,
    getVerificationSuccessPage,
    getAlreadyVerifiedPage,
    getMagicLinkEmailTemplate,
} from '../utils/emailTemplates.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import envConfig from '../config/envconfig.js';
import { randomUUID } from 'crypto';
import { sendResponse, sendTokenResponse } from '../utils/response.utlis.js';
import {
    deleteOtp,
    generateOtp,
    issueOtp,
    OTP_PURPOSES,
    resendOtp,
    verifyOtp,
} from '../utils/otp.utils.js';

const serverBaseUrl = (
    envConfig.SERVER_URL || `http://localhost:${envConfig.SERVER_PORT}`
).replace(/\/$/, '');
const USER_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const GUEST_TOKEN_MAX_AGE_MS = 24 * 60 * 60 * 1000;

function getAuthCookieOptions(maxAge) {
    return {
        ...envConfig.AUTH_COOKIE_OPTIONS,
        maxAge,
    };
}

async function sendSignUpEmailController(req, res) {
    try {
        const { email, username } = req.body;
        const normalizedEmail = email.trim().toLowerCase();
        const normalizedUsername = username.trim();

        if (!normalizedEmail || !normalizedUsername) {
            return res.status(400).json({
                message: 'email and username are required',
                success: false,
                error: 'email and username are required',
            });
        }

        const registerToken = jwt.sign(
            {
                email: normalizedEmail,
                username: normalizedUsername,
            },
            envConfig.JWT_SECRET,
        );

        const registerLink = `${serverBaseUrl}/api/auth/verify-email?register=${registerToken}`;

        await issueOtp({
            email: normalizedEmail,
            username: normalizedUsername,
            purpose: OTP_PURPOSES.SIGN_UP,
            subject: 'Sign in to Perplexity Ai',
            buildHtml: (otp) =>
                getMagicLinkEmailTemplate(
                    normalizedUsername,
                    registerLink,
                    otp,
                ),
        });

        return sendResponse({
            res,
            statusCode: 200,
            message: 'Registration email sent successfully',
            success: true,
        });
    } catch (error) {
        console.log('Error in registerEmailController:', error);

        return res.status(500).json({
            message: 'failed to register user',
            success: false,
            error,
        });
    }
}

async function verifySignUpEmailController(req, res) {
    const { register } = req.query;

    let email,
        otp,
        username,
        switchCase = 'tokenSignUp';

    if (!register) {
        switchCase = 'otpSignUp';
        ({ otp, email, username } = req.body);

        if (!otp || !email || !username) {
            return sendResponse({
                res,
                statusCode: 400,
                message: 'email, username and otp are required',
                success: false,
                error: 'email, username and otp are required',
            });
        }
    }

    if (!register && !otp) {
        return sendResponse({
            res,
            statusCode: 400,
            message: 'Invalid request',
            success: false,
            error: 'register token and otp are required here',
        });
    }

    switch (switchCase) {
        case 'tokenSignUp': {
            let decodedToken;
            try {
                decodedToken = jwt.verify(register, envConfig.JWT_SECRET);
            } catch (error) {
                return sendResponse({
                    res,
                    statusCode: 400,
                    message: 'Invalid or expired registration token',
                    success: false,
                    error: 'Invalid or expired registration token',
                });
            }

            if (!decodedToken?.email.trim() || !decodedToken?.username) {
                return sendResponse({
                    res,
                    statusCode: 400,
                    message: 'Invalid registration token',
                    success: false,
                    error: 'Invalid registration token',
                });
            }

            email = decodedToken.email.trim().toLowerCase();
            username = decodedToken.username.trim();
            await deleteOtp({ email, purpose: OTP_PURPOSES.SIGN_UP });

            break;
        }

        case 'otpSignUp': {
            const isOtpValid = await verifyOtp({
                email: email.trim().toLowerCase(),
                purpose: OTP_PURPOSES.SIGN_UP,
                otp,
            });

            if (!isOtpValid.ok) {
                return sendResponse({
                    res,
                    statusCode: 400,
                    message: 'Invalid or expired OTP',
                    success: false,
                    error: isOtpValid.reason,
                });
            }

            break;
        }
    }

    const user = await userModel.findOne({ email });

    if (!user) {
        try {
            await userModel.create({
                username,
                email,
            });
        } catch (error) {
            console.log(
                'Error creating user in verifySignUpEmailController:',
                error,
            );
            return sendResponse({
                res,
                statusCode: 500,
                message: 'Failed to create user',
                success: false,
                error: 'Failed to create user',
            });
        }
    }

    const redirectLink = `${envConfig.CLIENT_ORIGIN}/`;
    res.send(getVerificationSuccessPage(username, redirectLink));
}

/**
 * @description Create or reuse a guest session
 * @route POST /api/auth/guest-session
 * @access Public
 */
async function createGuestSession(req, res) {
    const existingToken = req.cookies.guest_token;

    if (existingToken) {
        try {
            const decoded = jwt.verify(existingToken, envConfig.JWT_SECRET);
            if (decoded?.guestId && decoded?.isGuest) {
                return res.status(200).json({
                    message: 'guest session active',
                    success: true,
                });
            }
        } catch (error) {
            console.log(error);
        }
    }

    const guestId = randomUUID();
    const guestToken = jwt.sign(
        {
            guestId,
            isGuest: true,
        },
        envConfig.JWT_SECRET,
        { expiresIn: '1d' },
    );

    res.cookie(
        'guest_token',
        guestToken,
        getAuthCookieOptions(GUEST_TOKEN_MAX_AGE_MS),
    );

    return res.status(201).json({
        message: 'guest session created',
        success: true,
        guestId,
    });
}

/**
 * @description get the user details using token
 * @route GET /api/auth/get-me
 * @access Public
 * @body none
 */
async function getMeController(req, res) {
    const userId = req.user.id;

    if (!userId) {
        return res.status(401).json({
            message: 'unauthorized access',
            success: true,
            error: 'user details not attached in the req',
        });
    }

    const user = await userModel.findById(userId);

    if (!user) {
        return res.status(404).json({
            message: 'user not found',
            success: false,
            error: 'user not found',
        });
    }

    return res.status(200).json({
        message: 'user found successfully',
        success: true,
        user,
    });
}

/**
 * @description logout a user
 * @route POST /api/auth/logout
 * @access Public
 * @body none
 */
async function logoutController(req, res) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({
            message: 'Invalid token',
            success: false,
            error: 'No token provided',
        });
    }

    res.clearCookie('token', envConfig.AUTH_COOKIE_OPTIONS);

    await redis.set(
        `perplexity-blacklist:${token}`,
        'true',
        'EX',
        24 * 60 * 60,
    ); // TTL: 1day

    return res.status(200).json({
        message: 'Logged out successfully',
        success: true,
    });
}

/**
 * @description Claim guest chats after login
 * @route POST /api/auth/claim-guest-chats
 * @access Private
 */
async function claimGuestChats(req, res) {
    const guestToken = req.cookies.guest_token;

    if (!guestToken) {
        return res.status(400).json({
            message: 'guest session not found',
            success: false,
            error: 'guest token missing',
        });
    }

    let decoded;
    try {
        decoded = jwt.verify(guestToken, envConfig.JWT_SECRET);
    } catch (error) {
        return res.status(401).json({
            message: 'Invalid guest token',
            success: false,
            error: 'Invalid guest token',
        });
    }

    if (!decoded?.guestId || !decoded?.isGuest) {
        return res.status(400).json({
            message: 'Invalid guest session',
            success: false,
            error: 'Invalid guest session',
        });
    }

    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({
            message: 'unauthorized access',
            success: false,
            error: 'user details not attached in the req',
        });
    }

    const result = await chatModel.updateMany(
        { guestId: decoded.guestId },
        {
            $set: { user: userId },
            $unset: { guestId: '' },
        },
    );

    res.clearCookie('guest_token', envConfig.AUTH_COOKIE_OPTIONS);

    await redis.set(
        `perplexity-blacklist:${guestToken}`,
        'true',
        'EX',
        24 * 60 * 60,
    );

    return res.status(200).json({
        message: 'Guest chats claimed successfully',
        success: true,
        claimedCount: result.modifiedCount ?? 0,
    });
}

export {
    sendSignUpEmailController,
    verifySignUpEmailController,
    createGuestSession,
    getMeController,
    logoutController,
    claimGuestChats,
};
