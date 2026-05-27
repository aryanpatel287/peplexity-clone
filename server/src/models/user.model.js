import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'username is required'],
            unique: true,
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'email is required'],
            unique: true,
            trim: true,
            lowercase: true,
        },
    },
    {
        strict: true,
        timestamps: true,
    },
);

const userModel = mongoose.model('users', userSchema);

export default userModel;
