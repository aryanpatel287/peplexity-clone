import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { X } from 'lucide-react';
import FormGroup from './FormGroup';
import { setError } from '../auth.slice';
import { useAuth } from '../hooks/useAuth';
import '../styles/_signup-modal.scss';
import ContinueWithGoogle from './ContinueWithGoogle';

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
        if (loading) return;
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            handleCloseSignUpModal();
            setFormData({ email: '' });
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
            setFormData({ email: '' });

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
        >
            <button
                className="signup-modal-close"
                onClick={triggerClose}
                aria-label="Close sign-up modal"
            >
                <X size={18} />
            </button>

            <div
                className="signup-modal-card"
                role="dialog"
                aria-modal="true"
                aria-labelledby="signup-modal-title"
            >
                <div className="signup-modal-header">
                    <h2 id="signup-modal-title">
                        Sign up below to unlock the full potential of Perplexity
                    </h2>
                    <p>
                        By continuing, you agree to our{' '}
                        <a href="#">privacy policy</a>.
                    </p>
                </div>

                <div className="signup-modal-actions">
                    <ContinueWithGoogle />

                    <div className="signup-divider" aria-hidden="true" />

                    <form
                        className="signup-modal-form"
                        onSubmit={handleSubmit}
                        noValidate
                    >
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

                        <div className="signup-modal-error" role="alert">
                            {errorMsg || ''}
                        </div>

                        <button
                            type="submit"
                            className="signup-modal-submit"
                            disabled={loading}
                            id="signup-submit-btn"
                        >
                            {loading ? 'Sending...' : 'Continue with email'}
                        </button>
                    </form>

                    <div className="signup-modal-footer">
                        <button type="button" onClick={triggerClose}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUpModal;
