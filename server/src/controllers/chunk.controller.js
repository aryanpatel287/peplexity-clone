import ChunkModel from '../models/chunk.model.js';

async function saveChunksToDb({
    chunks,
    fileId = '69ef97b75c7cd75eb86b61ad',
    chatId = '69ef72e239d02d472918785c',
    documentType,
}) {
    if (chunks.length === 0) {
        console.error('No chunks to save to MongoDB.');
        throw new Error('No chunks to save to MongoDB.');
    }

    const docsToInsert = chunks.map((chunk) => ({
        file: fileId,
        chat: chatId,
        text: chunk.text,
        markdown: chunk.markdown,
        source: chunk.source,
        metadata: chunk.metadata,
        documentType,
    }));

    if (docsToInsert.length === 0) {
        console.error('No valid chunk documents to insert into MongoDB.');
        throw new Error('No valid chunk documents to insert into MongoDB.');
    }

    const insertedChunks = await ChunkModel.insertMany(docsToInsert, {
        ordered: false,
    });

    if (insertedChunks.length === 0) {
        console.error('No chunks were inserted into MongoDB.');
        throw new Error('No chunks were inserted into MongoDB.');
    }

    const chunksToReturn = insertedChunks.map((savedChunk) => ({
        _id: savedChunk._id,
        file: savedChunk.file,
        chat: savedChunk.chat,
        text: savedChunk.text,
        source: savedChunk.source,
        metadata: savedChunk.metadata,
        documentType: savedChunk.documentType,
    }));

    console.log('chunksToReturn: ', chunksToReturn[0]);
    return chunksToReturn;
}

async function retrieveChunksFromDb(chunkIds) {
    const retrievedChunks = await ChunkModel.find({ _id: { $in: chunkIds } });

    console.log('Retrieved Chunks: ', retrievedChunks);

    return retrievedChunks;
}

export { saveChunksToDb, retrieveChunksFromDb };
