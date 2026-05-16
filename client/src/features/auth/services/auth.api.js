import axios from 'axios';
import { API_BASE_URL } from '../../../app/runtime.config';

const api = axios.create({
    baseURL: `${API_BASE_URL}/auth`,
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

export async function createGuestSession() {
    const response = await api.post('/guest-session');
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

export async function claimGuestChats() {
    const response = await api.post('/claim-guest-chats');
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
