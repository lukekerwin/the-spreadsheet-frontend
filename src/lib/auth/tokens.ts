/**
 * Token storage utilities for JWT authentication
 * Handles storing, retrieving, and removing auth tokens
 */

const TOKEN_KEY = 'access_token';

/**
 * Check if code is running in browser (not SSR)
 */
function isBrowser(): boolean {
    return typeof window !== 'undefined';
}

/**
 * Store authentication token in localStorage
 */
export function setAuthToken(token: string): void {
    if (isBrowser()) {
        localStorage.setItem(TOKEN_KEY, token);
    }
}

/**
 * Retrieve authentication token from localStorage
 */
export function getAuthToken(): string | null {
    if (isBrowser()) {
        return localStorage.getItem(TOKEN_KEY);
    }
    return null;
}

/**
 * Remove authentication token from localStorage
 */
export function removeAuthToken(): void {
    if (isBrowser()) {
        localStorage.removeItem(TOKEN_KEY);
    }
}

/**
 * Check if user has a valid token
 */
export function hasAuthToken(): boolean {
    return !!getAuthToken();
}
