import { Router } from 'express';
import { proxyPublicFile } from '../controllers/file.controller.js';

const filesRouter = Router();

/**
 * @route GET /api/files/proxy?url={encodedUrl}
 * @description Proxy a public file through the app domain for browser previews and AI fetches
 * @access Public
 */
filesRouter.get('/proxy', proxyPublicFile);

export default filesRouter;
