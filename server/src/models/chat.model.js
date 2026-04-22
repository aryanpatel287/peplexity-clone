import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            requried: true,
        },
        title: {
            type: String,
            default: 'New chat',
            trim: true,
        },
    },
    { timestamps: true },
);

const chatModel = mongoose.model('chats', chatSchema);

export default chatModel;
