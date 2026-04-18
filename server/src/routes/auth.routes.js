import { Router } from 'express';
import { registerController } from '../controllers/auth.controller.js';
import { registerValidator, validateRequest } from '../validators/auth.validator.js';

const authRoutes = Router();

/**
 * @route POST /api/auth/register
 * @description Register a user
 * @access Public
 * @body {username,email,password}
 */
authRoutes.post('/register', registerValidator, registerController);

export default authRoutes;
