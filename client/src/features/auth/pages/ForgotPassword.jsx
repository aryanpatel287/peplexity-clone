import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import FormGroup from '../components/FormGroup';
import ForgotPasswordSuccess from '../components/ForgotPasswordSuccess';
import { useAuth } from '../hooks/useAuth';
import { useSelector, useDispatch } from 'react-redux';
import { setError } from '../auth.slice';
import '../../shared/styles/button.scss';
import '../styles/_auth.scss';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const { handleForgotPassword } = useAuth();
    const errorMsg = useSelector((state) => state.auth.error);
    const loading = useSelector((state) => state.auth.loading);
    const dispatch = useDispatch();

    // Clear error when navigating away
    useEffect(() => {
        return () => {
            dispatch(setError(null));
        };
    }, [dispatch]);

    const handleChange = (e) => {
        if (errorMsg) dispatch(setError(null));
        setEmail(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await handleForgotPassword({ email });
        if (success) {
            setIsSuccess(true);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                {!isSuccess ? (
                    <>
                        <div className="auth-header">
                            <h1>Reset Password</h1>
                            <p>Enter your email to receive a reset link</p>
                        </div>

                        <form onSubmit={handleSubmit} noValidate>
                            <div className="auth-error-container">
                                {errorMsg && <p className="auth-error-message">{errorMsg}</p>}
                            </div>

                            <FormGroup
                                label="Email Address"
                                id="email"
                                type="email"
                                placeholder="Enter your registered email"
                                value={email}
                                onChange={handleChange}
                                hasError={!!errorMsg}
                            />

                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </form>

                        <div className="auth-footer">
                            Remembered your password? <Link to="/login">Log in</Link>
                        </div>
                    </>
                ) : (
                    <ForgotPasswordSuccess email={email} />
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
