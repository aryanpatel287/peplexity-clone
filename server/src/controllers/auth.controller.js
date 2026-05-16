import redis from '../config/cache.js';
import userModel from '../models/user.model.js';
import chatModel from '../models/chat.model.js';
import { sendEmail } from '../services/mail/mail.service.js';
import {
    getVerificationEmailTemplate,
    getForgotPasswordEmailTemplate,
    getVerificationSuccessPage,
    getAlreadyVerifiedPage,
} from '../utils/emailTemplates.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import envConfig from '../config/envconfig.js';
import { randomUUID } from 'crypto';

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

/**
 * @description Register a user
 * @route POST /api/auth/register
 * @access Public
 * @body {username,email,password}
 */
async function registerController(req, res) {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: 'username, email and password are required',
                success: false,
                error: 'username, email and password are required',
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const normalizedUsername = username.trim();

        if (!normalizedUsername || !normalizedEmail) {
            return res.status(400).json({
                message: 'username, email and password are required',
                success: false,
                error: 'username, email and password are required',
            });
        }

        const existingUser = await userModel.findOne({
            $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
        });

        if (existingUser) {
            if (existingUser.email === normalizedEmail) {
                return res.status(409).json({
                    message: 'email already exists',
                    success: false,
                    error: 'email already exists',
                });
            }

            return res.status(409).json({
                message: 'username already exists',
                success: false,
                error: 'username already exists',
            });
        }

        const user = await userModel.create({
            username: normalizedUsername,
            email: normalizedEmail,
            password,
        });

        const emailVerificationToken = jwt.sign(
            {
                email: normalizedEmail,
            },
            envConfig.JWT_SECRET,
        );

        const emailVerificationLink = `${serverBaseUrl}/api/auth/verify-email?token=${emailVerificationToken}`;

        await sendEmail({
            to: normalizedEmail,
            subject: 'Welcome to Perplexity - Verify Your Email',
            html: getVerificationEmailTemplate(username, emailVerificationLink),
        });

        return res.status(200).json({
            message: 'user registered successfully',
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: 'failed to register user',
            success: false,
            error,
        });
    }
}

/**
 * @description Verify the registered email
 * @route POST /api/auth/verifiy-email?token={verificationToken}
 * @access Public
 * @body none
 */
async function verifyEmail(req, res) {
    const { token } = req.query;

    const decodedToken = jwt.verify(token, envConfig.JWT_SECRET);

    const user = await userModel.findOne({ email: decodedToken.email });

    if (!user) {
        res.status(404).json({
            message: 'Invalid token',
            success: false,
            error: 'user not found',
        });
    }

    if (user.verified) {
        const loginLink = `${envConfig.CLIENT_ORIGIN}/login`;
        return res.send(getAlreadyVerifiedPage(user.username, loginLink));
    }

    user.verified = true;
    await user.save();

    const loginLink = `${envConfig.CLIENT_ORIGIN}/login`;
    res.send(getVerificationSuccessPage(user.username, loginLink));
}

/**
 * @description login a user
 * @route POST /api/auth/login
 * @access Public
 * @body {username,email,password}
 */
async function loginController(req, res) {
    const { username, email, password } = req.body;

    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedUsername = username?.trim();

    if (!normalizedUsername && !normalizedEmail) {
        return res.status(400).json({
            message: 'username, email and password are required',
            success: false,
            error: 'username, email and password are required',
        });
    }

    const user = await userModel
        .findOne({
            $or: [{ username: normalizedUsername }, { email: normalizedEmail }],
        })
        .select('+password');

    if (!user) {
        return res.status(404).json({
            message: 'Invalid credentials',
            success: false,
            error: 'user not found',
        });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
        return res.status(401).json({
            message: 'Invalid credentials',
            success: false,
            error: 'Invalid password',
        });
    }

    if (!user.verified) {
        return res.status(401).json({
            message: 'Please verify your registered email',
            success: false,
            error: 'user email not verified',
        });
    }

    const token = jwt.sign(
        {
            id: user._id,
            username: user.username,
        },
        envConfig.JWT_SECRET,
        { expiresIn: '7d' },
    );

    res.cookie('token', token, getAuthCookieOptions(USER_TOKEN_MAX_AGE_MS));
    return res.status(200).json({
        message: 'logged in successfully',
        success: true,
        user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            verified: user.verified,
        },
    });
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
 * @description resend the email verification link to the registered user
 * @route GET /api/auth/resend-verify-email
 * @access Public
 * @body {email}
 */
async function resendVerificationEmail(req, res) {
    const { email } = req.body;

    const normalizedEmail = email.trim().toLowerCase();

    if (!email) {
        return res.status(400).json({
            message: 'Registered email is required',
            success: false,
            error: 'no email provided',
        });
    }

    const user = await userModel.findOne({ email: normalizedEmail });
    if (!user) {
        return res.status(404).json({
            message: 'Invalid credentials',
            success: false,
            error: 'user not found',
        });
    }

    if (user.verified) {
        const loginLink = `${envConfig.CLIENT_ORIGIN}/login`;
        return res.send(getAlreadyVerifiedPage(user.username, loginLink));
    }

    const emailVerificationToken = jwt.sign(
        {
            email: normalizedEmail,
        },
        envConfig.JWT_SECRET,
    );

    const emailVerificationLink = `${serverBaseUrl}/api/auth/verify-email?token=${emailVerificationToken}`;

    await sendEmail({
        to: normalizedEmail,
        subject: 'Verify Your Email - Perplexity',
        html: getVerificationEmailTemplate(
            user.username,
            emailVerificationLink,
        ),
    });

    return res.status(200).json({
        message: 'Verification link sent registered email successfully',
        success: true,
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

    await redis.set(token, Date.now().toString(), 'EX', 3600 * 24);

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

    return res.status(200).json({
        message: 'Guest chats claimed successfully',
        success: true,
        claimedCount: result.modifiedCount ?? 0,
    });
}

/**
 * @route POST /api/auth/forgot-password
 * @description send an email to reset the password
 * @access Public
 * @body email
 */
async function forgotPasswordEmail(req, res) {
    const { email } = req.body;
    const normalizedEmail = email.trim();

    if (!email) {
        return res.status(400).json({
            message: 'Email is required',
            success: false,
            error: 'Email is required',
        });
    }

    const user = await userModel.findOne({ email: normalizedEmail });

    if (!user) {
        return res.status(404).json({
            message: 'Invalid credentials',
            success: false,
            error: 'user not found',
        });
    }

    const emailVerificationToken = jwt.sign(
        {
            id: user._id,
            email: user.email,
        },
        envConfig.JWT_SECRET,
        { expiresIn: '1d' },
    );

    const emailVerificationLink = `${envConfig.CLIENT_ORIGIN}/update-password?token=${emailVerificationToken}`;

    const html = getForgotPasswordEmailTemplate(
        user.username,
        emailVerificationLink,
    );

    try {
        await sendEmail({
            to: normalizedEmail,
            subject: 'Reset Password',
            html: html,
        });
    } catch (error) {
        console.error('Error sending forgot password email: ', error);
        return res.status(500).json({
            message: 'Failed to send reset password email',
            success: false,
        });
    }

    return res.status(200).json({
        message: 'Reset Password link sent to email',
        success: true,
    });
}

/**
 * @route PATCH /api/auth/update-password?token={token-sent-on-email}
 * @description reset password of registered email
 * @access Private
 * @body password
 */
async function updatePasswordControlller(req, res) {
    const { token } = req.query;
    const { password } = req.body;

    if (!token) {
        return res.status(401).json({
            message: 'Invalid token',
            success: false,
            error: 'No token provided',
        });
    }

    let decodedToken = '';
    try {
        decodedToken = jwt.verify(token, envConfig.JWT_SECRET);
    } catch (error) {
        return res.status(401).json({
            message: 'Invalid token',
            success: false,
            error: 'No token provided',
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await userModel.findByIdAndUpdate(
            decodedToken.id,
            { password: hashedPassword },
            { new: true, runValidators: true },
        );

        if (!user) {
            return res.status(404).json({
                message: 'User not found',
                success: false,
                error: 'user not found',
            });
        }

        return res.status(204).json({
            message: 'Password reset successfull',
            success: true,
        });
    } catch (error) {
        return res.status(401).json({
            message: 'Reset password failed',
            success: false,
            error: 'Reset password failed',
        });
    }
}

export {
    registerController,
    verifyEmail,
    loginController,
    createGuestSession,
    getMeController,
    resendVerificationEmail,
    logoutController,
    claimGuestChats,
    forgotPasswordEmail,
    updatePasswordControlller,
};
