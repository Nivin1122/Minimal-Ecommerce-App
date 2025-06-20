import adminAxiosInstance from "./adminAxiosInstance";


export const adminLogin = async (username, password) => {
  try {
    const response = await adminAxiosInstance.post('/token/', { 
      username, 
      password 
    });
    return {
      success: response.data.success,
      data: response.data
    };
  } catch (error) {
    console.error('Admin login error:', error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || 'Admin login failed'
    };
  }
};

export const adminLogout = async () => {
  try {
    const response = await adminAxiosInstance.post('/logout/');
    return response.data.success;
  } catch (error) {
    console.error('Admin logout error:', error);
    return false;
  }
};

export const checkAdminAuth = async () => {
  try {
    const response = await adminAxiosInstance.get('/authenticated/');
    return {
      authenticated: response.data.authenticated,
      user: response.data.user
    };
  } catch (error) {
    console.error('Admin auth check error:', error);
    return {
      authenticated: false,
      user: null
    };
  }
};

export const refreshAdminToken = async () => {
  try {
    const response = await adminAxiosInstance.post('/token/refresh/');
    return response.data.refreshed;
  } catch (error) {
    console.error('Admin token refresh error:', error);
    return false;
  }
};