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

const Chunk = mongoose.model('Chunk', chunkSchema);

export default Chunk;
