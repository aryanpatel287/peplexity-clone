import React, { useEffect } from 'react';
import LogoutButton from '../../auth/components/LogoutButton';
import '../styles/_sidebar.scss';
import { useSelector } from 'react-redux';
import { useChat } from '../hooks/useChat';

const Sidebar = ({ activeChatId, onSelectChat }) => {
    const chats = useSelector((state) => state.chat.chats);
    const loading = useSelector((state) => state.chat.loading);

    return (
        <div className="chat-sidebar">
            <div className="sidebar-header">
                <button
                    className="new-chat-btn"
                    onClick={() => onSelectChat(null)}
                >
                    <span
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}
                    >
                        <span className="plus-icon">+</span> New Chat
                    </span>
                    <span className="shortcut">⌘N</span>
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
                                className={`chat-item ${activeChatId === chat._id ? 'active' : ''}`}
                                onClick={() => onSelectChat(chat._id)}
                            >
                                <div className="chat-title">{chat.title}</div>
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
                <LogoutButton />
            </div>
        </div>
    );
};

export default Sidebar;
