import React from 'react';
import { ArrowUp } from 'lucide-react';
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
        <div className={`chat-input-container ${hasChat ? '' : 'new-chat'}`}>
            <form className="chat-input-form" onSubmit={handleSend}>
                <div className="input-wrapper">
                    <textarea
                        ref={textareaRef}
                        className="chat-textarea"
                        rows={1}
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
                            className="send-btn"
                            disabled={!messageInput.trim() || isAwaitingAI}
                        >
                            {isAwaitingAI ? (
                                <div className="spinner-small"></div>
                            ) : (
                                <ArrowUp size={18} />
                            )}
                        </button>
                    </div>
                </div>
            </form>
            <p className={`input-disclaimer ${hasChat ? '' : 'new-chat'}`} >
                Perplexity Clone can make mistakes and may provide outdated information.<br />
                Always verify critical details from reliable sources.
            </p>
        </div>
    );
};

export default ChatMessageInput;
