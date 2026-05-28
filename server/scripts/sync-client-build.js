import { cp, mkdir, rm } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.resolve(__dirname, '..');
const clientRoot = path.resolve(serverRoot, '..', 'client');
const clientDistPath = path.join(clientRoot, 'dist');
const serverPublicPath = path.join(serverRoot, 'public');

function buildClient() {
    execSync('npm run build', {
        cwd: clientRoot,
        stdio: 'inherit',
    });
}

async function syncBuild() {
    await rm(serverPublicPath, { recursive: true, force: true });
    await mkdir(serverPublicPath, { recursive: true });
    await cp(clientDistPath, serverPublicPath, {
        recursive: true,
        force: true,
    });
}

async function main() {
    buildClient();
    await syncBuild();
    console.log('Client build synced to server/public successfully.');
}

main().catch((error) => {
    console.error('Failed to sync client build:', error);
    process.exit(1);
});
