import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema(
    {
        fileId: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        size: {
            type: Number,
            required: true,
        },
        filePath: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
        fileType: {
            type: String,
            required: true,
        },
        mimetype: {
            type: String,
            required: true,
        },
        thumbnailUrl: {
            type: String,
            default: null,
        },
        width: {
            type: Number,
            default: null,
        },
        height: {
            type: Number,
            default: null,
        },
        AITags: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },
        message: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'messages',
            required: true,
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            required: false,
        },
        processingStatus: {
            type: String,
            enum: ['pending', 'completed', 'failed'],
            default: 'pending',
        },
        ragStatus: {
            type: String,
            enum: ['pending', 'completed', 'failed'],
            default: 'pending',
        },
        metadata: {
            title: {
                type: String,
                default: null,
            },

            summary: {
                type: String,
                default: null,
            },

            keywords: {
                type: [String],
                default: [],
            },

            sections: {
                type: [String],
                default: [],
            },

            retrievalQueries: {
                type: [String],
                default: [],
            },

            suggestedSystemContext: {
                type: String,
                default: null,
            },
        },
    },
    { timestamps: true },
);

const fileModel = mongoose.model('files', fileSchema);

export default fileModel;
