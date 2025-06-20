import axios from 'axios';

const adminAxiosInstance = axios.create({
  baseURL: 'http://localhost:8000/admindashboard',
  withCredentials: true,
});

adminAxiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await axios.post('http://localhost:8000/admindashboard/token/refresh/', {}, { 
          withCredentials: true 
        });
        return adminAxiosInstance(originalRequest);
        
      } catch (refreshError) {
        console.error('Admin refresh token failed');
        
        window.location.href = '/admin/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default adminAxiosInstance;