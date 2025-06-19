import axios from "axios"

const BASE_URL = 'http://localhost:8000/users'
const LOGIN_URL = `${BASE_URL}/token/`



export const login = async (username, password) => {
    
    try {
        console.log('Making login request to:', LOGIN_URL);
        console.log('Request data:', { username, password });
        
        const response = await axios.post(LOGIN_URL,
            { username: username, password: password },
            { withCredentials: true }
        );
        
        console.log('Response status:', response.status);
        console.log('Response data:', response.data);
        console.log('Response headers:', response.headers);

        
        return response.data.success;
    } catch (error) {
        console.error('Login error:', error);
        if (error.response) {
            console.error('Error status:', error.response.status);
            console.error('Error data:', error.response.data);
            
        }
        return false;
    }
}


export const signup = async (username, email, password) => {
    try {
        console.log('Making signup request to:', `${BASE_URL}/register/`);
        console.log('Request data:', { username, email, password });
        
        const response = await axios.post(`${BASE_URL}/register/`, {
            username: username,
            email: email,
            password: password
        });
        
        console.log('Signup successful:', response.data);
        return { success: true, data: response.data };
    } catch (error) {
        console.error('Signup error:', error);
        if (error.response) {
            console.error('Error status:', error.response.status);
            console.error('Error data:', error.response.data);
            return { 
                success: false, 
                errors: error.response.data 
            };
        }
        return { 
            success: false, 
            errors: { message: 'Network error or server unavailable' } 
        };
    }
}