import React from 'react';
import '../../styles/_chat-message-input.scss';

const ChatMessageInput = ({
    textareaRef,
    messageInput,
    hasChat,
    handleInputChange,
    handleSend,
    isAwaitingAI,
}) => {
    return (
        <div className="chat-input-container">
            <form className="hero-input-area" onSubmit={handleSend}>
                <div className="input-wrapper">
                    <textarea
                        ref={textareaRef}
                        className="hero-textarea"
                        placeholder={
                            hasChat
                                ? 'Ask anything...'
                                : "What's on your mind today?"
                        }
                        value={messageInput}
                        onChange={handleInputChange}
                        disabled={isAwaitingAI}
                    />
                    <div className="input-footer">
                        <button
                            type="submit"
                            className="hero-send-btn"
                            disabled={!messageInput.trim() || isAwaitingAI}
                        >
                            {isAwaitingAI ? (
                                <div className="spinner-small"></div>
                            ) : (
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <line x1="12" y1="19" x2="12" y2="5"></line>
                                    <polyline points="5 12 12 5 19 12"></polyline>
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ChatMessageInput;
