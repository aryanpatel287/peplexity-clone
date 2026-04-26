import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { LogOut } from 'lucide-react'
import ConfirmModal from '../../shared/components/ConfirmModal'

const LogoutButton = () => {
    const { handleLogout } = useAuth()
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)

    return (
        <>
            <button
                onClick={() => setIsLogoutModalOpen(true)}
                className='btn btn-primary-transparent'
            >
                <LogOut size={20} /> Logout
            </button>

            <ConfirmModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={handleLogout}
                title="Logout"
                message="Are you sure you want to log out?"
                confirmText="Logout"
                cancelText="Cancel"
                variant="primary"
            />
        </>
    )
}

export default LogoutButton