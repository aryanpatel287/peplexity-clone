import React from 'react';
import { ArrowUp } from 'lucide-react';
import { MediaPreviewStrip, MediaAttachButton } from './helpers/MediaInput';
import '../../styles/_chat-message-input.scss';

const ChatMessageInput = ({
    textareaRef,
    messageInput,
    hasChat,
    handleInputChange,
    handleSend,
    isAwaitingAI,
    isUploading,
    filePreviews,
    onFileSelect,
    onRemoveFile,
}) => {
    const isDisabled = isAwaitingAI || isUploading;
    const canSend = (messageInput.trim() || filePreviews?.length > 0) && !isDisabled;

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (canSend) handleSend(e);
        }
    };

    return (
        <div className={`chat-input-container${hasChat ? '' : ' new-chat'}`}>
            <form className="chat-input-form" onSubmit={handleSend}>
                <div className="input-wrapper">
                    <MediaPreviewStrip 
                        filePreviews={filePreviews} 
                        onRemoveFile={onRemoveFile} 
                    />

                    <textarea
                        ref={textareaRef}
                        className="chat-textarea"
                        rows={1}
                        placeholder={hasChat ? 'Ask anything...' : "What's on your mind today?"}
                        value={messageInput}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        disabled={isDisabled}
                    />

                    <div className="input-footer">
                        <MediaAttachButton 
                            isUploading={isUploading} 
                            isDisabled={isDisabled} 
                            onFileSelect={onFileSelect} 
                        />

                        <button type="submit" className="send-btn" disabled={!canSend}>
                            {isAwaitingAI ? <div className="spinner-small" /> : <ArrowUp size={18} />}
                        </button>
                    </div>
                </div>
            </form>
            <p className={`input-disclaimer${hasChat ? '' : ' new-chat'}`}>
                Perplexity Clone can make mistakes and may provide outdated information.<br />
                Always verify critical details from reliable sources.
            </p>
        </div>
    );
};

export default ChatMessageInput;
