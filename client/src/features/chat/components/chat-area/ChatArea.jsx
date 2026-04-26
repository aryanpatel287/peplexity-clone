import React, { useState, useRef, useEffect } from 'react';
import '../../styles/_chat-area.scss';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router';
import { useChat } from '../../hooks/useChat';
import ChatMessages from './ChatMessages';
import ChatMessageInput from './ChatMessageInput';
import { setCurrentChatId } from '../../chat.slice';

const ChatArea = () => {
    const { chatId: urlChatId } = useParams();
    const dispatch = useDispatch();

    const currentChatId = useSelector((state) => state.chat.currentChatId);
    const isSending = useSelector((state) => state.chat.isSending);

    const { handleSendMessageSocket, handleGetMessages } = useChat();

    const [messageInput, setMessageInput] = useState('');
    const textareaRef = useRef(null);

    useEffect(() => {
        if (urlChatId) {
            dispatch(setCurrentChatId(urlChatId));
            handleGetMessages({ chatId: urlChatId });
        } else {
            dispatch(setCurrentChatId(null));
        }
    }, [urlChatId]);

    const handleInputChange = (e) => {
        const textarea = e.target;
        setMessageInput(textarea.value);

        const currentHeight = textarea.style.height;

        textarea.style.transition = 'none';
        textarea.style.height = '0px';
        const newHeight = Math.min(textarea.scrollHeight, 200);

        textarea.style.overflowY = textarea.scrollHeight > 200 ? 'auto' : 'hidden';

        textarea.style.height = currentHeight || '';

        void textarea.offsetHeight;
        textarea.style.transition = 'height 0.3s ease-out';
        textarea.style.height = `${newHeight}px`;
    };

    useEffect(() => {
        if (messageInput === '' && textareaRef.current) {
            textareaRef.current.style.transition = 'height 0.2s ease-out';
            textareaRef.current.style.height = '';
        }
    }, [messageInput]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!messageInput.trim() || isSending) return;

        const msg = messageInput;
        setMessageInput('');
        if (textareaRef.current) textareaRef.current.style.height = '';

        // currentChatId is synced from urlChatId (or null for new chat)
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
