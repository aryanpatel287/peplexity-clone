import 'dotenv/config';

import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { file, map } from 'zod';
import pineconeIndex from '../services/pinecone.service.js';
import { extractText, getDocumentProxy } from 'unpdf';
import parsePdfByLlama from './llamaParser.rag.js';
import { processMarkdownPages } from './markdownChunks.rag.js';
import { saveChunksToDb } from '../controllers/chunk.controller.js';
import connectToDb from '../config/database.js';
import { mistralEmbeddingModel } from '../services/ai/models.ai.service.js';

async function EmbedTheDocumentChunks(chunks) {
    if (!chunks || chunks?.length === 0) {
        console.error('No chunks to embed');
        throw new Error('No chunks to embed');
        return;
    }
    console.log('chunk', chunks[0]);

    const docs = await Promise.all(
        chunks.map(async (chunk, idx) => {
            const embeddedChunk = await mistralEmbeddingModel.embedQuery(
                chunk.text,
            );

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
        records: docs,
    });

    console.log('Vectors upserted successfully');
}

async function deleteAllTheVectors() {
    const deleteResult = await pineconeIndex.deleteAll();
    console.log('All vectors deleted successfully');
    console.log('Delete result: ', deleteResult);
}

export async function dataIngestion({
    fileUrl,
    file,
    chat,
    documentType,
    source,
}) {
    let stage = 'init';

    try {
        stage = 'parse_pdf';
        const pages = await parsePdfByLlama(fileUrl);

        stage = 'chunk_markdown';
        const chunks = await processMarkdownPages(pages);

        const savedChunks = await saveChunksToDb({
            chunks,
            file,
            chat,
            documentType,
            source,
        });

        stage = 'embed_chunks';
        const docs = await EmbedTheDocumentChunks(savedChunks);

        stage = 'upsert_vectors';
        await upsertTheVectors(docs);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const wrappedError = new Error(
            `Data ingestion failed at ${stage}: ${message}`,
        );
        wrappedError.cause = error;
        throw wrappedError;
    }
}

// For testing the data ingestion function
// await dataIngestion({
//     fileUrl:
//         'https://ik.imagekit.io/ji8wynr3i/cohort2-genAi/pdfs/Campus%20Job%20Description%20-%202027-1-5.pdf',
// });
