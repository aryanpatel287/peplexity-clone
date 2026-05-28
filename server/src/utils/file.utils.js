import envConfig from '../config/envconfig.js';

export function buildPublicFileProxyUrl(fileUrl) {
    if (!fileUrl) return fileUrl;

    const serverUrl = envConfig.SERVER_URL.replace(/\/$/, '');
    return `${serverUrl}/api/files/proxy?url=${encodeURIComponent(fileUrl)}`;
}
