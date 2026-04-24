import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { LogOut } from 'lucide-react'

const LogoutButton = () => {
    const { handleLogout } = useAuth()

    return (
        <button
            onClick={() => handleLogout()}
            className='btn btn-primary-transparent'
        >
            <LogOut size={20} /> Logout
        </button>
    )
}

export default LogoutButton