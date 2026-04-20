import 'dotenv/config';
import app from './src/app.js';
import connectToDb from './src/config/database.js';
import { testAi } from './src/services/ai.service.js';

const PORT = process.env.SERVER_PORT || 3000;


connectToDb();
app.listen(PORT, () => {
    console.log('server is running on port ', process.env.SERVER_PORT);
});
