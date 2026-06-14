import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { Send } from 'lucide-react';
import OtpInput from '../components/OtpInput';
import { useAuth } from '../hooks/useAuth';
import { setError } from '../auth.slice';
import '../styles/_verify-otp-page.scss';

const VerifyOtpPage = () => {
    const [otp, setOtp] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const email = searchParams.get('email') || '';
    const nextChatId = searchParams.get('nextChatId') || '';

    const user = useSelector((state) => state.auth.user);
    const errorMsg = useSelector((state) => state.auth.error);

    const { handleVerifySignUpOtp, handleCheckSessionSilent } = useAuth();

    // Check session on mount and poll silently in the background.
    // Reduce frequency and avoid polling when tab is hidden to prevent spamming `getMe`.
    useEffect(() => {
        const checkSession = async () => {
            if (typeof document !== 'undefined' && document.hidden) return;
            try {
                await handleCheckSessionSilent();
            } catch (e) {
                // ignore errors from silent check
            }
        };

        checkSession();

        const intervalMs = 15000; // poll every 15s instead of 3s
        const id = setInterval(() => {
            if (typeof document !== 'undefined' && !document.hidden) {
                checkSession();
            }
        }, intervalMs);

        const onVisibilityChange = () => {
            if (typeof document !== 'undefined' && !document.hidden)
                checkSession();
        };
        document.addEventListener('visibilitychange', onVisibilityChange);

        return () => {
            clearInterval(id);
            document.removeEventListener(
                'visibilitychange',
                onVisibilityChange,
            );
        };
    }, [handleCheckSessionSilent]);

    // Guard: redirect if params missing
    useEffect(() => {
        if (!email) {
            navigate('/', { replace: true });
        }
    }, [email, navigate]);

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            if (nextChatId) {
                navigate(`/c/${nextChatId}`, { replace: true });
            } else {
                navigate('/', { replace: true });
            }
        }
    }, [user, nextChatId, navigate]);

    // Clear error on unmount
    useEffect(() => {
        return () => {
            dispatch(setError(null));
        };
    }, [dispatch]);

    const maskEmail = (addr) => {
        const [local, domain] = addr.split('@');
        if (!domain) return addr;
        const visible = local.slice(0, 3);
        return `${visible}${'*'.repeat(Math.max(local.length - 3, 2))}@${domain}`;
    };

    const submitOtp = async (val) => {
        if (val.length < 6) return;
        dispatch(setError(null));
        setIsVerifying(true);
        const result = await handleVerifySignUpOtp({
            email,
            otp: val,
        });
        setIsVerifying(false);
        if (result) {
            await handleCheckSessionSilent();

            if (nextChatId) {
                navigate(`/c/${nextChatId}`, { replace: true });
            } else {
                navigate('/', { replace: true });
            }
        }
    };

    const handleOtpChange = (val) => {
        setOtp(val);
        if (errorMsg) dispatch(setError(null));
    };

    const handleConfirm = () => submitOtp(otp);

    const isComplete = otp.length === 6;

    return (
        <div className="verify-otp-page">
            <div className="verify-otp-card">
                <div className="verify-otp-icon">
                    <Send size={28} strokeWidth={1.5} />
                </div>

                <div className="verify-otp-heading">
                    <h1>Check your email</h1>
                    <p>
                        A temporary sign-in link has been sent to{' '}
                        <strong>{maskEmail(email)}</strong>
                    </p>
                </div>

                <p className="verify-spam-note">
                    Don't see it? Check your spam or junk folder.
                </p>

                <OtpInput
                    value={otp}
                    onChange={handleOtpChange}
                    disabled={isVerifying}
                    hasError={!!errorMsg}
                />

                <div className="verify-otp-error">{errorMsg || ''}</div>

                <button
                    className="verify-otp-confirm-btn"
                    onClick={handleConfirm}
                    disabled={!isComplete || isVerifying}
                    id="verify-otp-confirm-btn"
                >
                    {isVerifying ? 'Verifying…' : 'Confirm'}
                </button>
            </div>
        </div>
    );
};

export default VerifyOtpPage;
