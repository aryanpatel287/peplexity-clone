import { Router } from 'express';
import { redirectUserToClient } from '../controllers/app.controller.js';
import { handleSpaRequests } from '../middlewares/app.middleware.js';

const appRouter = Router();

/**
 * @route GET /*
 * @description Redirect user to client on all non-api urls
 * @access Public
 */
appRouter.get(
    /^(?!\/(api|assets)\/).*/,
    handleSpaRequests,
    redirectUserToClient,
);

export default appRouter;
