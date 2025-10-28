"use client";

import { useEffect, useRef, useCallback } from 'react';

export function useTokenRefresh() {
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const refreshToken = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        // Refresh failed, clear cookies and redirect to login
        await fetch('/api/auth/clear-cookies', { method: 'POST' });
        window.dispatchEvent(new Event("auth-changed"));
        return false;
      }

      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }, []);

  const startTokenRefresh = useCallback(() => {
    // Clear existing interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    // Refresh token every 10 minutes (600 seconds)
    // Adjust this based on your token expiration time
    refreshIntervalRef.current = setInterval(async () => {
      const success = await refreshToken();
      if (!success) {
        // Stop refreshing if failed
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
          refreshIntervalRef.current = null;
        }
      }
    }, 10 * 60 * 1000); // 10 minutes
  }, [refreshToken]);

  const stopTokenRefresh = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopTokenRefresh();
    };
  }, [stopTokenRefresh]);

  return {
    refreshToken,
    startTokenRefresh,
    stopTokenRefresh,
  };
}


