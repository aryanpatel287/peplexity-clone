import ImageKit, { toFile } from '@imagekit/nodejs';

import fs from 'fs';

const imagekit = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

export async function uploadImageOnImageKit({ image }) {
    const file = await imagekit.files.upload({
        file: await toFile(Buffer.from(image.buffer), 'file'),
        fileName: image.originalname,
        folder: '/cohort2-genAi/images',
    });

    console.log('UploadedImage: ', file);
}

export async function uploadMultipleImagesOnImageKit(files) {
    const uploadPromises = files.map(async (file) =>
        imagekit.files.upload({
            file: await toFile(Buffer.from(file.buffer), 'file'),
            fileName: file.originalname,
            folder: file.mimetype.startsWith('image/')
                ? '/cohort2-genAi/images'
                : file.mimetype === 'application/pdf'
                    ? '/cohort2-genAi/pdfs'
                    : '/cohort2-genAi/others',
            customMetadata: {
                mimetype: file.mimetype,
            },
        }),
    );

    const results = await Promise.all(uploadPromises);

    const resultsWithMime = results.map((file, idx) => ({
        ...file,
        mimetype: files[idx].mimetype,
    }));

    return resultsWithMime;
}
