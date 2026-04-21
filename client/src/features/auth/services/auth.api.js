import axios from 'axios';

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api/auth`,
    withCredentials: true,
});

export async function register({ username, email, password }) {
    const response = await api.post('/register', { username, email, password });
    return response.data;
}

export async function login({ email, password }) {
    const response = await api.post('/login', { email, password });
    return response.data;
}

export async function getMe() {
    const response = await api.get('/get-me');
    return response.data;
}

export async function logout() {
    const response = await api.post('/logout');
    return response.data;
}

export async function resendVerificationEmail({ email }) {
    const response = await api.post('/resend-verfiy-email');
    return response.data;
}

export async function forgotPasswordEmail({ email }) {
    const response = await api.post('/forgot-password', {
        email,
    });
    return response.data;
}

export async function updatePassword({ password, token }) {
    const response = await api.patch('/update-password?token=' + token, {
        password,
    });
    return response.data;
}
