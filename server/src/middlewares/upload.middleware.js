import multer from 'multer';

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
                console.error('[upload middleware]', err);
                return res.status(400).json({
                    message: 'File upload failed',
                    success: false,
                    error: {
                        code:
                            err.code === 'LIMIT_FILE_SIZE'
                                ? 'FILE_TOO_LARGE'
                                : 'UPLOAD_ERROR',
                        details:
                            err.code === 'LIMIT_FILE_SIZE'
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
