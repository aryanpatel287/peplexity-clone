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
    const mappedMessages = messages.map((message) => {
        if (message.role == 'user') return new HumanMessage(message.content);
        if (message.role == 'ai') return new AIMessage(message.content);
    });

    const response = await mistralAgent.invoke({ messages: mappedMessages });
    return response.messages[response.messages.length - 1].text;
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

/**
 * Streams the AI agent response.
 *
 * Chunk structure (from real output):
 *   - When thinking + tool call:  content is Array [{ type:'thinking', thinking:'...' }, { type:'functionCall', ... }]
 *                                 AND tool_calls: [{ name, args, ... }]
 *   - After tool execution:       content is plain String — the final answer
 *
 * @param {Array}    messageHistory  Full chat history ({ role, content })
 * @param {Object}   callbacks
 * @param {Function} callbacks.onThinking  Called with the AI's thinking text
 * @param {Function} callbacks.onToolCall  Called with tool name (e.g. 'emailTool')
 */
export async function streamAiReponse(
    messageHistory,
    { onThinking, onToolCall } = {},
) {
    const mappedMessages = messageHistory.map((message) => {
        if (message.role === 'user') return new HumanMessage(message.content);
        if (message.role === 'ai') return new AIMessage(message.content);
    });

    const stream = await geminiAgent.stream(
        {
            messages: [
                new SystemMessage(`You are a helpful assistant that generates concise and descriptive titles for chat conversations. 
        User will provide you the first message of a chat conversation, your task is to create a title that accurately reflects the main topic or theme of the conversation. The title should be brief, ideally no more than 2-4 words, and should capture the essence of the discussion in a clear and engaging way.    
            `),
                ...mappedMessages,
            ],
        },
        { streamMode: 'values' },
    );

    let finalText = '';

    for await (const chunk of stream) {
        const latest = chunk.messages?.at(-1);
        if (!latest) continue;

        const content = latest.content;

        // --- Thinking extraction (MUST happen before tool_calls check)
        // Thinking arrives in the same message that also has functionCall/tool_calls
        if (Array.isArray(content)) {
            const thinkingPart = content.find((p) => p.type === 'thinking');
            if (thinkingPart?.thinking && onThinking) {
                onThinking(thinkingPart.thinking);
                console.log('thinking: ', thinkingPart.thinking);
            }
        }

        // --- Tool calls (after thinking extraction)
        if (latest.tool_calls?.length > 0) {
            if (onToolCall) {
                latest.tool_calls.forEach((t) => {
                    onToolCall(t.name);
                    console.log('toolName: ', t.name);
                });
            }
            continue; // no text to extract from this chunk
        }

        // --- Final text (plain string, after tools execute)
        const text =
            typeof content === 'string'
                ? content
                : Array.isArray(content)
                  ? content
                        .filter(
                            (p) =>
                                p.type !== 'thinking' &&
                                p.type !== 'functionCall',
                        )
                        .map((p) => p.text || '')
                        .join('')
                  : '';

        if (text) finalText = text;
    }

    return finalText;
}
