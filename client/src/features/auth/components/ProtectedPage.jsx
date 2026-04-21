import React from 'react'
import { Navigate } from 'react-router'
import { useSelector } from 'react-redux'

const ProtectedPage = ({ children }) => {

    const user = useSelector(state => state.auth.user)
    const loading = useSelector(state => state.auth.loading)

    if (loading) {
        return <h1>Loading</h1>
    }

    if (!user) {
        return <Navigate to={'/login'} replace />
    }

    return (
        children
    )
}

export default ProtectedPage
