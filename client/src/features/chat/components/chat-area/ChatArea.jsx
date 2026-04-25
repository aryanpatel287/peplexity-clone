import React, { useState, useRef, useEffect } from 'react';
import '../../styles/_chat-area.scss';
import { useSelector } from 'react-redux';
import { useChat } from '../../hooks/useChat';
import ChatMessages from './ChatMessages';
import ChatMessageInput from './ChatMessageInput';

const ChatArea = () => {
    const currentChatId = useSelector((state) => state.chat.currentChatId);
    const isSending = useSelector((state) => state.chat.isSending);

    const { handleSendMessageSocket } = useChat();

    const [messageInput, setMessageInput] = useState('');
    const textareaRef = useRef(null);

    const handleInputChange = (e) => {
        const textarea = e.target;
        setMessageInput(textarea.value);
        textarea.style.height = '0px';
        textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    };

    useEffect(() => {
        if (messageInput === '' && textareaRef.current) {
            textareaRef.current.style.height = '';
        }
    }, [messageInput]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!messageInput.trim() || isSending) return;

        const msg = messageInput;
        setMessageInput('');
        if (textareaRef.current) textareaRef.current.style.height = '';

        handleSendMessageSocket({ message: msg, chatId: currentChatId });
    };

    return (
        <div className="chat-area">
            <ChatMessages />

            <ChatMessageInput
                textareaRef={textareaRef}
                messageInput={messageInput}
                hasChat={!!currentChatId}
                handleInputChange={handleInputChange}
                handleSend={handleSend}
                isAwaitingAI={isSending}
            />
        </div>
    );
};

export default ChatArea;
