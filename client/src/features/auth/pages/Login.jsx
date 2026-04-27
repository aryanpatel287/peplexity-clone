import React, { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import FormGroup from '../components/FormGroup';
import '../../shared/styles/button.scss';
import '../styles/_auth.scss';
import { useAuth } from '../hooks/useAuth';
import { useSelector, useDispatch } from 'react-redux';
import { setError } from '../auth.slice';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const user = useSelector((state) => state.auth.user);
    const loading = useSelector((state) => state.auth.loading);
    const errorMsg = useSelector((state) => state.auth.error);

    const { handleLogin } = useAuth();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Clear error when navigating away
    useEffect(() => {
        return () => {
            dispatch(setError(null));
        };
    }, [dispatch]);

    const handleChange = (e) => {
        // Clear error as soon as user starts typing
        if (errorMsg) dispatch(setError(null));
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const loggedInUser = await handleLogin(formData);

        if (loggedInUser) {
            navigate('/');
        }
    };

    if (!loading && user) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Welcome Back</h1>
                    <p>Log in to your account</p>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="auth-error-container">
                        {errorMsg && <p className="auth-error-message">{errorMsg}</p>}
                    </div>
                    <FormGroup
                        label="Email Address"
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        hasError={!!errorMsg && (errorMsg.toLowerCase().includes('email') || errorMsg.toLowerCase().includes('credentials'))}
                    />
                    <FormGroup
                        label="Password"
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        hasError={!!errorMsg && errorMsg.toLowerCase().includes('credentials')}
                    />

                    <div className="forgot-password-link">
                        <Link to="/forgot-password">Forgot your password?</Link>
                    </div>


                    <button type="submit" className="btn btn-primary">
                        Log In
                    </button>
                </form>

                <div className="auth-footer">
                    Don't have an account? <Link to="/register">Sign up</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
