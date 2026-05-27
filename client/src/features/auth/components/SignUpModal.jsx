import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { X } from 'lucide-react';
import FormGroup from './FormGroup';
import { setError } from '../auth.slice';
import { useAuth } from '../hooks/useAuth';
import '../styles/_signup-modal.scss';

const GoogleIcon = () => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
            fill="#4285F4"
        />
        <path
            d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
            fill="#34A853"
        />
        <path
            d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
            fill="#FBBC05"
        />
        <path
            d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z"
            fill="#EA4335"
        />
    </svg>
);

const SignUpModal = () => {
    const [formData, setFormData] = useState({ email: '' });
    const [isClosing, setIsClosing] = useState(false);

    const showSignUpModal = useSelector((state) => state.auth.showSignUpModal);
    const loading = useSelector((state) => state.auth.loading);
    const errorMsg = useSelector((state) => state.auth.error);
    const currentChatId = useSelector((state) => state.chat.currentChatId);

    const { handleCloseSignUpModal, handleSendSignUpEmail } = useAuth();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    if (!showSignUpModal) return null;

    const triggerClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            handleCloseSignUpModal();
        }, 180);
    };

    const handleChange = (e) => {
        if (errorMsg) dispatch(setError(null));
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { email } = formData;

        if (!email.trim()) {
            dispatch(setError('Email is required'));
            return;
        }

        const ok = await handleSendSignUpEmail({
            email: email.trim(),
        });
        if (ok) {
            handleCloseSignUpModal();
            const nextParam = currentChatId
                ? `&nextChatId=${encodeURIComponent(currentChatId)}`
                : '';
            navigate(
                `/verify-otp?email=${encodeURIComponent(email.trim())}${nextParam}`,
            );
        }
    };

    return (
        <div
            className={`signup-modal-overlay${isClosing ? ' is-closing' : ''}`}
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) triggerClose();
            }}
        >
            <div className="signup-modal-card">
                <button
                    className="signup-modal-close"
                    onClick={triggerClose}
                    aria-label="Close sign-up modal"
                >
                    <X size={18} />
                </button>

                <div className="signup-modal-header">
                    <h2>
                        Sign up below to unlock the full potential of Perplexity
                    </h2>
                    <p>
                        By continuing, you agree to our{' '}
                        <a href="#">privacy policy</a>.
                    </p>
                </div>

                <button
                    className="signup-google-btn"
                    disabled
                    aria-disabled="true"
                >
                    <GoogleIcon />
                    Continue with Google
                </button>

                <div className="signup-divider">or</div>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="signup-modal-fields">
                        <FormGroup
                            label="Email"
                            id="email"
                            name="email"
                            type="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            hasError={
                                !!errorMsg &&
                                errorMsg.toLowerCase().includes('email')
                            }
                        />
                    </div>

                    <div className="signup-modal-error">{errorMsg || ''}</div>

                    <button
                        type="submit"
                        className="signup-modal-submit"
                        disabled={loading}
                        id="signup-submit-btn"
                    >
                        {loading ? 'Sending…' : 'Continue with email'}
                    </button>
                </form>

                <div className="signup-modal-footer">
                    <button type="button" onClick={triggerClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SignUpModal;
