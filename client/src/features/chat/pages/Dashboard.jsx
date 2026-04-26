import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Menu, SquarePen } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import Sidebar from '../components/Sidebar';
import '../styles/_dashboard.scss';
import { Outlet, useNavigate, useLocation } from 'react-router';

const Dashboard = () => {
    const dispatch = useDispatch();
    const chat = useChat();
    const navigate = useNavigate();
    const location = useLocation();
    const currentChatId = useSelector((state) => state.chat.currentChatId);

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        // Initialize socket connection first, then register Redux listeners
        chat.initializeSocketConnection();
        chat.registerSocketListeners(dispatch);

        // Fetch existing chats via HTTP
        chat.handleGetChats();
    }, []);

    useEffect(() => {
        if (currentChatId && location.pathname !== `/c/${currentChatId}`) {
            navigate(`/c/${currentChatId}`);
        }
    }, [currentChatId]);

    const handleSelectChat = (selectedChatId) => {
        setIsMobileMenuOpen(false);
        if (selectedChatId) {
            navigate(`/c/${selectedChatId}`);
        } else {
            navigate('/');
        }
    };

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    return (
        <div className="chat-dashboard">
            <div className="mobile-header">
                <button className="menu-btn" onClick={toggleMobileMenu}>
                    <Menu size={22} />
                </button>
                <button
                    className="new-chat-btn-mobile"
                    onClick={() => handleSelectChat(null)}
                >
                    <SquarePen size={16} /> New Chat
                </button>
            </div>

            <div className={`dashboard-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
                <Sidebar onSelectChat={handleSelectChat} />
            </div>

            {isMobileMenuOpen && (
                <div
                    className="mobile-overlay"
                    onClick={() => setIsMobileMenuOpen(false)}
                ></div>
            )}

            <div className="dashboard-main">
                <Outlet />
            </div>
        </div>
    );
};

export default Dashboard;
