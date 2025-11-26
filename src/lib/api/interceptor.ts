/**
 * API interceptor for handling 401 responses
 *
 * Note: JWT tokens don't have a refresh mechanism in this app.
 * When a token expires (after 30 days), the user must log in again.
 * This interceptor handles 401 errors by clearing the invalid token.
 */

import { removeAuthToken } from '@/lib/auth/tokens';
import { ApiError } from './errors';

/**
 * Handle 401 response by clearing the invalid token
 * Returns null to signal that the request should not be retried
 * (user needs to log in again)
 */
export async function handle401Response(
    _originalRequest: RequestInit,
): Promise<Response | null> {
    // Token is invalid or expired - clear it
    // The AuthProvider will detect this and show the login modal
    removeAuthToken();
    return null;
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
