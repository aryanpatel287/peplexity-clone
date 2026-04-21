import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import FormGroup from '../components/FormGroup'
import { useAuth } from '../hooks/useAuth'
import '../styles/_auth.scss'

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    })

    const { handleRegister } = useAuth()

    const navigate = useNavigate()

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()


        await handleRegister(formData)
        navigate('/')
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Create Account</h1>
                    <p>Join us today</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <FormGroup
                        label="Username"
                        id="username"
                        type="text"
                        placeholder="Enter your username"
                        value={formData.username}
                        onChange={handleChange}
                    />
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
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={handleChange}
                    />

                    <button type="submit" className="btn btn-primary">
                        Sign Up
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account? <Link to="/login">Log in</Link>
                </div>
            </div>
        </div>
    )
}

export default Register