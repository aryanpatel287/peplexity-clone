import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { capitalize } from '../../shared/utils/format';

import {
    sendSignUpEmail,
    verifySignUpOtp,
    logout,
    getMe,
    createGuestSession,
    claimGuestChats,
    googleAuth,
} from '../services/auth.api';

import {
    setUser,
    setError,
    setLoading,
    setIsGuest,
    setSessionReady,
    openSignUpModal,
    closeSignUpModal,
} from '../auth.slice';

export function useAuth() {
    const dispatch = useDispatch();

    const handleOpenSignUpModal = useCallback(() => {
        dispatch(openSignUpModal());
    }, [dispatch]);

    const handleCloseSignUpModal = useCallback(() => {
        dispatch(closeSignUpModal());
    }, [dispatch]);

    const handleSendSignUpEmail = useCallback(
        async ({ email }) => {
            try {
                dispatch(setLoading(true));
                dispatch(setError(null));
                await sendSignUpEmail({ email });
                return true;
            } catch (error) {
                const msg = capitalize(
                    error.response?.data?.message ||
                        'Failed to send sign-up email',
                );
                dispatch(setError(msg));
                return false;
            } finally {
                dispatch(setLoading(false));
            }
        },
        [dispatch],
    );

    const handleVerifySignUpOtp = useCallback(
        async ({ email, otp }) => {
            try {
                dispatch(setLoading(true));
                dispatch(setError(null));
                const data = await verifySignUpOtp({ email, otp });
                dispatch(setUser(data.user));
                dispatch(setIsGuest(false));
                dispatch(setSessionReady(true));
                dispatch(closeSignUpModal());
                return data.user;
            } catch (error) {
                const msg = capitalize(
                    error.response?.data?.message || 'Invalid or expired code',
                );
                dispatch(setError(msg));
                return null;
            } finally {
                dispatch(setLoading(false));
            }
        },
        [dispatch],
    );

    const handleGoogleAuth = useCallback(() => {
        googleAuth();
    }, []);

    const handleGetMe = useCallback(async () => {
        try {
            dispatch(setLoading(true));
            dispatch(setError(null));
            const data = await getMe();
            dispatch(setUser(data.user));
            dispatch(setIsGuest(false));
        } catch (error) {
            const msg = capitalize(
                error.response?.data?.message || 'Failed to fetch user',
            );
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
            const msg = capitalize(
                error.response?.data?.message || 'Logout failed',
            );
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

    const handleCheckSessionSilent = useCallback(async () => {
        try {
            const data = await getMe();
            dispatch(setUser(data.user));
            dispatch(setIsGuest(false));
            return data.user;
        } catch (error) {
            return null;
        }
    }, [dispatch]);

    return {
        handleOpenSignUpModal,
        handleCloseSignUpModal,
        handleSendSignUpEmail,
        handleVerifySignUpOtp,
        handleGetMe,
        handleEnsureSession,
        handleLogout,
        handleClaimGuestChats,
        handleCheckSessionSilent,
        handleGoogleAuth,
    };
}
