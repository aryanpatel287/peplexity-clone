import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAuth } from '../hooks/useAuth';

const ProtectedPage = ({ children }) => {
    const user = useSelector((state) => state.auth.user);
    const loading = useSelector((state) => state.auth.loading);
    const isGuest = useSelector((state) => state.auth.isGuest);
    const sessionReady = useSelector((state) => state.auth.sessionReady);
    const { handleEnsureSession } = useAuth();

    useEffect(() => {
        if (!sessionReady) {
            handleEnsureSession();
        }
    }, [sessionReady, handleEnsureSession]);

    if (loading && !sessionReady) {
        return <h1>Loading</h1>;
    }

    return children;
};

export default ProtectedPage;
