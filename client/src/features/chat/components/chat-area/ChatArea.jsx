import React, { useState, useRef, useEffect } from 'react';
import '../../styles/_chat-area.scss';
import { useSelector } from 'react-redux';
import { useChat } from '../../hooks/useChat';
import ChatMessages from './ChatMessages';
import ChatMessageInput from './ChatMessageInput';

const ChatArea = ({ activeChatId, setActiveChatId }) => {
    const chats = useSelector((state) => state.chat.chats);
    const currentChatId = useSelector((state) => state.chat.currentChatId);
    const messages = chats[activeChatId]?.messages;
    const loading = useSelector((state) => state.chat.loading);

    const { handleSendMessage } = useChat();

    const [messageInput, setMessageInput] = useState('');
    const textareaRef = useRef(null);

    const isAwaitingAI =
        loading &&
        messages &&
        messages.length > 0 &&
        messages[messages.length - 1].role === 'user';

    const handleInputChange = (e) => {
        const textarea = e.target;
        setMessageInput(textarea.value);
        textarea.style.height = '0px';
        textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    };

    let hasChat;
    useEffect(() => {
        hasChat = !!activeChatId;
    }, [activeChatId]);

    useEffect(() => {
        if (messageInput === '' && textareaRef.current) {
            textareaRef.current.style.height = '';
        }
    }, [messageInput]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!messageInput.trim() || isAwaitingAI) return;

        const msg = messageInput;
        setMessageInput('');
        if (textareaRef.current) textareaRef.current.style.height = '';

        await handleSendMessage({
            message: msg,
            chatId: activeChatId,
        });

        setActiveChatId(currentChatId);
    };

    return (
        <div className="chat-area">
            <ChatMessages activeChatId={activeChatId} />

            <ChatMessageInput
                textareaRef={textareaRef}
                messageInput={messageInput}
                hasChat={hasChat}
                handleInputChange={handleInputChange}
                handleSend={handleSend}
                isAwaitingAI={isAwaitingAI}
            />
        </div>
    );
};

export default ChatArea;
