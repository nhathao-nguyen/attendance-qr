import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../config/api';

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher';
  phoneNumber?: string;
  profilePicture?: string;
  studentCode?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: 'student' | 'teacher', phoneNumber?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

// Create context
export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  token: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  updateProfile: async () => {},
});

// Provider component
interface AuthContextProviderProps {
  children: ReactNode;
}

const AuthContextProvider: React.FC<AuthContextProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Check for stored token and user data on app start
  useEffect(() => {
    const loadStoredAuthData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const storedUser = await AsyncStorage.getItem('user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
          
          // Set default authorization header for all requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
      } catch (error) {
        console.error('Error loading authentication data', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredAuthData();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      const { token, user } = response.data;
      
      // Store authentication data
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      // Update state
      setToken(token);
      setUser(user);
      setIsAuthenticated(true);
      
      // Set default authorization header for all requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (
    name: string, 
    email: string, 
    password: string, 
    role: 'student' | 'teacher',
    phoneNumber?: string
  ) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password,
        role,
        phoneNumber,
      });

      const { token, user } = response.data;
      
      // Store authentication data
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      // Update state
      setToken(token);
      setUser(user);
      setIsAuthenticated(true);
      
      // Set default authorization header for all requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (error) {
      console.error('Registration failed', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Remove stored authentication data
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      
      // Update state
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      
      // Remove default authorization header
      delete axios.defaults.headers.common['Authorization'];
    } catch (error) {
      console.error('Logout failed', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update profile function
  const updateProfile = async (data: Partial<User>) => {
    try {
      setIsLoading(true);
      
      // Create form data for file upload if needed
      const formData = new FormData();
      
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'profilePicture' && typeof value === 'string' && value.startsWith('file://')) {
          // Handle profile picture upload
          const uriParts = value.split('.');
          const fileType = uriParts[uriParts.length - 1];
          
          formData.append('profilePicture', {
            uri: value,
            name: `photo.${fileType}`,
            type: `image/${fileType}`,
          } as any);
        } else if (value !== undefined) {
          formData.append(key, value as string);
        }
      });
      
      const response = await axios.put(
        `${API_URL}/users/profile`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const { user: updatedUser } = response.data;
      
      // Update stored user data
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Update state
      setUser(updatedUser);
    } catch (error) {
      console.error('Profile update failed', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    isAuthenticated,
    isLoading,
    user,
    token,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContextProvider; 