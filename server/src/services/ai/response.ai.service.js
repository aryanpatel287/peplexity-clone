import { AIMessage, HumanMessage, SystemMessage } from 'langchain';
import { geminiAgent, mistralAgent, mistralModel } from './models.ai.service.js';

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
					for (const file of userFiles) {
						if (file.mimetype?.startsWith('image/')) {
							content.push({ type: 'image', url: file.url });
							continue;
						}

						if (file.mimetype === 'application/pdf') {
							content.push({
								type: 'file',
								url: file.url,
								mimeType: file.mimetype,
								name: file.name,
							});

							console.log(file.url);
						}
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
