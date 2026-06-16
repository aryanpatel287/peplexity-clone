import 'dotenv/config';

import pineconeIndex from '../services/pinecone.service.js';
import parseDocumentsByLlama from './llama-parser.rag.js';
import { processMarkdownPages } from './markdown-chunks.rag.js';
import { saveChunksToDb } from '../controllers/chunk.controller.js';
import { mistralEmbeddingModel } from '../services/ai/models.ai.service.js';
import fileModel from '../models/file.model.js';

async function EmbedTheDocumentChunks(chunks) {
    if (!chunks || chunks?.length === 0) {
        console.error('No chunks to embed');
        throw new Error('No chunks to embed');
    }

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
}

async function deleteAllTheVectors() {
    try {
        const deleteResult = await pineconeIndex.deleteAll();
        console.log('All vectors deleted successfully');
        console.log('Delete result: ', deleteResult);
    } catch (error) {
        if (error.name === 'PineconeNotFoundError') {
            console.log('No vectors to delete (index is already empty).');
        } else {
            console.error('Failed to delete vectors:', error);
        }
    }
}

export async function dataIngestion({
    fileUrl,
    file,
    chat,
    documentType,
    source,
    markdownContent,
}) {
    let stage = 'init';

    try {
        let pages;
        if (!markdownContent) {
            stage = 'parse_pdf';
            pages = (await parseDocumentsByLlama(fileUrl)).markdown.pages;
        } else {
            stage = 'markdownContent_pages';
            if (!markdownContent.pages || markdownContent.pages.length == 0) {
                throw new Error('No pages found in markdown content');
            }
            pages = markdownContent.pages;
        }

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

        await fileModel.findOneAndUpdate(
            { _id: file },
            {
                ragStatus: 'completed',
            },
        );
    } catch (error) {
        await fileModel.findOneAndUpdate(
            { _id: file },
            {
                ragStatus: 'failed',
            },
        );
        const message = error instanceof Error ? error.message : String(error);
        const wrappedError = new Error(
            `Data ingestion failed at ${stage}: ${message}`,
        );
        wrappedError.cause = error;
        console.error(wrappedError);
    }
}

// For testing the data ingestion function
// await dataIngestion({
//     fileUrl:
//         'https://ik.imagekit.io/ji8wynr3i/cohort2-genAi/pdfs/Campus%20Job%20Description%20-%202027-1-5.pdf',
// });

// deleteAllTheVectors();
