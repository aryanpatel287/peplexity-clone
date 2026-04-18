import userModel from '../models/user.model.js';
import { sendEmail } from '../services/mail.service.js';

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
        const normalizedPassword = password.trim();

        if (!normalizedUsername || !normalizedEmail || !normalizedPassword) {
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
            password: normalizedPassword,
        });

        const verificationEmail = await sendEmail({
            to: normalizedEmail,
            subject: 'Welcome to Perplexity',
            html: `
                    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; border:1px solid #eee; border-radius:8px; padding:24px;">
                        <h2 style="color:#4B6EF5;">Welcome to Perplexity!</h2>
                        <p>Hi <b>${username}</b>,</p>
                        <p>We're excited to have you join the Perplexity platform.<br>
                        Explore, ask questions, and enjoy the experience!</p>
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

export { registerController };
