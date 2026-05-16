const LOCALHOST_HOSTNAMES = new Set(['localhost', '127.0.0.1']);

function stripTrailingSlash(value = '') {
    return value.replace(/\/$/, '');
}

function getBrowserOrigin() {
    if (typeof window === 'undefined') {
        return '';
    }

    return stripTrailingSlash(window.location.origin);
}

function isLocalhostRuntime() {
    if (typeof window === 'undefined') {
        return false;
    }

    return LOCALHOST_HOSTNAMES.has(window.location.hostname);
}

function resolveBaseUrl(configuredUrl) {
    const browserOrigin = getBrowserOrigin();
    const normalizedConfiguredUrl = stripTrailingSlash(configuredUrl || '');

    // Keep local SPA/dev traffic same-origin so cookies work on localhost.
    if (isLocalhostRuntime()) {
        return browserOrigin;
    }

    return normalizedConfiguredUrl || browserOrigin;
}

const resolvedApiOrigin = resolveBaseUrl(import.meta.env.VITE_API_URL);
const resolvedSocketOrigin = resolveBaseUrl(import.meta.env.VITE_SOCKET_URL);

export const API_BASE_URL = `${resolvedApiOrigin}/api`;
export const SOCKET_URL = resolvedSocketOrigin;
