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
import { useEffect } from 'react';

export function useAuth() {
    const dispatch = useDispatch();

    async function handleRegister({ username, email, password }) {
        try {
            dispatch(setLoading(true));
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
    }

    async function handleLogin({ email, password }) {
        try {
            dispatch(setLoading(true));
            const data = await login({ email, password });
            dispatch(setUser(data.user));
        } catch (error) {
            dispatch(setError(error.response?.data?.message || 'Login failed'));
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleResendVerificationEmail({ email }) {
        try {
            dispatch(setLoading(true));
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
    }

    async function handleGetMe() {
        try {
            dispatch(setLoading(true));
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
    }

    async function handleLogout() {
        try {
            dispatch(setLoading(true));
            const data = await logout();
            dispatch(setUser(null));
        } catch (error) {
            dispatch(
                setError(error.response?.data?.message || 'Logout failed'),
            );
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleForgotPassword({ email }) {
        try {
            dispatch(setLoading(true));
            const data = await forgotPasswordEmail({ email });
        } catch (error) {
            dispatch(
                setError(error.response?.data?.message || 'Logout failed'),
            );
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleUpdatePassword({ password, token }) {
        try {
            dispatch(setLoading(true));
            const data = await updatePassword({ password, token });
        } catch (error) {
            dispatch(
                setError(error.response?.data?.message || 'Logout failed'),
            );
        } finally {
            dispatch(setLoading(false));
        }
    }

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
