import 'dotenv/config';

import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { MistralAIEmbeddings } from '@langchain/mistralai';
import { map } from 'zod';
import pineconeIndex from '../services/pinecone.service.js';
import envConfig from '../config/envconfig.js';
import { extractText, getDocumentProxy } from 'unpdf';

const embeddingModel = new MistralAIEmbeddings({
    apiKey: envConfig.MISTRAL_API_KEY,
    model: 'mistral-embed',
});

async function splitTheDocumentToChunks(params) {
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 700,
        chunkOverlap: 50,
    });

    const chunks = await splitter.splitText(data.text);

    console.log(`Total chunks created: ${chunks.length}`);

    return chunks;
}

async function EmbedTheDocumentChunks(chunks) {
    const docs = await Promise.all(
        chunks.map(async (chunk) => {
            const embeddedChunk = await embeddingModel.embedQuery(chunk);

            return {
                text: chunk,
                embeddedChunk,
            };
        }),
    );
    return docs;
}

async function upsertTheVectors(docs) {
    await pineconeIndex.upsert({
        records: docs.map((doc, idx) => ({
            id: `doc-${idx}`,
            values: doc.embeddedChunk,
            metadata: {
                text: doc.text,
            },
        })),
    });

    console.log('Vectors upserted successfully');
}

async function deleteAllTheVectors() {
    const deleteResult = await pineconeIndex.deleteAll();
    console.log('All vectors deleted successfully');
    console.log('Delete result: ', deleteResult);
}

export async function dataIngestion(dataBuffer) {
    try {
        console.log('DataIngestion Started');

        const data = await parseUploadedPDF(dataBuffer);
        console.log('PDF parsing completed');

        const chunks = await splitTheDocumentToChunks(data);
        const docs = await EmbedTheDocumentChunks(chunks);
        console.log('Chunking and embedding completed');

        await upsertTheVectors(docs);
        console.log('Data ingestion completed successfully');
    } catch (error) {
        console.error('Error during data ingestion: ', error);
    }
}

/**
 * NOTE : Return the results in the strings format using the JSON.stringify()
 */
