import LlamaCloud from '@llamaindex/llama-cloud';
import envConfig from '../config/envconfig.js';
import fs from 'fs';
import { Readable } from 'stream';

//filePath can be a local path or a URL

export default async function parsePdfByLlama(filePath) {
    const client = new LlamaCloud({
        apiKey: envConfig.LLAMA_CLOUD_API_KEY,
    });

    let fileStream;

    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        // Fetch the file from the internet
        const response = await fetch(filePath);
        if (!response.ok)
            throw new Error(
                `Failed to fetch remote file: ${response.statusText}`,
            );

        // Convert the response arrayBuffer into a Node.js Readable stream
        const arrayBuffer = await response.arrayBuffer();
        fileStream = Readable.from(Buffer.from(arrayBuffer));
    } else {
        // Standard handling for local paths
        fileStream = fs.createReadStream(filePath);
    }

    const file = await client.files.create({
        file: fileStream,
        purpose: 'parse',
    });

    const result = await client.parsing.parse({
        file_id: file.id,
        tier: 'cost_effective',
        version: 'latest',
        expand: ['markdown'],
    });

    return result.markdown.pages;
}
