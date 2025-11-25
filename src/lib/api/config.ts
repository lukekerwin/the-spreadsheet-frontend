/**
 * Centralized API configuration
 * Single source of truth for API URLs and configuration
 */

/**
 * Get the API base URL from environment or use localhost as default
 * In production, NEXT_PUBLIC_API_URL must be explicitly set
 */
export function getApiBaseUrl(): string {
    if (typeof window === 'undefined') {
        // Server-side: require explicit env var
        if (!process.env.NEXT_PUBLIC_API_URL) {
            throw new Error('NEXT_PUBLIC_API_URL environment variable is not set');
        }
        return process.env.NEXT_PUBLIC_API_URL;
    }

    // Client-side: use env var or localhost
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
}

export const API_BASE_URL = getApiBaseUrl();
