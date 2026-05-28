export async function proxyPublicFile(req, res) {
    const { url } = req.query;

    if (typeof url !== 'string' || !url.trim()) {
        return res.status(400).json({
            success: false,
            message: 'File url is required',
            error: 'File url is required',
        });
    }

    let parsedUrl;

    try {
        parsedUrl = new URL(url);
    } catch {
        return res.status(400).json({
            success: false,
            message: 'Invalid file url',
            error: 'Invalid file url',
        });
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid file url protocol',
            error: 'Invalid file url protocol',
        });
    }

    if (!['ik.imagekit.io', 'imagekit.io'].includes(parsedUrl.hostname)) {
        return res.status(400).json({
            success: false,
            message: 'File url host is not allowed',
            error: 'File url host is not allowed',
        });
    }

    const response = await fetch(parsedUrl.toString());

    if (!response.ok) {
        return res.status(502).json({
            success: false,
            message: 'Failed to fetch file',
            error: 'Failed to fetch file',
        });
    }

    const contentType =
        response.headers.get('content-type') || 'application/octet-stream';
    const fileBuffer = Buffer.from(await response.arrayBuffer());

    res.set({
        'Content-Type': contentType,
        'Content-Length': String(fileBuffer.length),
        'Cache-Control': 'public, max-age=0, must-revalidate',
    });

    return res.status(200).send(fileBuffer);
}
