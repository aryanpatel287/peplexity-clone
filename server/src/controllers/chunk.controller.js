import ChunkModel from '../models/chunk.model.js';

async function saveChunksToDb({
    chunks,
    file,
    chat,
    documentType,
    source = 'unknown',
}) {
    try {
        if (chunks.length === 0) {
            throw new Error('No chunks to save to MongoDB.');
        }

        const docsToInsert = chunks
            .filter((chunk) => chunk.text && chunk.text.trim().length > 0)
            .map((chunk) => ({
                file,
                chat,
                text: chunk.text.trim(),
                markdown: chunk.markdown ? chunk.markdown.trim() : '',
                source: source,
                metadata: chunk.metadata,
                documentType,
            }));

        if (docsToInsert.length === 0) {
            throw new Error('No valid non-empty chunk documents to insert into MongoDB.');
        }

        const insertedChunks = await ChunkModel.insertMany(docsToInsert, {
            ordered: false,
        });

        if (insertedChunks.length === 0) {
            throw new Error('No chunks were inserted into MongoDB.');
        }

        const chunksToReturn = insertedChunks.map((savedChunk) => ({
            _id: savedChunk._id.toString(),
            file: savedChunk.file,
            chat: savedChunk.chat,
            text: savedChunk.text,
            source: savedChunk.source,
            metadata: savedChunk.metadata,
            documentType: savedChunk.documentType,
        }));

        return chunksToReturn;
    } catch (error) {
        console.error('Error in saveChunksToDb:', error.message || error);
        throw error;
    }
}

async function retrieveChunksFromDb(chunkIds, chatId) {
    try {
        const query = { _id: { $in: chunkIds } };
        if (chatId) {
            if (!/^[0-9a-fA-F]{24}$/.test(chatId)) {
                return [];
            }
            query.chat = chatId;
        }
        const retrievedChunks = await ChunkModel.find(query);

        return retrievedChunks;
    } catch (error) {
        console.error('Error in retrieveChunksFromDb:', error);
        return [];
    }
}

export { saveChunksToDb, retrieveChunksFromDb };
