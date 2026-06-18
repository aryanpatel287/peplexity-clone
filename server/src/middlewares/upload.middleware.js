import multer from 'multer';
import rollbar from '../services/rollbar.service.js';

const MB = 1024 * 1024;
const DEFAULT_MAX_FILE_SIZE = 2 * MB;
const DEFAULT_MAX_COUNT = 5;
const DEFAULT_FIELD_NAME = 'files';

function formatFileSizeLimit(bytes) {
    if (bytes >= MB) return `${bytes / MB}MB`;
    if (bytes >= 1024) return `${bytes / 1024}KB`;
    return `${bytes}B`;
}

/**
 * Creates reusable multer middleware for memory-backed file uploads.
 * @param {Object} [options]
 * @param {string} [options.fieldName='files'] - Form field name for uploaded files
 * @param {number} [options.maxCount=5] - Max files when mode is 'array'
 * @param {number} [options.maxFileSize=2097152] - Max size per file in bytes (default 2MB)
 * @param {'single' | 'array'} [options.mode='array'] - Accept one file or multiple files
 */
export function createFileUploadMiddleware({
    fieldName = DEFAULT_FIELD_NAME,
    maxCount = DEFAULT_MAX_COUNT,
    maxFileSize = DEFAULT_MAX_FILE_SIZE,
    mode = 'array',
} = {}) {
    const upload = multer({
        storage: multer.memoryStorage(),
        limits: { fileSize: maxFileSize },
    });

    const parseFiles =
        mode === 'single'
            ? upload.single(fieldName)
            : upload.array(fieldName, maxCount);

    return (req, res, next) => {
        parseFiles(req, res, (err) => {
            if (err) {
                const isTooLarge = err.code === 'LIMIT_FILE_SIZE';
                if (!isTooLarge) {
                    rollbar.error(err, req);
                } else {
                    console.warn(`[upload middleware] File size limit exceeded: each file must be ${formatFileSizeLimit(maxFileSize)} or smaller`);
                }

                return res.status(400).json({
                    message: isTooLarge
                        ? `Max ${formatFileSizeLimit(maxFileSize)} allowed`
                        : 'File upload failed',
                    success: false,
                    error: {
                        code: isTooLarge ? 'FILE_TOO_LARGE' : 'UPLOAD_ERROR',
                        details: isTooLarge
                            ? `Each file must be ${formatFileSizeLimit(maxFileSize)} or smaller`
                            : err.message,
                    },
                });
            }

            next();
        });
    };
}

export const uploadFilesMiddleware = createFileUploadMiddleware();
