import api from './api';

export const getUserFiles = async (token) => {
  const res = await api.get('/files', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data.files;
};

const fileService = {
  upload: async (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/files/upload', formData, {
      onUploadProgress,
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  getUserFiles,
};

export default fileService;