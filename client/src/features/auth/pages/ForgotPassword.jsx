import React, { useState } from 'react'
import { Link } from 'react-router'
import FormGroup from '../components/FormGroup'
import '../../shared/styles/button.scss'
import '../styles/_auth.scss'
import { useAuth } from '../hooks/useAuth'

const ForgotPassword = () => {
    const [email, setEmail] = useState('')

    const { handleForgotPassword } = useAuth()

    const handleChange = (e) => {
        setEmail(e.target.value)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        await handleForgotPassword({ email })

    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Forgot Password</h1>
                    <p>Enter your email to receive a reset link</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <FormGroup
                        label="Email Address"
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={handleChange}
                    />

                    <button type="submit" className="btn btn-primary">
                        Send Reset Link
                    </button>
                </form>

                <div className="auth-footer">
                    Already a user? <Link to="/login">Login</Link>
                </div>
            </div>
        </div>
    )
}

export default ForgotPassword
