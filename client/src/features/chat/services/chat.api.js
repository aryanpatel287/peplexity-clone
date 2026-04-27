import axios from 'axios';

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api/chats`,
    withCredentials: true,
});

export async function sendMessage({ message, chatId, uploadedFiles }) {
    const response = await api.post('/message', {
        message,
        chat: chatId,
        uploadedFiles,
    });

    return response.data;
}

export async function getChats() {
    const response = await api.get('/');

    return response.data;
}

export async function getMessages({ chatId }) {
    const response = await api.get(`/${chatId}/messages`);

    return response.data;
}

export async function deleteChat({ chatId }) {
    const response = await api.delete(`/delete/${chatId}`);

    return response.data;
}

export async function uploadFiles({ files }) {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    const response = await api.post('/uploads', formData);
    return response.data;
}
