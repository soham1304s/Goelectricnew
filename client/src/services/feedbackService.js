import api from './api.js';

export async function submitFeedback(data) {
  const { data: res } = await api.post('/feedback', data);
  return res;
}

export async function getAllFeedback(params = {}) {
  try {
    const { data } = await api.get('/feedback', { params });
    return data;
  } catch (error) {
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Cannot reach server. Ensure backend is running on port 5000.');
    }
    throw error;
  }
}
