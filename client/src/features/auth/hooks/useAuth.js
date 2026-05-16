import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { capitalize } from '../../shared/utils/format';

import {
    register,
    login,
    logout,
    getMe,
    createGuestSession,
    claimGuestChats,
    resendVerificationEmail,
    forgotPasswordEmail,
    updatePassword,
} from '../services/auth.api';

import {
    setUser,
    setError,
    setLoading,
    setIsUpdatingPassword,
    setIsGuest,
    setSessionReady,
} from '../auth.slice';

export function useAuth() {
    const dispatch = useDispatch();

    const handleRegister = useCallback(async ({ username, email, password }) => {
        try {
            dispatch(setLoading(true));
            dispatch(setError(null));
            await register({ username, email, password });
            return true;
        } catch (error) {
            console.log(error);
            const msg = capitalize(error.response?.data?.message || 'Registration failed');
            dispatch(setError(msg));
            return false;
        } finally {
            dispatch(setLoading(false));
        }
    }, [dispatch]);

    const handleLogin = useCallback(async ({ email, password }) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            dispatch(setError(capitalize('please enter a valid email address')));
            return null;
        }

        try {
            dispatch(setLoading(true));
            dispatch(setError(null));
            const data = await login({ email, password });
            dispatch(setUser(data.user));
            dispatch(setIsGuest(false));
            dispatch(setSessionReady(true));
            return data.user;
        } catch (error) {
            dispatch(setError(capitalize(error.response?.data?.message || 'Login failed')));
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
            const msg = capitalize(error.response?.data?.message || 'Failed to resend verification email');
            dispatch(setError(msg));
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
            dispatch(setIsGuest(false));
        } catch (error) {
            const msg = capitalize(error.response?.data?.message || 'Failed to fetch user');
            dispatch(setError(msg));
            toast.error(msg);
        } finally {
            dispatch(setLoading(false));
        }
    }, [dispatch]);

    const handleEnsureSession = useCallback(async () => {
        try {
            dispatch(setLoading(true));
            dispatch(setError(null));
            const data = await getMe();
            dispatch(setUser(data.user));
            dispatch(setIsGuest(false));
        } catch (error) {
            const status = error.response?.status;
            if (status === 400 || status === 401) {
                try {
                    await createGuestSession();
                    dispatch(setUser(null));
                    dispatch(setIsGuest(true));
                } catch (guestError) {
                    const msg = capitalize(
                        guestError.response?.data?.message ||
                            'Failed to create guest session',
                    );
                    dispatch(setError(msg));
                }
            } else {
                const msg = capitalize(
                    error.response?.data?.message || 'Failed to fetch user',
                );
                dispatch(setError(msg));
            }
        } finally {
            dispatch(setLoading(false));
            dispatch(setSessionReady(true));
        }
    }, [dispatch]);

    const handleLogout = useCallback(async () => {
        try {
            dispatch(setLoading(true));
            dispatch(setError(null));
            await logout();
            dispatch(setUser(null));
            dispatch(setIsGuest(false));
            dispatch(setSessionReady(false));
        } catch (error) {
            const msg = capitalize(error.response?.data?.message || 'Logout failed');
            dispatch(setError(msg));
            toast.error(msg);
        } finally {
            dispatch(setLoading(false));
        }
    }, [dispatch]);

    const handleClaimGuestChats = useCallback(async () => {
        try {
            const data = await claimGuestChats();
            return data;
        } catch (error) {
            return null;
        }
    }, []);

    const handleForgotPassword = useCallback(async ({ email }) => {
        try {
            dispatch(setLoading(true));
            dispatch(setError(null));
            await forgotPasswordEmail({ email });
            toast.success('Reset email sent! Please check your inbox.');
            return true;
        } catch (error) {
            const msg = capitalize(error.response?.data?.message || 'Failed to send reset email');
            dispatch(setError(msg));
            toast.error(msg);
            return false;
        } finally {
            dispatch(setLoading(false));
        }
    }, [dispatch]);

    const handleUpdatePassword = useCallback(async ({ password, token }) => {
        try {
            dispatch(setIsUpdatingPassword(true));
            dispatch(setError(null));
            await updatePassword({ password, token });
            toast.success('Password updated successfully!');
            return true;
        } catch (error) {
            const msg = capitalize(error.response?.data?.message || 'Failed to update password');
            dispatch(setError(msg));
            toast.error(msg);
            return false;
        } finally {
            dispatch(setIsUpdatingPassword(false));
        }
    }, [dispatch]);

    return {
        handleRegister,
        handleLogin,
        handleGetMe,
        handleEnsureSession,
        handleResendVerificationEmail,
        handleLogout,
        handleClaimGuestChats,
        handleForgotPassword,
        handleUpdatePassword,
    };
}
