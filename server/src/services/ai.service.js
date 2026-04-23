import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatMistralAI } from '@langchain/mistralai';
import { AIMessage, createAgent, HumanMessage, SystemMessage } from 'langchain';
import { emailTool, searchInternetTool } from './ai.tools.js';

const geminiModel = new ChatGoogleGenerativeAI({
    model: 'gemma-4-31b-it',
    apiKey: process.env.GEMINI_API_KEY,
});

export const geminiAgent = createAgent({
    model: geminiModel,
    tools: [emailTool, searchInternetTool],
});

const mistralModel = new ChatMistralAI({
    model: 'mistral-medium-latest',
    apiKey: process.env.MISTRAL_API_KEY,
});

export const mistralAgent = createAgent({
    model: mistralModel,
    tools: [emailTool, searchInternetTool],
});

export async function generateResponse(messages) {
    console.log('generate Response func called');

    console.log('messages: ', messages);

    const mappedMessages = messages.map((message) => {
        console.log('message: ', message);

        if (message.role == 'user') {
            return new HumanMessage(message.content);
        }
        if (message.role == 'ai') {
            return new AIMessage(message.content);
        }
    });

    const response = await mistralAgent.invoke({
        messages: mappedMessages,
    });

    return response.messages[response.messages.length - 1].text;
}

export async function generateChatTitle(message) {
    const response = await geminiModel.invoke([
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
