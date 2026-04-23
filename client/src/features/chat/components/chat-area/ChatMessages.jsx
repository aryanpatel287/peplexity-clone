import React, { useRef, useEffect } from 'react';
import '../../styles/_chat-messages.scss';
import { useSelector } from 'react-redux';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ChatMessages = ({ activeChatId }) => {
    const chats = useSelector((state) => state.chat.chats);
    const messages = chats[activeChatId]?.messages;
    const loading = useSelector((state) => state.chat.loading);

    const messagesEndRef = useRef(null);
    const hasChat = !!activeChatId;
    const isAwaitingAI =
        loading &&
        messages &&
        messages.length > 0 &&
        messages[messages.length - 1].role === 'user';

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="chat-messages">
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
            {isAwaitingAI && (
                <div className="loading-container inline">
                    <div className="spinner"></div>
                    <span>AI is thinking...</span>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default ChatMessages;
