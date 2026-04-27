import React from 'react';
import { Link } from 'react-router';
import { CheckCircle } from 'lucide-react';
import '../styles/_registration-success.scss';

const UpdatePasswordSuccess = () => {
    return (
        <div className="registration-success">
            <div className="success-icon-wrapper">
                <CheckCircle size={48} className="success-icon" />
            </div>
            <h2>Password Updated</h2>
            <p className="success-message">
                Your password has been successfully reset. You can now log in with your new credentials.
            </p>
            <Link to="/login" className="btn btn-primary login-btn">
                Go to Login
            </Link>
        </div>
    );
};

export default UpdatePasswordSuccess;
