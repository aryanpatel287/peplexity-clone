import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatMistralAI, MistralAIEmbeddings } from '@langchain/mistralai';
import { createAgent, modelCallLimitMiddleware } from 'langchain';
import {
    emailTool,
    getCurrentDateTimeTool,
    searchInternetTool,
    createContextRetrieverTool,
} from './tools.ai.service.js';
import envConfig from '../../config/envconfig.js';
import { DocumentSummaryStructure } from './response-structure.ai.service.js';

const toolAgentSystemPrompt = `You are an AI assistant that can use tools when needed.

Rules:

* If data is real-time, future, or uncertain → use tools
* Never guess unknown facts
* Never claim tool usage unless actually called
* If tool is needed → return ONLY tool call
* Otherwise → return final answer

Time Awareness:

* If the user asks about current time, date, today, or now → MUST call the 'getCurrentDateTimeTool' tool
* Never guess current time or date
* Never answer time-related queries from memory
* Always rely on the tool for accurate time information

If unsure → use tools, not reasoning.
`;

const geminiModel = new ChatGoogleGenerativeAI({
    model: 'gemma-4-31b-it',
    apiKey: envConfig.GEMINI_API_KEY,
    maxConcurrency: 3,
});

export function getGeminiAgent(chatId) {
    const contextRetrieverToolForChat = createContextRetrieverTool(chatId);

    return createAgent({
        model: geminiModel,
        systemPrompt: toolAgentSystemPrompt,
        tools: [
            emailTool,
            searchInternetTool,
            getCurrentDateTimeTool,
            contextRetrieverToolForChat,
        ],
        middleware: [
            modelCallLimitMiddleware({
                runLimit: 5,
                exitBehavior: 'end',
            }),
        ],
    });
}

export const geminiAgent = getGeminiAgent();

export const geminiSummariseModel = new ChatGoogleGenerativeAI({
    model: 'gemini-3.1-flash-lite',
    apiKey: envConfig.GEMINI_API_KEY,
    maxConcurrency: 5,
});

export const geminiSummariseAgent = createAgent({
    model: geminiSummariseModel,
    responseFormat: DocumentSummaryStructure,
});

const mistralModel = new ChatMistralAI({
    model: 'mistral-medium-latest',
    apiKey: envConfig.MISTRAL_API_KEY,
    maxConcurrency: 3,
});

const mistralEmbeddingModel = new MistralAIEmbeddings({
    apiKey: envConfig.MISTRAL_API_KEY,
    model: 'mistral-embed',
});

export function getMistralAgent(chatId) {
    const contextRetrieverToolForChat = createContextRetrieverTool(chatId);

    return createAgent({
        model: mistralModel,
        systemPrompt: toolAgentSystemPrompt,
        tools: [
            emailTool,
            searchInternetTool,
            getCurrentDateTimeTool,
            contextRetrieverToolForChat,
        ],
        middleware: [
            modelCallLimitMiddleware({
                runLimit: 5,
                exitBehavior: 'end',
            }),
        ],
    });
}

export const mistralAgent = getMistralAgent();

export { geminiModel, mistralModel, mistralEmbeddingModel };
