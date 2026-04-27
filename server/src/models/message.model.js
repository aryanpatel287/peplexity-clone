import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
    {
        chat: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'chats',
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ['ai', 'user'],
            required: true,
        },
    },
    { timestamps: true },
);

messageSchema.virtual('files', {
    ref: 'files',
    localField: '_id',
    foreignField: 'message',
});

messageSchema.set('toJSON', { virtuals: true });
messageSchema.set('toObject', { virtuals: true });

const messageModel = mongoose.model('messages', messageSchema);

export default messageModel;
