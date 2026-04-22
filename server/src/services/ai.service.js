import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatMistralAI } from '@langchain/mistralai';
import { AIMessage, HumanMessage, SystemMessage } from 'langchain';

const geminiModel = new ChatGoogleGenerativeAI({
    model: 'gemini-2.5-flash-lite',
    apiKey: process.env.GEMINI_API_KEY,
});

const mistralModel = new ChatMistralAI({
    model: 'mistral-small-latest',
    apiKey: process.env.MISTRAL_API_KEY,
});

export async function generateResponse(messages) {
    const mappedMessages = messages.map((message) => {
        console.log('message:', message);

        if (message.role == 'user') {
            return new HumanMessage(message);
        }
        if (message.role == 'ai') {
            return new AIMessage(message);
        }
    });

    const response = await geminiModel.invoke(mappedMessages);
    console.log(response);
    console.log('MappedMessages:  ', mappedMessages);

    return response.text;
}

export async function generateChatTitle(message) {
    const response = await mistralModel.invoke([
        new SystemMessage(`You are a helpful assistant that generates concise and descriptive titles for chat conversations. 
        User will provide you the first message of a chat conversation, your task is to create a title that accurately reflects the main topic or theme of the conversation. The title should be brief, ideally no more than 2-4 words, and should capture the essence of the discussion in a clear and engaging way.    
            `),
        new HumanMessage(
            `Generate a concise and descriptive title for a chat conversation based on the following message:
            "${message}". `,
        ),
    ]);

    return response.text;
}
