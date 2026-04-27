import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router';
import FormGroup from '../components/FormGroup';
import UpdatePasswordSuccess from '../components/UpdatePasswordSuccess';
import { useAuth } from '../hooks/useAuth';
import { useSelector, useDispatch } from 'react-redux';
import { setError } from '../auth.slice';
import '../../shared/styles/button.scss';
import '../styles/_auth.scss';

const UpdatePassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [isSuccess, setIsSuccess] = useState(false);

    const { handleUpdatePassword } = useAuth();
    const errorMsg = useSelector((state) => state.auth.error);
    const isUpdatingPassword = useSelector((state) => state.auth.isUpdatingPassword);
    const dispatch = useDispatch();

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: '',
    });

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

        if (formData.password !== formData.confirmPassword) {
            dispatch(setError("Passwords do not match!"));
            return;
        }

        const success = await handleUpdatePassword({ password: formData.password, token });
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
                            <h1>Set New Password</h1>
                            <p>Enter your new password below</p>
                        </div>

                        <form onSubmit={handleSubmit} noValidate>
                            <div className="auth-error-container">
                                {errorMsg && <p className="auth-error-message">{errorMsg}</p>}
                            </div>

                            <FormGroup
                                label="New Password"
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Enter new password"
                                value={formData.password}
                                onChange={handleChange}
                                hasError={!!errorMsg}
                            />
                            <FormGroup
                                label="Confirm Password"
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                placeholder="Confirm new password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                hasError={!!errorMsg}
                            />

                            <button type="submit" className="btn btn-primary" disabled={isUpdatingPassword}>
                                {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                            </button>
                        </form>
                    </>
                ) : (
                    <UpdatePasswordSuccess />
                )}
            </div>
        </div>
    );
};

export default UpdatePassword;
