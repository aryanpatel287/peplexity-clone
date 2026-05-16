import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            required: [function () {
                return !this.guestId;
            }, 'user is required'],
        },
        guestId: {
            type: String,
            required: [function () {
                return !this.user;
            }, 'guestId is required'],
            index: true,
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
