import React, { useEffect } from 'react';
import { Navigate } from 'react-router';
import { useSelector } from 'react-redux';
import { useAuth } from '../hooks/useAuth';

const ProtectedPage = ({ children }) => {
    const user = useSelector((state) => state.auth.user);
    const loading = useSelector((state) => state.auth.loading);
    const { handleGetMe } = useAuth();

    useEffect(() => {
        if (!user) {
            handleGetMe();
        }
    }, []);

    if (loading && !user) {
        return <h1>Loading</h1>;
    }

    if (!loading && !user) {
        return <Navigate to={'/login'} replace />;
    }

    return children;
};

export default ProtectedPage;
