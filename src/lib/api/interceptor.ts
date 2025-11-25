/**
 * API interceptor for handling token refresh and 401 responses
 * Automatically attempts to refresh the token when it expires
 */

import { getAuthToken, setAuthToken, removeAuthToken } from '@/lib/auth/tokens';
import { ApiError } from './errors';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

/**
 * Refresh the authentication token
 * Returns new token or null if refresh fails
 */
async function refreshAuthToken(): Promise<string | null> {
    try {
        const currentToken = getAuthToken();

        if (!currentToken) {
            return null;
        }

        const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${currentToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            removeAuthToken();
            return null;
        }

        const data = await response.json();

        if (data.access_token) {
            setAuthToken(data.access_token);
            return data.access_token;
        }

        return null;
    } catch (error) {
        console.error('Token refresh failed:', error);
        removeAuthToken();
        return null;
    }
}

/**
 * Handle 401 response by attempting token refresh
 * If refresh succeeds, retry the original request
 * If refresh fails, clear auth and return null
 */
export async function handle401Response(
    originalRequest: RequestInit,
): Promise<Response | null> {
    // Prevent multiple simultaneous refresh attempts
    if (isRefreshing && refreshPromise) {
        const newToken = await refreshPromise;

        if (!newToken) {
            return null;
        }

        // Retry with new token
        const headers = new Headers(originalRequest.headers);
        headers.set('Authorization', `Bearer ${newToken}`);

        return null; // Signal to retry the original request
    }

    // Start refresh process
    isRefreshing = true;

    refreshPromise = refreshAuthToken()
        .then((token) => {
            isRefreshing = false;
            refreshPromise = null;
            return token;
        })
        .catch((error) => {
            console.error('Refresh failed:', error);
            isRefreshing = false;
            refreshPromise = null;
            return null;
        });

    const newToken = await refreshPromise;

    if (!newToken) {
        return null;
    }

    return null; // Signal to retry
}

/**
 * Check if error is a 401 Unauthorized error
 */
export function is401Error(error: unknown): boolean {
    if (error instanceof ApiError) {
        return error.isAuthError();
    }

    return false;
}
