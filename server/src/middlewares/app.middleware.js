export function handleSpaRequests(req, res, next) {
    // Let API routes continue
    if (req.path.startsWith('/api')) {
        return next();
    }

    // Let static assets continue
    if (req.path.startsWith('/assets')) {
        return next();
    }

    // Block requests that look like files (having extensions, optionally with backup/temp chars like ~)
    if (/\.[a-z0-9]+(?:~|\.bak|\.old)?$/i.test(req.path)) {
        return res.sendStatus(404);
    }

    next();
}

export function blockSuspiciousRequests(req, res, next) {
    const url = req.originalUrl || req.url;

    // Pattern for suspicious files/extensions:
    // - .php (including .php3, .php4, .php5, .phtml, .php~, .php.bak, etc.)
    // - .env, .git, .ini, .conf, .config, .sql, .bak, .old, .save
    // - Common archives: .zip, .tar, .gz, .rar, .7z
    // - Configs: .xml, .yaml, .yml
    const suspiciousExtensions = /\.(php[0-9~]?|phtml|env|git|ini|conf|config|sql|bak|old|save|zip|tar|gz|rar|7z|xml|yaml|yml)(?:\.|$|\/|~)/i;

    // Pattern for suspicious path segments / keywords:
    // - phpinfo, php-info, server-status, server-info, wp-admin, wp-login, xmlrpc, phpmyadmin, pma, adminer, _profiler, _environment, _debug
    // Checked as discrete path segments to avoid false positives (e.g., query params or longer word strings)
    const suspiciousPaths = /(?:^|\/)(info|phpinfo|php-info|server-status|server-info|wp-admin|wp-login|xmlrpc|phpmyadmin|pma|adminer|_profiler|_environment|_debug)(?:\/|$|\?)/i;

    if (suspiciousExtensions.test(url) || suspiciousPaths.test(url)) {
        return res.sendStatus(404);
    }

    next();
}
