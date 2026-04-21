import React from 'react'
import { useSelector } from 'react-redux'
import LogoutButton from '../../auth/components/LogoutButton'

const Dashboard = () => {

    const user = useSelector(state => state.auth)
    console.log(user)

    return (
        <div>
            DashBoard
            <LogoutButton />
        </div>
    )
}

export default Dashboard
