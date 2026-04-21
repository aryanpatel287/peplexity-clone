import { createBrowserRouter } from 'react-router'
import Login from '../features/auth/pages/Login'
import Register from '../features/auth/pages/Register'
import LogoutButton from '../features/auth/components/LogoutButton'
import Dashboard from '../features/chat/pages/Dashboard'
import ProtectedPage from '../features/auth/components/ProtectedPage'
import ForgotPassword from '../features/auth/pages/ForgotPassword'
import UpdatePassword from '../features/auth/pages/UpdatePassword'
import ForbiddenPage from '../features/shared/pages/ForbiddenPage'
import NotFoundPage from '../features/shared/pages/NotFoundPage'

export const router = createBrowserRouter([
    {
        path: '/',
        element:
            <ProtectedPage>
                <Dashboard />
            </ProtectedPage>
    },
    {
        path: '/login',
        element: <Login />
    },
    {
        path: '/register',
        element: <Register />
    },
    {
        path: '/forgot-password',
        element: <ForgotPassword />
    },
    {
        path: '/update-password',
        element: <UpdatePassword />
    },
    {
        path: '/forbidden',
        element: <ForbiddenPage />
    },
    {
        path: '*',
        element: <NotFoundPage />
    }
])