import userModel from '../models/user.model.js';
import { sendEmail } from '../services/mail.service.js';
import jwt from 'jsonwebtoken';

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
            subject: 'Welcome to Perplexity',
            html: ` <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; border:1px solid #eee; border-radius:8px; padding:24px;">
                        <h2 style="color:#4B6EF5;">Verify your email for Perplexity</h2>
                        <p>Hi <b>${username}</b>,</p>
                        <p>Thank you for registering on Perplexity! Please verify your email address to activate your account.</p>
                        <div style="text-align:center; margin:32px 0;">
                        <a href="${emailVerificationLink}" style="background:#4B6EF5; color:#fff; text-decoration:none; padding:12px 28px; border-radius:6px; display:inline-block; font-weight:bold;">
                            Verify Email
                        </a>
                        </div>
                        <p>If you did not sign up, you can ignore this email.</p>
                        <p style="margin-top:32px; color:#888; font-size:13px;">— The Perplexity Team</p>
                    </div>`,
        });

        return res.status(201).json({
            message: 'user registered successfully',
            user,
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
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; border:1px solid #eee; border-radius:8px; padding:24px;">
                <h2 style="color:#4B6EF5;">Email Already Verified</h2>
                <p>Hi <b>${user.username}</b>,</p>
                <p>Your email is already verified. You can log in to your account.</p>
                <div style="text-align:center; margin:32px 0;">
                    <a href="http://localhost:${process.env.SERVER_PORT}/login" style="background:#4B6EF5; color:#fff; text-decoration:none; padding:12px 28px; border-radius:6px; display:inline-block; font-weight:bold;">
                        Go to Login
                    </a>
                </div>
                <p>If you did not request this, you can ignore this email.</p>
                <p style="margin-top:32px; color:#888; font-size:13px;">— The Perplexity Team</p>
            </div>
        `;
        return res.send(html);
    }

    user.verified = true;
    await user.save();

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; border:1px solid #eee; border-radius:8px; padding:24px;">
            <h2 style="color:#4B6EF5;">Email Verified Successfully!</h2>
            <p>Hi <b>${user.username}</b>,</p>
            <p>Your email has been successfully verified. You can now log in to your account.</p>
            <div style="text-align:center; margin:32px 0;">
                <a href="http://localhost:${process.env.SERVER_PORT}/login" style="background:#4B6EF5; color:#fff; text-decoration:none; padding:12px 28px; border-radius:6px; display:inline-block; font-weight:bold;">
                    Go to Login
                </a>
            </div>
            <p>If you did not request this, you can ignore this email.</p>
            <p style="margin-top:32px; color:#888; font-size:13px;">— The Perplexity Team</p>
        </div>
    `;

    res.send(html);
}

/**
 * @description login a user
 * @route POST /api/auth/login
 * @access Public
 * @body {username,email,password}
 */
async function loginController(req, res) {
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
    });
}

async function resendEmailVerificationLink(req, res) {
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
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; border:1px solid #eee; border-radius:8px; padding:24px;">
                <h2 style="color:#4B6EF5;">Email Already Verified</h2>
                <p>Hi <b>${user.username}</b>,</p>
                <p>Your email is already verified. You can log in to your account.</p>
                <div style="text-align:center; margin:32px 0;">
                    <a href="http://localhost:${process.env.SERVER_PORT}/login" style="background:#4B6EF5; color:#fff; text-decoration:none; padding:12px 28px; border-radius:6px; display:inline-block; font-weight:bold;">
                        Go to Login
                    </a>
                </div>
                <p>If you did not request this, you can ignore this email.</p>
                <p style="margin-top:32px; color:#888; font-size:13px;">— The Perplexity Team</p>
            </div>
        `;
        return res.send(html);
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
        subject: 'Welcome to Perplexity',
        html: ` <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; border:1px solid #eee; border-radius:8px; padding:24px;">
                        <h2 style="color:#4B6EF5;">Verify your email for Perplexity</h2>
                        <p>Hi <b>${user.username}</b>,</p>
                        <p>Thank you for registering on Perplexity! Please verify your email address to activate your account.</p>
                        <div style="text-align:center; margin:32px 0;">
                        <a href="${emailVerificationLink}" style="background:#4B6EF5; color:#fff; text-decoration:none; padding:12px 28px; border-radius:6px; display:inline-block; font-weight:bold;">
                            Verify Email
                        </a>
                        </div>
                        <p>If you did not sign up, you can ignore this email.</p>
                        <p style="margin-top:32px; color:#888; font-size:13px;">— The Perplexity Team</p>
                    </div>`,
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
    });
}

export {
    registerController,
    verifyEmail,
    loginController,
    getMeController,
    resendEmailVerificationLink,
};
