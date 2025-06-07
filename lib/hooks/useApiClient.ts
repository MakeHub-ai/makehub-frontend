import axios from 'axios';
import { useAuth } from '@/contexts/auth-context';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const useApiClient = () => {
  const { session } = useAuth();

  api.interceptors.request.use(
    async (config) => {
      if (config.headers.skipAuth) {
        delete config.headers.skipAuth;
        return config;
      }

      // Simply add the token if available
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Simplified error handling - just reject with the error
  api.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error)
  );

  return api;
};
