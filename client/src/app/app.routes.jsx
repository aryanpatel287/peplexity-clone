import { createBrowserRouter, Navigate } from 'react-router';
import RootLayout from './RootLayout';
import VerifyOtpPage from '../features/auth/pages/VerifyOtpPage';
import Dashboard from '../features/chat/pages/Dashboard';
import ProtectedPage from '../features/auth/components/ProtectedPage';
import ForbiddenPage from '../features/shared/pages/ForbiddenPage';
import NotFoundPage from '../features/shared/pages/NotFoundPage';
import ChatArea from '../features/chat/components/chat-area/ChatArea';

export const router = createBrowserRouter([
    {
        element: <RootLayout />,
        children: [
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
                path: '/verify-otp',
                element: <VerifyOtpPage />,
            },
            {
                path: '/forbidden',
                element: <ForbiddenPage />,
            },
            {
                path: '*',
                element: <NotFoundPage />,
            },
        ],
    },
]);
