import jwt from 'jsonwebtoken';
import userModel from '../models/user.model.js';
import envConfig from '../config/envconfig.js';

async function authUser(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(400).json({
            message: 'Invalid token',
            success: false,
            error: 'token not found',
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

export { authUser };
