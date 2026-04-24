import React, { useRef, useEffect } from 'react';
import '../../styles/_chat-messages.scss';
import { useSelector } from 'react-redux';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ChatMessages = () => {
    const chats = useSelector((state) => state.chat.chats);
    const currentChatId = useSelector((state) => state.chat.currentChatId);
    const messages = chats[currentChatId]?.messages;
    const loading = useSelector((state) => state.chat.loading);
    const isSending = useSelector((state) => state.chat.isSending);

    const messagesEndRef = useRef(null);
    const hasChat = !!currentChatId;

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className={`chat-messages ${hasChat ? '' : 'new-chat'}`}>
            {/* Spinner while fetching existing messages for a selected chat */}
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
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {message.content}
                                </ReactMarkdown>
                            ) : (
                                message.content
                            )}
                        </div>
                    </div>
                ))}

            {/* Inline spinner while waiting for AI reply */}
            {isSending && (
                <div className="ai-loading-container inline">
                    <div className="spinner"></div>
                    <span>AI is thinking...</span>
                </div>
            )}

            <div ref={messagesEndRef} />
        </div>
    );
};

export default ChatMessages;
