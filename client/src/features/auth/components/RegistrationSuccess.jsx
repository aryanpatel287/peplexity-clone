import React from 'react';
import { Link } from 'react-router';
import { CheckCircle2 } from 'lucide-react';
import '../styles/_registration-success.scss';

const RegistrationSuccess = ({ email }) => {
    return (
        <div className="registration-success">
            <div className="success-icon-wrapper">
                <CheckCircle2 size={48} className="success-icon" />
            </div>
            <h2>Registration Successful!</h2>
            <p className="success-message">
                A verification link has been sent to <strong>{email}</strong>.
            </p>
            <div className="instructions">
                <p>Please check your inbox and verify your email to activate your account.</p>
                <p>Once verified, you can log in below.</p>
            </div>
            <Link to="/login" className="btn btn-primary login-btn">
                Go to Login
            </Link>
        </div>
    );
};

export default RegistrationSuccess;
