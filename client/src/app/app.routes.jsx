import { createBrowserRouter, Navigate } from 'react-router';
import Login from '../features/auth/pages/Login';
import Register from '../features/auth/pages/Register';
import LogoutButton from '../features/auth/components/LogoutButton';
import Dashboard from '../features/chat/pages/Dashboard';
import ProtectedPage from '../features/auth/components/ProtectedPage';
import ForgotPassword from '../features/auth/pages/ForgotPassword';
import UpdatePassword from '../features/auth/pages/UpdatePassword';
import ForbiddenPage from '../features/shared/pages/ForbiddenPage';
import NotFoundPage from '../features/shared/pages/NotFoundPage';
import ChatArea from '../features/chat/components/chat-area/ChatArea';

export const router = createBrowserRouter([
    {
        path: '/',
        element: (
            <ProtectedPage>
                <Dashboard />
            </ProtectedPage>
        ),
        children: [
            {
                index: true,
                element: <ChatArea />,
            },
            {
                path: 'c/:chatId',
                element: <ChatArea />,
            },
        ],
    },
    {
        path: '/dashboard',
        element: <Navigate to={'/'} replace />,
    },
    {
        path: '/login',
        element: <Login />,
    },
    {
        path: '/register',
        element: <Register />,
    },
    {
        path: '/forgot-password',
        element: <ForgotPassword />,
    },
    {
        path: '/update-password',
        element: <UpdatePassword />,
    },
    {
        path: '/forbidden',
        element: <ForbiddenPage />,
    },
    {
        path: '*',
        element: <NotFoundPage />,
    },
]);
