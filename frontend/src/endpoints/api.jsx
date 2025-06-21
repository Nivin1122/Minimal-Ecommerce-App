import axiosInstance from "./axiosInstance";

export const login = async (username, password) => {
  try {
    const response = await axiosInstance.post('users/token/', { username, password });
    return response.data.success;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    return false;
  }
};

export const signup = async (username, email, password) => {
  try {
    const response = await axiosInstance.post('users/register/', { username, email, password });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      errors: error.response?.data || { message: 'Server error' }
    };
  }
};

export const logout = async () => {
  try {
    const response = await axiosInstance.post('users/logout/');
    return response.data.success;
  } catch (error) {
    console.error('Logout error:', error);
    return false;
  }
};
