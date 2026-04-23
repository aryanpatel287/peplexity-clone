import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useChat } from '../hooks/useChat';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/chat-area/ChatArea';
import '../styles/_dashboard.scss';

const Dashboard = () => {
    const chat = useChat();
    const user = useSelector((state) => state.auth);

    const [activeChatId, setActiveChatId] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        chat.initializeSocketConnection();
        chat.handleGetChats();
    }, []);

    const handleSelectChat = (selectedChatId) => {
        setActiveChatId(selectedChatId);
        chat.handleGetMessages({ chatId: selectedChatId });
        setIsMobileMenuOpen(false); // Close menu on mobile after selection
    };

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    return (
        <div className="chat-dashboard">
            {/* Mobile Header */}
            <div className="mobile-header">
                <button className="menu-btn" onClick={toggleMobileMenu}>
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </button>
                <button
                    className="new-chat-btn-mobile"
                    onClick={() => handleSelectChat(null)}
                >
                    <span className="plus-icon">+</span> New Chat
                </button>
            </div>

            <div
                className={`dashboard-sidebar ${isMobileMenuOpen ? 'open' : ''}`}
            >
                <Sidebar
                    activeChatId={activeChatId}
                    onSelectChat={handleSelectChat}
                />
            </div>

            {/* Overlay for mobile menu */}
            {isMobileMenuOpen && (
                <div
                    className="mobile-overlay"
                    onClick={() => setIsMobileMenuOpen(false)}
                ></div>
            )}

            <div className="dashboard-main">
                <ChatArea
                    activeChatId={activeChatId}
                    setActiveChatId={setActiveChatId}
                />
            </div>
        </div>
    );
};

export default Dashboard;
