import mongoose from 'mongoose';

const chunkSchema = new mongoose.Schema(
    {
        file: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'files',
        },

        chat: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'chats',
        },

        text: {
            type: String,
            required: true,
        },

        markdown: {
            type: String,
            required: true,
        },

        source: String,

        metadata: {
            h1: {
                type: String,
            },
            h2: {
                type: String,
            },
            h3: {
                type: String,
            },

            startPage: {
                type: Number,
            },
            endPage: {
                type: Number,
            },

            chunkIndex: {
                type: Number,
            },
        },

        documentType: String,
    },
    {
        timestamps: true,
    },
);

chunkSchema.index({ file: 1, 'metadata.chunkIndex': 1 });

const ChunkModel = mongoose.model('Chunks', chunkSchema);

export default ChunkModel;
