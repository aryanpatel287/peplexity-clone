import React from 'react';
import { Link } from 'react-router';
import { Mail } from 'lucide-react';
import '../styles/_registration-success.scss'; // Reuse the same styles

const ForgotPasswordSuccess = ({ email }) => {
    return (
        <div className="registration-success">
            <div className="success-icon-wrapper">
                <Mail size={48} className="success-icon" />
            </div>
            <h2>Check Your Email</h2>
            <p className="success-message">
                We've sent a password reset link to <strong>{email}</strong>.
            </p>
            <div className="instructions">
                <p>Please click the link in the email to reset your password.</p>
                <p>If you don't see it, check your spam folder.</p>
            </div>
            <Link to="/login" className="btn btn-primary login-btn">
                Back to Login
            </Link>
        </div>
    );
};

export default ForgotPasswordSuccess;
