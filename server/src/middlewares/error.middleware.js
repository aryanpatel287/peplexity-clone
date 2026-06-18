import envConfig from '../config/envconfig.js';
import rollbar from '../services/rollbar.service.js';

/**
 * Global Express error handling middleware.
 * Catches all unhandled routing/controller errors, reports them, and sends a standardized JSON response.
 */
export function errorHandler(err, req, res, next) {
    // 1. Report to centralized error service (Rollbar in production, console in dev)
    rollbar.error(err, req);

    // 2. If response headers are already sent, delegate to default Express handler
    if (res.headersSent) {
        return next(err);
    }

    // 3. Format client response
    const statusCode = err.statusCode || err.status || 500;
    const clientMessage = statusCode === 500 && envConfig.IS_PRODUCTION
        ? 'Internal Server Error'
        : err.message || 'Something went wrong';

    res.status(statusCode).json({
        success: false,
        message: clientMessage,
        error: {
            code: err.code || 'INTERNAL_SERVER_ERROR',
            details: envConfig.IS_PRODUCTION ? undefined : err.stack,
        },
    });
}
