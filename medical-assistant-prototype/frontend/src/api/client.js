import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
});

export async function sendMessage(payload) {
  const {data} = await api.post('/chat/message', payload);
  return data;
}

export async function getConversation(id) {
  const {data} = await api.get(`/chat/conversation/${id}`);
  return data;
}
