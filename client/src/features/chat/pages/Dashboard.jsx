import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Menu, SquarePen } from 'lucide-react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router';
import { useChat } from '../hooks/useChat';
import Sidebar from '../components/Sidebar';
import { clearGuestLimit } from '../chat.slice';
import '../styles/_dashboard.scss';

const Dashboard = () => {
    const dispatch = useDispatch();
    const chat = useChat();
    const navigate = useNavigate();
    const location = useLocation();
    const currentChatId = useSelector((state) => state.chat.currentChatId);
    const isGuest = useSelector((state) => state.auth.isGuest);

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const sessionType = isGuest ? 'guest' : 'user';

        dispatch(clearGuestLimit());

        // Initialize socket connection first, then register Redux listeners
        chat.initializeSocketConnection(sessionType);
        chat.registerSocketListeners(dispatch);

        // Fetch existing chats via HTTP
        chat.handleGetChats();
    }, [isGuest]);

    useEffect(() => {
        if (currentChatId && location.pathname !== `/c/${currentChatId}`) {
            navigate(`/c/${currentChatId}`);
        }
    }, [currentChatId]);

    const handleSelectChat = () => {
        setIsMobileMenuOpen(false);
    };

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    return (
        <div className="chat-dashboard">
            <div className="mobile-header">
                <button className="menu-btn" onClick={toggleMobileMenu}>
                    <Menu size={22} />
                </button>
                <Link
                    to="/"
                    className="new-chat-btn-mobile"
                    onClick={handleSelectChat}
                >
                    <SquarePen size={16} /> New Chat
                </Link>
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
