export function handleSpaRequests(req, res, next) {
    // Let API routes continue
    if (req.path.startsWith('/api')) {
        return next();
    }

    // Let static assets continue
    if (req.path.startsWith('/assets')) {
        return next();
    }

    // Block requests that look like files
    if (/\.[a-z0-9]+$/i.test(req.path)) {
        return res.sendStatus(404);
    }

    next();
}

export function blockSuspiciousRequests(req, res, next) {
    if (
        /(\.env|\.git|wp-login\.php|xmlrpc\.php|phpmyadmin)/i.test(
            req.originalUrl,
        )
    ) {
        return res.sendStatus(404);
    }

    next();
}
