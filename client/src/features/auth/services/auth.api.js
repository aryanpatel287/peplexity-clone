import axios from 'axios';
import { API_BASE_URL } from '../../../app/runtime.config';

const api = axios.create({
    baseURL: `${API_BASE_URL}/auth`,
    withCredentials: true,
});

export async function sendSignUpEmail({ email }) {
    const response = await api.post('/send-signup-email', { email });
    return response.data;
}

export async function verifySignUpOtp({ email, otp }) {
    const response = await api.post('/verify-signup-email', { email, otp });
    return response.data;
}

export function googleAuth() {
    window.location.assign('/api/auth/google');
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
