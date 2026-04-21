import React from 'react'
import { Link } from 'react-router'
import '../styles/_error-page.scss'
import '../styles/button.scss'

const ForbiddenPage = () => {
    return (
        <div className="error-page-container">
            <h1>403</h1>
            <h2>Access Denied</h2>
            <p>Sorry, you don't have permission to access this page.</p>
            <Link to="/">
                <button className="btn btn-primary">Go to Home</button>
            </Link>
        </div>
    )
}

export default ForbiddenPage
