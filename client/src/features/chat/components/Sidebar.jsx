import React, { useState } from 'react';
import { Link } from 'react-router';
import { Trash, SquarePen, User, ChevronRight } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useChat } from '../hooks/useChat';
import { useAuth } from '../../auth/hooks/useAuth';
import LogoutButton from '../../auth/components/LogoutButton';
import '../styles/_sidebar.scss';
import UserDetailCard from '../../auth/components/UserDetailCard';
import ConfirmModal from '../../shared/components/ConfirmModal';

const Sidebar = ({ onSelectChat }) => {
    const repoUrl =
        'https://github.com/aryanpatel287/Cohort2.0-Backend/tree/main/Perplexity';

    const chats = useSelector((state) => state.chat.chats);
    const loading = useSelector((state) => state.chat.loading);
    const currentChatId = useSelector((state) => state.chat.currentChatId);
    const isGuest = useSelector((state) => state.auth.isGuest);
    const { handleDeleteChat } = useChat();
    const { handleOpenSignUpModal } = useAuth();

    const [chatToDelete, setChatToDelete] = useState(null);

    return (
        <div className="chat-sidebar">
            <div className="sidebar-header">
                <div className="sidebar-header-actions">
                    <Link
                        to="/"
                        className="new-chat-btn"
                        onClick={onSelectChat}
                    >
                        <SquarePen size={15} />
                        New Chat
                    </Link>

                    <a
                        href={repoUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="github-link-btn"
                        aria-label="Open project GitHub repository"
                        title="Open GitHub Repository"
                    >
                        <i className="ri-github-fill github-icon" />
                    </a>
                </div>
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
                            <Link
                                key={chat._id}
                                to={`/c/${chat._id}`}
                                className={`chat-item ${currentChatId === chat._id ? 'active' : ''}`}
                                onClick={onSelectChat}
                            >
                                <div className="chat-title">{chat.title}</div>
                                <button
                                    className="chat-delete-btn"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setChatToDelete(chat._id);
                                    }}
                                >
                                    <Trash size={14} />
                                </button>
                            </Link>
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
                {isGuest ? (
                    <button onClick={handleOpenSignUpModal} className="sidebar-signin">
                        <span className="signin-icon">
                            <User size={16} />
                        </span>
                        <span className="signin-text">Sign In</span>
                        <ChevronRight size={16} className="signin-chevron" />
                    </button>
                ) : (
                    <>
                        <UserDetailCard />
                        <LogoutButton />
                    </>
                )}
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
