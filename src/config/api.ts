// Update this with your backend API URL
export const API_URL = 'http://192.168.38.143:5000/api';

// Configure axios with defaults
import axios from 'axios';

// Configure axios defaults
axios.defaults.baseURL = API_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add interceptor for error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (!error.response) {
      console.error('Network error - please check your connection');
      return Promise.reject(new Error('Network error - please check your connection'));
    }
    
    // Handle server errors
    if (error.response.status >= 500) {
      console.error('Server error', error.response.data);
      return Promise.reject(new Error('Server error - please try again later'));
    }
    
    // Pass through client errors (400-level)
    return Promise.reject(error);
  }
); 