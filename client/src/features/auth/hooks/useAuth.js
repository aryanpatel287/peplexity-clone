import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import {
    register,
    login,
    logout,
    getMe,
    resendVerificationEmail,
    forgotPasswordEmail,
    updatePassword,
} from '../services/auth.api';

import { setUser, setError, setLoading } from '../auth.slice';

export function useAuth() {
    const dispatch = useDispatch();

    const handleRegister = useCallback(async ({ username, email, password }) => {
        try {
            dispatch(setLoading(true));
            dispatch(setError(null));
            const data = await register({ username, email, password });
        } catch (error) {
            console.log(error);
            dispatch(
                setError(
                    error.response?.data?.message || 'Registration failed',
                ),
            );
        } finally {
            dispatch(setLoading(false));
        }
    }, [dispatch]);

    const handleLogin = useCallback(async ({ email, password }) => {
        try {
            dispatch(setLoading(true));
            dispatch(setError(null));
            const data = await login({ email, password });
            dispatch(setUser(data.user));
            return data.user;
        } catch (error) {
            dispatch(setError(error.response?.data?.message || 'Login failed'));
            return null;
        } finally {
            dispatch(setLoading(false));
        }
    }, [dispatch]);

    const handleResendVerificationEmail = useCallback(async ({ email }) => {
        try {
            dispatch(setLoading(true));
            dispatch(setError(null));
            const data = await resendVerificationEmail({ email });
        } catch (error) {
            dispatch(
                setError(
                    error.response?.data?.message ||
                        'Failed to resend verification email',
                ),
            );
        } finally {
            dispatch(setLoading(false));
        }
    }, [dispatch]);

    const handleGetMe = useCallback(async () => {
        try {
            dispatch(setLoading(true));
            dispatch(setError(null));
            const data = await getMe();
            dispatch(setUser(data.user));
        } catch (error) {
            dispatch(
                setError(
                    error.response?.data?.message || 'Failed to fetch user',
                ),
            );
        } finally {
            dispatch(setLoading(false));
        }
    }, [dispatch]);

    const handleLogout = useCallback(async () => {
        try {
            dispatch(setLoading(true));
            dispatch(setError(null));
            const data = await logout();
            dispatch(setUser(null));
        } catch (error) {
            dispatch(
                setError(error.response?.data?.message || 'Logout failed'),
            );
        } finally {
            dispatch(setLoading(false));
        }
    }, [dispatch]);

    const handleForgotPassword = useCallback(async ({ email }) => {
        try {
            dispatch(setLoading(true));
            dispatch(setError(null));
            const data = await forgotPasswordEmail({ email });
        } catch (error) {
            dispatch(
                setError(error.response?.data?.message || 'Logout failed'),
            );
        } finally {
            dispatch(setLoading(false));
        }
    }, [dispatch]);

    const handleUpdatePassword = useCallback(async ({ password, token }) => {
        try {
            dispatch(setLoading(true));
            dispatch(setError(null));
            const data = await updatePassword({ password, token });
        } catch (error) {
            dispatch(
                setError(error.response?.data?.message || 'Logout failed'),
            );
        } finally {
            dispatch(setLoading(false));
        }
    }, [dispatch]);

    return {
        handleRegister,
        handleLogin,
        handleGetMe,
        handleResendVerificationEmail,
        handleLogout,
        handleForgotPassword,
        handleUpdatePassword,
    };
}
