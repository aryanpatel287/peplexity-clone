import React, { useState, useRef, useEffect, useCallback } from 'react';
import '../../styles/_chat-area.scss';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router';
import { useChat } from '../../hooks/useChat';
import ChatMessages from './ChatMessages';
import ChatMessageInput from './ChatMessageInput';
import DragOverlay from './helpers/DragOverlay';
import { setCurrentChatId } from '../../chat.slice';

const ChatArea = () => {
    const { chatId: urlChatId } = useParams();
    const dispatch = useDispatch();

    const currentChatId = useSelector((state) => state.chat.currentChatId);
    const isSending = useSelector((state) => state.chat.isSending);
    const isUploading = useSelector((state) => state.chat.isUploading);
    const chats = useSelector((state) => state.chat.chats);

    const { handleSendMessageSocket, handleGetMessages, handleUploadFiles } = useChat();

    const [messageInput, setMessageInput] = useState('');
    const [pendingFiles, setPendingFiles] = useState([]);
    const [filePreviews, setFilePreviews] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const textareaRef = useRef(null);
    const dragCounterRef = useRef(0);

    useEffect(() => {
        if (urlChatId) {
            dispatch(setCurrentChatId(urlChatId));
            if (!chats[urlChatId]?.messagesLoaded) {
                handleGetMessages({ chatId: urlChatId });
            }
        } else {
            dispatch(setCurrentChatId(null));
        }
    }, [urlChatId]);

    const handleFileSelect = async (files) => {
        const fileArray = Array.from(files);

        const previews = fileArray.map((file) => ({
            name: file.name,
            preview: URL.createObjectURL(file),
            type: file.type,
        }));
        setFilePreviews((prev) => [...prev, ...previews]);

        const uploaded = await handleUploadFiles({ files: fileArray });
        if (uploaded) {
            setPendingFiles((prev) => [...prev, ...uploaded]);
        } else {
            setFilePreviews([]);
        }
    };

    const handleRemoveFile = (index) => {
        setFilePreviews((prev) => prev.filter((_, i) => i !== index));
        setPendingFiles((prev) => prev.filter((_, i) => i !== index));
    };

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
        textarea.style.transition = 'height 0.2s ease-out';
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
        if ((!messageInput.trim() && !pendingFiles.length) || isSending || isUploading) return;

        const msg = messageInput;
        const files = pendingFiles;

        setMessageInput('');
        setPendingFiles([]);
        setFilePreviews([]);
        if (textareaRef.current) textareaRef.current.style.height = '';

        handleSendMessageSocket({ message: msg, chatId: currentChatId, uploadedFiles: files });
    };

    const handleDragEnter = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounterRef.current += 1;
        if (dragCounterRef.current === 1) setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounterRef.current -= 1;
        if (dragCounterRef.current === 0) setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounterRef.current = 0;
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files?.length) handleFileSelect(files);
    }, []);

    return (
        <div
            className="chat-area"
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <DragOverlay visible={isDragging} />
            <ChatMessages />
            <ChatMessageInput
                textareaRef={textareaRef}
                messageInput={messageInput}
                hasChat={!!currentChatId}
                handleInputChange={handleInputChange}
                handleSend={handleSend}
                isAwaitingAI={isSending}
                isUploading={isUploading}
                filePreviews={filePreviews}
                onFileSelect={handleFileSelect}
                onRemoveFile={handleRemoveFile}
            />
        </div>
    );
};

export default ChatArea;
