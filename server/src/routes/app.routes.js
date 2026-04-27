import { Router } from 'express';
import { redirectUserToClient } from '../controllers/app.controller.js';

const appRouter = Router();

/**
 * @route GET /*
 * @description Redirect user to client on all non-api urls
 * @access Public
 */
appRouter.get(/^(?!\/(api|assets)\/).*/, redirectUserToClient);

export default appRouter;
