import React from 'react';
import { Trash, SquarePen } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useChat } from '../hooks/useChat';
import LogoutButton from '../../auth/components/LogoutButton';
import '../styles/_sidebar.scss';
import UserDetailCard from '../../auth/components/UserDetailCard';

const Sidebar = ({ onSelectChat }) => {
    const chats = useSelector((state) => state.chat.chats);
    const loading = useSelector((state) => state.chat.loading);
    const currentChatId = useSelector((state) => state.chat.currentChatId);
    const { handleDeleteChat } = useChat();

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
                                        handleDeleteChat({ chatId: chat._id });
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
        </div>
    );
};

export default Sidebar;
