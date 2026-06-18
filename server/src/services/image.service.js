import ImageKit, { toFile } from '@imagekit/nodejs';

import fs from 'fs';
import envConfig from '../config/envconfig.js';

const imagekit = new ImageKit({
    privateKey: envConfig.IMAGEKIT_PRIVATE_KEY,
});

function validateFile(file) {
    if (!file?.buffer?.length) {
        throw new Error(
            `File "${file?.originalname ?? 'unknown'}" is empty or missing file data`,
        );
    }
    if (!file.originalname) {
        throw new Error('File is missing a name');
    }
}

export async function uploadImageOnImageKit({ image }) {
    try {
        validateFile(image);

        return await imagekit.files.upload({
            file: await toFile(Buffer.from(image.buffer), image.originalname),
            fileName: image.originalname,
            folder: '/cohort2-genAi/images',
        });
    } catch (error) {
        console.error('[ImageKit] uploadImageOnImageKit failed:', error);
        throw error;
    }
}

export async function uploadMultipleImagesOnImageKit(files) {
    if (!Array.isArray(files) || files.length === 0) {
        throw new Error('No files provided for upload');
    }

    try {
        const uploadPromises = files.map(async (file) => {
            try {
                validateFile(file);

                return await imagekit.files.upload({
                    file: await toFile(
                        Buffer.from(file.buffer),
                        file.originalname,
                    ),
                    fileName: file.originalname,
                    folder: file.mimetype.startsWith('image/')
                        ? '/cohort2-genAi/images'
                        : file.mimetype === 'application/pdf'
                          ? '/cohort2-genAi/pdfs'
                          : '/cohort2-genAi/others',
                    customMetadata: {
                        mimetype: file.mimetype,
                    },
                });
            } catch (error) {
                console.error(
                    `[ImageKit] upload failed for "${file?.originalname ?? 'unknown'}":`,
                    error,
                );
                throw error;
            }
        });

        const results = await Promise.all(uploadPromises);

        return results.map((result, idx) => ({
            ...result,
            url: result.url,
            mimetype: files[idx].mimetype,
        }));
    } catch (error) {
        console.error('[ImageKit] uploadMultipleImagesOnImageKit failed:', error);
        throw error;
    }
}
