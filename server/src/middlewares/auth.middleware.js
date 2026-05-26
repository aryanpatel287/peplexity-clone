import jwt from 'jsonwebtoken';
import userModel from '../models/user.model.js';
import envConfig from '../config/envconfig.js';
import redis from '../config/cache.js';

async function authUser(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(400).json({
            message: 'Invalid token',
            success: false,
            error: 'token not found',
        });
    }

    const isTokenBlacklisted = await redis.get(`perplexity-blacklist:${token}`);
    if (isTokenBlacklisted) {
        return res.status(401).json({
            message: 'Invalid token',
            success: false,
            error: 'Token is blacklisted',
        });
    }

    try {
        const decodedToken = jwt.verify(token, envConfig.JWT_SECRET);

        req.user = decodedToken;

        return next();
    } catch (error) {
        console.log(error);

        return res.status(401).json({
            message: 'Unauthorized',
            success: false,
            error: 'Invalid token',
        });
    }
}

async function authUserOrGuest(req, res, next) {
    const userToken = req.cookies.token;
    const guestToken = req.cookies.guest_token;
    const token = userToken || guestToken;

    if (!token) {
        return res.status(401).json({
            message: 'Invalid token',
            success: false,
            error: 'token not found',
        });
    }

    if (userToken) {
        const isTokenBlacklisted = await redis.get(
            `perplexity-blacklist:${userToken}`,
        );
        if (isTokenBlacklisted) {
            return res.status(401).json({
                message: 'Invalid token',
                success: false,
                error: 'Token is blacklisted',
            });
        }
    }

    try {
        const decodedToken = jwt.verify(token, envConfig.JWT_SECRET);

        if (decodedToken?.isGuest) {
            req.user = {
                isGuest: true,
                guestId: decodedToken.guestId,
            };
        } else {
            req.user = {
                ...decodedToken,
                isGuest: false,
            };
        }

        return next();
    } catch (error) {
        console.log(error);

        return res.status(401).json({
            message: 'Unauthorized',
            success: false,
            error: 'Invalid token',
        });
    }
}

export { authUser, authUserOrGuest };
