import React, { useState } from 'react'
import { useSearchParams } from 'react-router'
import FormGroup from '../components/FormGroup'
import '../../shared/styles/button.scss'
import '../styles/_auth.scss'
import { useAuth } from '../hooks/useAuth'

const UpdatePassword = () => {
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')

    const { handleUpdatePassword } = useAuth()

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    })

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match!")
            return
        }

        await handleUpdatePassword({ password: formData.password, token })
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Update Password</h1>
                    <p>Enter your new password</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <FormGroup
                        label="New Password"
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Enter new password"
                        value={formData.password}
                        onChange={handleChange}
                    />
                    <FormGroup
                        label="Confirm Password"
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm new password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                    />

                    <button type="submit" className="btn btn-primary">
                        Update Password
                    </button>
                </form>
            </div>
        </div>
    )
}

export default UpdatePassword
