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
        description: {
            type: String,
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
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    { timestamps: true },
);

const fileModel = mongoose.model('files', fileSchema);

export default fileModel;
