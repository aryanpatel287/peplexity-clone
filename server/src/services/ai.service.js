import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

const model = new ChatGoogleGenerativeAI({
    model: 'gemini-2.5-flash-lite',
    apiKey: process.env.GEMINI_API_KEY,
});

export async function testAi() {
    model.invoke('What is Ai , explain in 10 words').then((response) => {
        console.log('response: ', response);
        console.log('response - text: ', response.text);
    });
}
