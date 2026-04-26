import React, { useState } from 'react';
import { Trash, SquarePen } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useChat } from '../hooks/useChat';
import LogoutButton from '../../auth/components/LogoutButton';
import '../styles/_sidebar.scss';
import UserDetailCard from '../../auth/components/UserDetailCard';
import ConfirmModal from '../../shared/components/ConfirmModal';

const Sidebar = ({ onSelectChat }) => {
    const chats = useSelector((state) => state.chat.chats);
    const loading = useSelector((state) => state.chat.loading);
    const currentChatId = useSelector((state) => state.chat.currentChatId);
    const { handleDeleteChat } = useChat();

    const [chatToDelete, setChatToDelete] = useState(null);

    return (
        <div className="chat-sidebar">
            <div className="sidebar-header">
                <button
                    className="new-chat-btn"
                    onClick={() => onSelectChat(null)}
                >
                    <SquarePen size={15} />
                    New Chat
                </button>
            </div>

            <div className="chat-list">
                <div className="recent-label">Recent</div>
                {loading && !chats ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <span>Loading chats...</span>
                    </div>
                ) : chats && Object.values(chats).length > 0 ? (
                    <>
                        {Object.values(chats).map((chat) => (
                            <div
                                key={chat._id}
                                className={`chat-item ${currentChatId === chat._id ? 'active' : ''}`}
                                onClick={() => onSelectChat(chat._id)}
                            >
                                <div className="chat-title">{chat.title}</div>
                                <button
                                    className="chat-delete-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setChatToDelete(chat._id);
                                    }}
                                >
                                    <Trash size={14} />
                                </button>
                            </div>
                        ))}
                    </>
                ) : (
                    <div className="empty-chat-list">
                        <p>It's quiet in here...</p>
                        <span>Start a new chat to spark some ideas!</span>
                    </div>
                )}
            </div>

            <div className="sidebar-footer">
                <UserDetailCard />
                <LogoutButton />
            </div>

            <ConfirmModal
                isOpen={!!chatToDelete}
                onClose={() => setChatToDelete(null)}
                onConfirm={() => {
                    if (chatToDelete) {
                        handleDeleteChat({ chatId: chatToDelete });
                        setChatToDelete(null);
                    }
                }}
                title="Delete Chat"
                message="Are you sure you want to delete this chat? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
            />
        </div>
    );
};

export default Sidebar;
