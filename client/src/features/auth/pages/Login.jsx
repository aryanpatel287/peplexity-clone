import React, { useState } from 'react'
import { Link, Navigate, replace, useNavigate } from 'react-router'
import FormGroup from '../components/FormGroup'
import '../../shared/styles/button.scss'
import '../styles/_auth.scss'
import { useAuth } from '../hooks/useAuth'
import { useSelector } from 'react-redux'

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })

    const user = useSelector(state => state.auth.user)
    const loading = useSelector(state => state.auth.loading)

    const { handleLogin } = useAuth()

    const navigate = useNavigate()

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        await handleLogin(formData)
        navigate('/')
    }

    if (!loading && user) {
        return <Navigate to='/' replace />
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Welcome Back</h1>
                    <p>Log in to your account</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <FormGroup
                        label="Email Address"
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    <FormGroup
                        label="Password"
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                    />

                    <button type="submit" className="btn btn-primary">
                        Log In
                    </button>
                </form>

                <div className="auth-footer">
                    Don't have an account? <Link to="/register">Sign up</Link>
                </div>
            </div>
        </div>
    )
}

export default Login