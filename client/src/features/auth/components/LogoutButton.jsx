import React from 'react'
import { useAuth } from '../hooks/useAuth'

const LogoutButton = () => {
    const { handleLogout } = useAuth()

    return (
        <button
            onClick={() => handleLogout()}
            className='btn btn-primary'
        >
            Logout
        </button>
    )
}

export default LogoutButton