import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import FormGroup from '../components/FormGroup';
import RegistrationSuccess from '../components/RegistrationSuccess';
import { useAuth } from '../hooks/useAuth';
import { useSelector, useDispatch } from 'react-redux';
import { setError } from '../auth.slice';
import '../styles/_auth.scss';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });
    const [isSuccess, setIsSuccess] = useState(false);

    const errorMsg = useSelector((state) => state.auth.error);
    const loading = useSelector((state) => state.auth.loading);
    const { handleRegister } = useAuth();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Clear error when navigating away
    useEffect(() => {
        return () => {
            dispatch(setError(null));
        };
    }, [dispatch]);

    const handleChange = (e) => {
        if (errorMsg) dispatch(setError(null));
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await handleRegister(formData);
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
                            <h1>Create Account</h1>
                            <p>Join us today</p>
                        </div>

                        <form onSubmit={handleSubmit} noValidate>
                            <div className="auth-error-container">
                                {errorMsg && <p className="auth-error-message">{errorMsg}</p>}
                            </div>

                            <FormGroup
                                label="Username"
                                id="username"
                                type="text"
                                placeholder="Enter your username"
                                value={formData.username}
                                onChange={handleChange}
                                hasError={!!errorMsg && errorMsg.toLowerCase().includes('username')}
                            />
                            <FormGroup
                                label="Email Address"
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                hasError={!!errorMsg && errorMsg.toLowerCase().includes('email')}
                            />
                            <FormGroup
                                label="Password"
                                id="password"
                                type="password"
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={handleChange}
                                hasError={!!errorMsg && errorMsg.toLowerCase().includes('password')}
                            />

                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Creating Account...' : 'Sign Up'}
                            </button>
                        </form>

                        <div className="auth-footer">
                            Already have an account? <Link to="/login">Log in</Link>
                        </div>
                    </>
                ) : (
                    <RegistrationSuccess email={formData.email} />
                )}
            </div>
        </div>
    );
};

export default Register;