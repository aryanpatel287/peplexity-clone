import redis from '../config/cache.js';
import userModel from '../models/user.model.js';
import { sendEmail } from '../services/mail.service.js';
import {
    getVerificationEmailTemplate,
    getForgotPasswordEmailTemplate,
    getVerificationSuccessPage,
    getAlreadyVerifiedPage,
} from '../utils/emailTemplates.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

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
            process.env.JWT_SECRET,
        );

        const emailVerificationLink = ` http://localhost:${process.env.SERVER_PORT}/api/auth/verify-email?token=${emailVerificationToken}`;

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

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findOne({ email: decodedToken.email });

    if (!user) {
        res.status(404).json({
            message: 'Invalid token',
            success: false,
            error: 'user not found',
        });
    }

    if (user.verified) {
        const loginLink = `${process.env.CLIENT_ORIGINS}/login`;
        return res.send(getAlreadyVerifiedPage(user.username, loginLink));
    }

    user.verified = true;
    await user.save();

    const loginLink = `${process.env.CLIENT_ORIGINS}/login`;
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
        process.env.JWT_SECRET,
        { expiresIn: '7d' },
    );

    res.cookie('token', token);
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
        const loginLink = `${process.env.CLIENT_ORIGINS}/login`;
        return res.send(getAlreadyVerifiedPage(user.username, loginLink));
    }

    const emailVerificationToken = jwt.sign(
        {
            email: normalizedEmail,
        },
        process.env.JWT_SECRET,
    );

    const emailVerificationLink = `http://localhost:${process.env.SERVER_PORT}/api/auth/verify-email?token=${emailVerificationToken}`;

    await sendEmail({
        to: normalizedEmail,
        subject: 'Verify Your Email - Perplexity',
        html: getVerificationEmailTemplate(user.username, emailVerificationLink),
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

    res.clearCookie('token');

    await redis.set(token, Date.now().toString(), 'EX', 3600 * 24);

    return res.status(200).json({
        message: 'Logged out successfully',
        success: true,
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
        process.env.JWT_SECRET,
        { expiresIn: '1d' },
    );

    const emailVerificationLink = `${process.env.CLIENT_ORIGINS}/update-password?token=${emailVerificationToken}`;

    const html = getForgotPasswordEmailTemplate(user.username, emailVerificationLink);

    await sendEmail({
        to: normalizedEmail,
        subject: 'Reset Password',
        html: html,
    });

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
    console.log(token);
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
        decodedToken = jwt.verify(token, process.env.JWT_SECRET);
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
    getMeController,
    resendVerificationEmail,
    logoutController,
    forgotPasswordEmail,
    updatePasswordControlller,
};
