import 'dotenv/config';

import { Pinecone } from '@pinecone-database/pinecone';
import { retrieveChunksFromDb } from '../controllers/chunk.controller.js';
import connectToDb from '../config/database.js';
import { mistralEmbeddingModel } from '../services/ai/models.ai.service.js';

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

const index = pc.Index('cohort-2-rag');

export async function retrieveRelevantContext(prompt) {
    const queryEmbedding = await mistralEmbeddingModel.embedQuery(prompt);

    const queryResult = await index.query({
        vector: queryEmbedding,
        topK: 3,
        includeMetadata: true,
    });

    console.log('Query result: ', queryResult);
    console.log('Query matches: ', queryResult.matches);

    console.log(
        'Query matches IDs: ',
        queryResult.matches.map((match) => match.id),
    );

    const retrievedChunks = await retrieveChunksFromDb(
        queryResult.matches.map((match) => match.id),
    );

    return JSON.stringify(retrievedChunks);
}

console.log(
    await retrieveRelevantContext(
        'AI Java Developer skills and job responsibilities (OOPS, SDLC, data structures, automation framework)',
    ),
);
