import mongoose from 'mongoose';
import envConfig from './envconfig.js';

async function connectToDb() {
    try {
        await mongoose.connect(envConfig.MONGO_URI);
        console.log('connected to database');
    } catch (error) {
        throw error;
    }
}

export default connectToDb;
