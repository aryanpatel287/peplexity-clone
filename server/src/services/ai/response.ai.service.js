import { AIMessage, HumanMessage, SystemMessage } from 'langchain';
import {
    geminiAgent,
    mistralAgent,
    mistralModel,
    geminiSummariseAgent,
} from './models.ai.service.js';
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
		User will provide you the first message of a chat conversation, your task is to create a title that accurately reflects the main topic or theme of the conversation. The title should be brief, ideally no more than 2-4 words, and should capture the essence of the discussion in a clear and engaging way.Return a title as normal string not markdown    
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
function formatFileMetadata(file) {
    const metadata = file.metadata || {};
    let context = `\n\n---`;
    context += `\n### [Attached Document: ${file.name}]`;
    if (metadata.title) context += `\n- **Title:** ${metadata.title}`;
    if (metadata.summary) context += `\n- **Summary:** ${metadata.summary}`;
    if (metadata.suggestedSystemContext)
        context += `\n- **Context:** ${metadata.suggestedSystemContext}`;

    if (Array.isArray(metadata.sections) && metadata.sections.length > 0) {
        context += `\n- **Key Sections:** ${metadata.sections.join(', ')}`;
    }
    if (Array.isArray(metadata.keywords) && metadata.keywords.length > 0) {
        context += `\n- **Keywords:** ${metadata.keywords.join(', ')}`;
    }

    context += `\n*Note: The complete text of this document has been indexed and is searchable. If you need to retrieve specific details, direct quotes, or deep context from this document, use the \`contextRetrieverTool\`.*`;
    return context;
}

export async function streamAiReponse(
    messageHistory,
    userFiles,
    { onThinking, onToolCall } = {},
) {
    const lastIndex = messageHistory.length - 1;

    const mappedMessages = messageHistory
        .map((message, index) => {
            if (message.role === 'user') {
                const content = [{ type: 'text', text: message.content }];

                if (index === lastIndex && userFiles?.length) {
                    let docContexts = '';
                    for (const file of userFiles) {
                        if (file.mimetype?.startsWith('image/')) {
                            content.push({ type: 'image', url: file.url });
                        } else {
                            docContexts += formatFileMetadata(file);
                        }
                    }
                    if (docContexts) {
                        content[0].text += docContexts;
                    }
                }

                return new HumanMessage({ role: 'user', content });
            }

            if (message.role === 'ai') {
                return new AIMessage(message.content);
            }

            return null;
        })
        .filter(Boolean);

    const stream = await geminiAgent.stream(
        {
            messages: mappedMessages,
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
            }
        }

        // --- Tool calls (after thinking extraction)
        if (latest.tool_calls?.length > 0) {
            if (onToolCall) {
                latest.tool_calls.forEach((t) => {
                    onToolCall(t.name);
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

export async function summariseFileWithAi(file) {
    if (!file) {
        throw new Error('File not found');
    }

    const result = await geminiSummariseAgent.invoke({
        messages: [
            new SystemMessage(
                `You are a helpful assistant that summarises documents. Your task is to create a summary of the document that accurately reflects the main topic or theme of the document. The summary should be brief, ideally no more than 200 words, and should capture the essence of the document in a clear and engaging way.Return a summary as normal string not markdownAnalyze the provided document and populate the schema.

                Guidelines:
                - Use only document content.
                - Do not hallucinate or infer unsupported information.
                - Keep summaries concise and information-dense.
                - Generate realistic retrieval queries.
                - suggestedSystemContext should help an AI understand the document quickly.

                Return output that strictly matches the schema.`,
            ),
            new HumanMessage(
                `Generate the summary of the following markdown content: 
			${file.markdown_full}
			`,
            ),
        ],
    });

    return result.structuredResponse;
}
