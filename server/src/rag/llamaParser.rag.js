import LlamaCloud from '@llamaindex/llama-cloud';
import envConfig from '../config/envconfig.js';

//filePath can be a local path or a URL

async function parsePdfByLlama(filePath) {
    const client = new LlamaCloud({
        apiKey: envConfig.LLAMA_CLOUD_API_KEY,
    });

    // Upload and parse a document
    const file = await client.files.create({
        file: fs.createReadStream(filePath),
        purpose: 'parse',
    });

    const result = await client.parsing.parse({
        file_id: file.id,
        tier: 'cost_effective',
        version: 'latest',
        expand: ['markdown'],
    });

    console.log('Result: ', result);
    console.log(result.markdown.pages[0].markdown);

    return result.markdown.pages;
}
