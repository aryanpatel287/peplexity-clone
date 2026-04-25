import React, { useRef, useEffect, useState } from 'react';
import '../../styles/_chat-messages.scss';
import { useSelector } from 'react-redux';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChevronDown } from 'lucide-react';

// ─── Tool label map ───────────────────────────────────────────────────────────
const TOOL_LABELS = {
    searchInternetTool: { icon: '🔍', label: 'Searching the web' },
    search_internet:    { icon: '🔍', label: 'Searching the web' },
    emailTool:          { icon: '📧', label: 'Sending email' },
    send_email:         { icon: '📧', label: 'Sending email' },
};

// ─── ThinkingBubble ───────────────────────────────────────────────────────────
const ThinkingBubble = ({ thinking }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="thinking-bubble">
            <button className="thinking-toggle" onClick={() => setOpen((o) => !o)}>
                <span>Thought for a moment</span>
                <ChevronDown size={14} className={`chevron ${open ? 'open' : ''}`} />
            </button>
            {open && (
                <div className="thinking-content">
                    {thinking}
                </div>
            )}
        </div>
    );
};

// ─── ToolStatus ──────────────────────────────────────────────────────────────
const ToolStatus = ({ toolName, done }) => {
    const info = TOOL_LABELS[toolName] ?? { icon: '⚙️', label: toolName };
    return (
        <div className={`tool-status ${done ? 'done' : 'active'}`}>
            <span className="tool-icon">{info.icon}</span>
            <span>{info.label}{done ? '.' : '...'}</span>
            {!done && <span className="tool-spinner" />}
        </div>
    );
};

// ─── AnimatedText ─────────────────────────────────────────────────────────────
// Renders text letter-by-letter at `speed` ms/char, then calls onDone.
const AnimatedText = ({ text, speed = 5, onDone }) => {
    const [displayed, setDisplayed] = useState('');
    const indexRef = useRef(0);

    useEffect(() => {
        indexRef.current = 0;
        setDisplayed('');

        const interval = setInterval(() => {
            indexRef.current += 1;
            setDisplayed(text.slice(0, indexRef.current));
            if (indexRef.current >= text.length) {
                clearInterval(interval);
                onDone?.();
            }
        }, speed);

        return () => clearInterval(interval);
    }, [text]);

    return (
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {displayed}
        </ReactMarkdown>
    );
};

// ─── ChatMessages ─────────────────────────────────────────────────────────────
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

            {hasChat && messages?.map((message, index) => (
                <div
                    key={index}
                    className={`message ${message.role === 'user' ? 'user-message' : 'ai-message'}`}
                >
                    <div className="message-content">
                        {message.role === 'ai' ? (
                            <>
                                {/* Thinking bubble */}
                                {message.thinking && (
                                    <ThinkingBubble thinking={message.thinking} />
                                )}

                                {/* Tool status chips */}
                                {message.toolCalls?.map((tool, i) => (
                                    <ToolStatus
                                        key={i}
                                        toolName={tool}
                                        done={!isSending || index < messages.length - 1}
                                    />
                                ))}

                                {/* Response — animate only the just-arrived message */}
                                {message.content && (
                                    index === animatingIndex ? (
                                        <AnimatedText
                                            text={message.content}
                                            onDone={() => setAnimatingIndex(null)}
                                        />
                                    ) : (
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {message.content}
                                        </ReactMarkdown>
                                    )
                                )}
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
