/**
 * 🛡️ CSRF Token Management Hook
 * 
 * React hook for managing CSRF tokens in forms and API requests
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface CSRFTokenState {
  token: string | null;
  loading: boolean;
  error: string | null;
}

interface CSRFHookReturn extends CSRFTokenState {
  refreshToken: () => Promise<void>;
  getCSRFHeaders: () => Record<string, string>;
}

/**
 * Custom hook for CSRF token management
 */
export function useCSRFToken(): CSRFHookReturn {
  const [state, setState] = useState<CSRFTokenState>({
    token: null,
    loading: true,
    error: null,
  });

  /**
   * Fetch CSRF token from server
   */
  const fetchCSRFToken = useCallback(async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await fetch('/api/auth/csrf', {
        method: 'GET',
        credentials: 'same-origin', // Important: include cookies
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch CSRF token: ${response.statusText}`);
      }

      const data = await response.json();
      
      setState({
        token: data.csrfToken,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('CSRF Token Error:', error);
      setState({
        token: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch CSRF token',
      });
    }
  }, []);

  /**
   * Initialize token on mount
   */
  useEffect(() => {
    fetchCSRFToken();
  }, [fetchCSRFToken]);

  /**
   * Get headers for API requests
   */
  const getCSRFHeaders = useCallback((): Record<string, string> => {
    if (!state.token) {
      return {};
    }

    return {
      'X-CSRF-Token': state.token,
    };
  }, [state.token]);

  return {
    ...state,
    refreshToken: fetchCSRFToken,
    getCSRFHeaders,
  };
}

/**
 * Higher-order component for CSRF protection
 */
export function withCSRFProtection<T extends object>(
  Component: React.ComponentType<T & { csrfToken?: string; csrfHeaders?: Record<string, string> }>
) {
  return function CSRFProtectedComponent(props: T) {
    const csrf = useCSRFToken();

    // Add CSRF token to props
    const enhancedProps = {
      ...props,
      csrfToken: csrf.token,
      csrfHeaders: csrf.getCSRFHeaders(),
    };

    return React.createElement(Component, enhancedProps);
  };
}

/**
 * CSRF-protected fetch wrapper
 */
export async function csrfFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Get CSRF token
  const tokenResponse = await fetch('/api/auth/csrf', {
    credentials: 'same-origin',
  });
  
  if (!tokenResponse.ok) {
    throw new Error('Failed to get CSRF token');
  }
  
  const { csrfToken } = await tokenResponse.json();

  // Add CSRF token to headers
  const headers = {
    ...options.headers,
    'X-CSRF-Token': csrfToken,
  };

  return fetch(url, {
    ...options,
    headers,
    credentials: 'same-origin', // Include cookies
  });
}

/**
 * Form submission helper with CSRF protection
 */
export async function submitFormWithCSRF(
  url: string,
  formData: FormData | object,
  options: RequestInit = {}
): Promise<Response> {
  const body = formData instanceof FormData ? formData : JSON.stringify(formData);
  const contentType = formData instanceof FormData 
    ? undefined // Let browser set multipart boundary
    : 'application/json';

  return csrfFetch(url, {
    method: 'POST',
    body,
    ...options,
    headers: {
      ...(contentType && { 'Content-Type': contentType }),
      ...options.headers,
    },
  });
}

/**
 * React context for CSRF token (optional global state)
 */
import { createContext, useContext } from 'react';

const CSRFContext = createContext<CSRFHookReturn | null>(null);

export function CSRFProvider({ children }: { children: React.ReactNode }) {
  const csrf = useCSRFToken();

  return React.createElement(
    CSRFContext.Provider,
    { value: csrf },
    children
  );
}

export function useCSRFContext(): CSRFHookReturn {
  const context = useContext(CSRFContext);
  if (!context) {
    throw new Error('useCSRFContext must be used within CSRFProvider');
  }
  return context;
}