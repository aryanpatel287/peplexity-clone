import { useRef, useEffect, useState } from 'react';
import '../../styles/_chat-messages.scss';
import { useSelector } from 'react-redux';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ThinkingBubble from './helpers/ThinkingBubble';
import ToolStatus from './helpers/ToolStatus';
import AnimatedText from './helpers/AnimatedText';
import { TOOL_LABELS } from './helpers/chat.constants';

const ChatMessages = () => {
    const chats = useSelector((state) => state.chat.chats);
    const currentChatId = useSelector((state) => state.chat.currentChatId);
    const messages = chats[currentChatId]?.messages;
    const loading = useSelector((state) => state.chat.loading);
    const isSending = useSelector((state) => state.chat.isSending);

    const messagesEndRef = useRef(null);
    const hasChat = !!currentChatId;

    // Track which message index to animate (the just-finalized AI response)
    const [animatingIndex, setAnimatingIndex] = useState(null);
    const prevIsSendingRef = useRef(false);

    // Detect isSending false → animation trigger
    useEffect(() => {
        if (prevIsSendingRef.current && !isSending && messages?.length > 0) {
            setAnimatingIndex(messages.length - 1);
        }
        prevIsSendingRef.current = isSending;
    }, [isSending]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className={`chat-messages ${hasChat ? '' : 'new-chat'}`}>
            {/* Spinner while fetching messages for a selected chat */}
            {hasChat && loading && (!messages || messages.length === 0) && (
                <div className="loading-container">
                    <div className="spinner"></div>
                    <span>Loading messages...</span>
                </div>
            )}

            {hasChat &&
                messages?.map((message, index) => (
                    <div
                        key={index}
                        className={`message ${message.role === 'user' ? 'user-message' : 'ai-message'}`}
                    >
                        <div className="message-content">
                            {message.role === 'ai' ? (
                                <>
                                    {/* Thinking bubble - suppressed if current tool is hidden */}
                                    {message.thinking &&
                                        !message.toolCalls?.some(
                                            (t) => TOOL_LABELS[t]?.hidden,
                                        ) && (
                                            <ThinkingBubble
                                                thinking={message.thinking}
                                            />
                                        )}

                                    {/* Tool status chips */}
                                    {message.toolCalls?.map((tool, i) => (
                                        <ToolStatus
                                            key={i}
                                            toolName={tool}
                                            done={
                                                !isSending ||
                                                index < messages.length - 1
                                            }
                                        />
                                    ))}

                                    {/* Response — animate only the just-arrived message */}
                                    {message.content &&
                                        (index === animatingIndex ? (
                                            <AnimatedText
                                                text={message.content}
                                                onDone={() =>
                                                    setAnimatingIndex(null)
                                                }
                                            />
                                        ) : (
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                            >
                                                {message.content}
                                            </ReactMarkdown>
                                        ))}
                                </>
                            ) : (
                                message.content
                            )}
                        </div>
                    </div>
                ))}

            {/* "AI is thinking..." spinner — hide once ThinkingBubble takes over */}
            {isSending && !messages?.[messages.length - 1]?.thinking && (
                <div className="ai-loading-container">
                    <div className="spinner"></div>
                    <span>AI is thinking...</span>
                </div>
            )}

            <div ref={messagesEndRef} />
        </div>
    );
};

export default ChatMessages;
