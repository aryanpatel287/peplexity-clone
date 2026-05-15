import 'dotenv/config';

import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { MistralAIEmbeddings } from '@langchain/mistralai';
import { file, map } from 'zod';
import pineconeIndex from '../services/pinecone.service.js';
import envConfig from '../config/envconfig.js';
import { extractText, getDocumentProxy } from 'unpdf';
import parsePdfByLlama from './llamaParser.rag.js';
import { processMarkdownPages } from './markdownChunks.rag.js';
import { saveChunksToDb } from '../controllers/chunk.controller.js';
import connectToDb from '../config/database.js';

await connectToDb()
    .then(() => {
        console.log('Connected to MongoDB successfully');
    })
    .catch((err) => {
        console.error('MongoDB connection failed: ', err);
        process.exit(1);
    });

const embeddingModel = new MistralAIEmbeddings({
    apiKey: envConfig.MISTRAL_API_KEY,
    model: 'mistral-embed',
});

async function EmbedTheDocumentChunks(chunks) {
    if (!chunks || chunks?.length === 0) {
        console.error('No chunks to embed');
        throw new Error('No chunks to embed');
        return;
    }

    const docs = await Promise.all(
        chunks.map(async (chunk, idx) => {
            const embeddedChunk = await embeddingModel.embedQuery(chunk.text);

            return {
                id: chunk._id.toString(),
                values: embeddedChunk,
                metadata: {
                    file: chunk.file.toString(),
                    chat: chunk.chat.toString(),
                },
            };
        }),
    );
    return docs;
}

async function upsertTheVectors(docs) {

    await pineconeIndex.upsert({
        records:docs,
    });

    console.log('Vectors upserted successfully');
}

async function deleteAllTheVectors() {
    const deleteResult = await pineconeIndex.deleteAll();
    console.log('All vectors deleted successfully');
    console.log('Delete result: ', deleteResult);
}

export async function dataIngestion({ filePath, documentType }) {
    try {
        console.log('DataIngestion Started');

        const pages = await parsePdfByLlama(filePath);
        console.log('PDF parsing completed');

        const chunks = await processMarkdownPages(pages);
        console.log('Markdown processing completed');

        console.log(`Total chunks created: ${chunks.length}`);

        const savedChunks = await saveChunksToDb({
            chunks,
            documentType,
        });
        console.log(` chunks saved to MongoDB: ${savedChunks.length}`);

        const docs = await EmbedTheDocumentChunks(savedChunks);
        console.log('Chunking and embedding completed');

        await upsertTheVectors(docs);
        console.log('Data ingestion completed successfully');

        return;
    } catch (error) {
        console.error('Error during data ingestion: ', error);
    }
}

await dataIngestion({
    filePath:
        'https://ik.imagekit.io/ji8wynr3i/cohort2-genAi/pdfs/Campus%20Job%20Description%20-%202027-1-5.pdf',
});

// TODO: Fix MongoDB buffering timeout tomorrow - check connection string/IP whitelist

/**
 * NOTE : Return the results in the strings format using the JSON.stringify()
 */
