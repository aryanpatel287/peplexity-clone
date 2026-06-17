import 'dotenv/config';

import { Pinecone } from '@pinecone-database/pinecone';
import { retrieveChunksFromDb } from '../controllers/chunk.controller.js';
import { mistralEmbeddingModel } from '../services/ai/models.ai.service.js';

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

const index = pc.Index('cohort-2-rag');

export async function retrieveRelevantContext(input) {
    let prompt;
    let chatId;

    if (typeof input === 'string') {
        prompt = input;
    } else if (input && typeof input === 'object') {
        prompt = input.prompt;
        chatId = input.chatId;
    }

    if (!prompt) {
        return JSON.stringify([]);
    }

    const queryEmbedding = await mistralEmbeddingModel.embedQuery(prompt);

    const queryOptions = {
        vector: queryEmbedding,
        topK: 3,
        includeMetadata: true,
    };

    if (chatId) {
        queryOptions.filter = { chat: { '$eq': chatId } };
    }

    const queryResult = await index.query(queryOptions);

    const retrievedChunks = await retrieveChunksFromDb(
        queryResult.matches.map((match) => match.id),
        chatId,
    );

    return JSON.stringify(retrievedChunks);
}
