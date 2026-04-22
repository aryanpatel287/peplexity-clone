import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import LogoutButton from '../../auth/components/LogoutButton';
import { useChat } from '../hooks/useChat';

const Dashboard = () => {
    const chat = useChat();

    const user = useSelector((state) => state.auth);

    useEffect(() => {
        chat.initializeSocketConnection();
    }, []);

    return (
        <div>
            DashBoard
            <LogoutButton />
        </div>
    );
};

export default Dashboard;
