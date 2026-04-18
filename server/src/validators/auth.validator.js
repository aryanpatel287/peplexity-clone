import { body, validationResult } from 'express-validator';

function validateRequest(req, res, next) {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
        return next();
    }

    return res.status(400).json({
        message: errors.array()[0].msg,
        errors: errors.array().map((error) => ({
            field: error.path,
            message: error.msg,
        })),
    });
}

const registerValidator = [
    body('username')
        .trim()
        .notEmpty()
        .withMessage('username is required')
        .isLength({ min: 3 })
        .withMessage('username must be at least 3 characters long'),
    body('email')
        .trim()
        .notEmpty()
        .withMessage('email is required')
        .isEmail()
        .withMessage('email must be valid')
        .normalizeEmail(),
    body('password')
        .trim()
        .notEmpty()
        .withMessage('password is required')
        .isLength({ min: 6 })
        .withMessage('password must be at least 6 characters long'),

    validateRequest,
];

export { registerValidator, validateRequest };
