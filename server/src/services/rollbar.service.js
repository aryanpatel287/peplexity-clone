import Rollbar from 'rollbar';
import envConfig from '../config/envconfig.js';

let rollbarInstance = null;

// Only instantiate Rollbar in production if the token is available
if (envConfig.IS_PRODUCTION && envConfig.ROLLBAR_ACCESS_TOKEN) {
    rollbarInstance = new Rollbar({
        accessToken: envConfig.ROLLBAR_ACCESS_TOKEN,
        captureUncaught: true,
        captureUnhandledRejections: true,
        payload: {
            code_version: '1.0.0',
        },
        environment: envConfig.ROLLBAR_ENVIRONMENT,
        enabled: true,
        nodeSourceMaps: true,
        // Scrub sensitive fields/headers from logs
        scrubFields: [
            'password',
            'confirmPassword',
            'token',
            'guest_token',
            'cookie',
            'authorization',
            'jwt',
            'accessToken',
            'clientSecret',
            'privateKey',
            'apiKey',
            'redisPassword',
            'otp',
            'gmailRefreshToken',
        ],
        scrubHeaders: ['authorization', 'cookie', 'set-cookie'],
        // anonymize IP addresses
        captureIp: 'anonymize',
    });
}

const rollbarService = {
    /**
     * Express error handling middleware.
     * Delegates to Rollbar in production, or returns a no-op handler in development.
     */
    errorHandler() {
        if (rollbarInstance) {
            return rollbarInstance.errorHandler();
        }
        return (err, req, res, next) => next(err);
    },

    /**
     * Log an error level event.
     */
    error(err, req, custom, callback) {
        console.error('[ERROR]', err);
        if (rollbarInstance) {
            rollbarInstance.error(err, req, custom, callback);
        } else if (callback) {
            callback();
        }
    },

    /**
     * Log a warning level event.
     */
    warn(message, req, custom, callback) {
        console.warn('[WARN]', message);
        if (rollbarInstance) {
            rollbarInstance.warn(message, req, custom, callback);
        } else if (callback) {
            callback();
        }
    },

    /**
     * Log an info level event.
     */
    info(message, req, custom, callback) {
        console.info('[INFO]', message);
        if (rollbarInstance) {
            rollbarInstance.info(message, req, custom, callback);
        } else if (callback) {
            callback();
        }
    },

    /**
     * Log a debug level event.
     */
    debug(message, req, custom, callback) {
        console.debug('[DEBUG]', message);
        if (rollbarInstance) {
            rollbarInstance.debug(message, req, custom, callback);
        } else if (callback) {
            callback();
        }
    },

    /**
     * Log a message with default severity.
     */
    log(message, req, custom, callback) {
        console.log('[LOG]', message);
        if (rollbarInstance) {
            rollbarInstance.log(message, req, custom, callback);
        } else if (callback) {
            callback();
        }
    }
};

export default rollbarService;
