import jwt from 'jsonwebtoken';
import envConfig from '../config/envconfig.js';

export async function sendResponse({
    res,
    statusCode,
    message,
    success,
    error = null,
    ...additionalData
}) {
    return res.status(statusCode).json({
        message,
        success,
        error,
        ...additionalData,
    });
}

/**
 * Helper to generate JWT token and set the 'token' cookie
 */
export function setTokenCookie(res, user) {
    const token = jwt.sign(
        { id: user._id, email: user.email },
        envConfig.JWT_SECRET,
        {
            expiresIn: '1d',
        },
    );
    res.cookie('token', token);
    return token;
}

/**
 * Helper function to generate JWT token, set cookie, and send response
 */
export async function sendTokenResponse({ res, user, message }) {
    setTokenCookie(res, user);

    return sendResponse({
        res,
        statusCode: 200,
        message: message,
        success: true,
        user: {
            id: user._id,
            email: user.email,
            name: user.name,
            createdAt: user.createdAt,
        },
    });
}
