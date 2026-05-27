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
        fullName: {
            type: String,
            trim: true,
        },
        googleId: {
            type: String,
            unique: true,
            trim: true,
        },
    },
    {
        strict: true,
        timestamps: true,
    },
);

const userModel = mongoose.model('users', userSchema);

export default userModel;
