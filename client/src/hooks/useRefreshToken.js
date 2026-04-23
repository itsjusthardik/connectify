import { useCallback } from 'react';
import api from '../api/axios';

/**
 * Custom hook for handling access token refresh
 * Useful if you need to manually trigger refresh in specific scenarios
 */
export const useRefreshToken = () => {
  const refreshToken = useCallback(async () => {
    try {
      const response = await api.post('/auth/refresh');
      if (response.data.success) {
        const newToken = response.data.data.accessToken;
        sessionStorage.setItem('accessToken', newToken);
        return newToken;
      }
    } catch (error) {
      throw new Error('Failed to refresh token');
    }
  }, []);

  return refreshToken;
};

export default useRefreshToken;
