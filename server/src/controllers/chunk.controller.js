import ChunkModel from '../models/chunk.model.js';

//TODO: Add file validation - the ai should receive the context of the file which is in the current chat only.
//TODO: how will the ai will pass the chatid when it calls the tool?
async function saveChunksToDb({
    chunks,
    file,
    chat,
    documentType,
    source = 'unknown',
}) {
    if (chunks.length === 0) {
        console.error('No chunks to save to MongoDB.');
        throw new Error('No chunks to save to MongoDB.');
    }

    const docsToInsert = chunks.map((chunk) => ({
        file,
        chat,
        text: chunk.text,
        markdown: chunk.markdown,
        source: source,
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
        _id: savedChunk._id.toString(),
        file: savedChunk.file,
        chat: savedChunk.chat,
        text: savedChunk.text,
        source: savedChunk.source,
        metadata: savedChunk.metadata,
        documentType: savedChunk.documentType,
    }));

    return chunksToReturn;
}

async function retrieveChunksFromDb(chunkIds) {
    const retrievedChunks = await ChunkModel.find({ _id: { $in: chunkIds } });

    return retrievedChunks;
}

export { saveChunksToDb, retrieveChunksFromDb };
