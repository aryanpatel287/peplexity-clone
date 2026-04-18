import 'dotenv/config';
import app from './src/app.js';
import connectToDb from './src/config/database.js';

connectToDb();
app.listen(process.env.SERVER_PORT, () => {
    console.log('server is running on port ', process.env.SERVER_PORT);
});
