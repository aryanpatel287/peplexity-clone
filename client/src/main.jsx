import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App.jsx';
import { Provider } from 'react-redux';
import { store } from './app/app.store.js';
import Rollbar from 'rollbar/replay';

// Initialize Rollbar client-side error logging & Session Replay
if (import.meta.env.VITE_ROLLBAR_CLIENT_TOKEN) {
    new Rollbar({
        accessToken: import.meta.env.VITE_ROLLBAR_CLIENT_TOKEN,
        captureUncaught: true,
        captureUnhandledRejections: true,
        payload: {
            client: {
                javascript: {
                    source_map_enabled: true,
                    code_version: '1.0.0',
                },
            },
        },
        enabled: true,
        replay: {
            enabled: true,
        },
    });
}

createRoot(document.getElementById('root')).render(
    <Provider store={store}>
        <App />
    </Provider>,
);
