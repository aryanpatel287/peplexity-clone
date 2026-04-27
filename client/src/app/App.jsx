import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './app.routes.jsx';
import './index.scss';
import { useAuth } from '../features/auth/hooks/useAuth.js';

const App = () => {
    return <RouterProvider router={router} />;
};

export default App;
