import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000/users',
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await axios.post('http://localhost:8000/users/token/refresh/', {}, { withCredentials: true });
        return axiosInstance(originalRequest);

      } catch (refreshError) {
        console.error('Refresh token failed');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
