import React from 'react'
import { Link } from 'react-router'
import '../styles/_error-page.scss'
import '../styles/button.scss'

const NotFoundPage = () => {
    return (
        <div className="error-page-container">
            <h1>404</h1>
            <h2>Page Not Found</h2>
            <p>Oops! The page you are looking for doesn't exist or has been moved.</p>
            <Link to="/">
                <button className="btn btn-primary">Go to Home</button>
            </Link>
        </div>
    )
}

export default NotFoundPage
