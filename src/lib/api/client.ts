/**
 * Core HTTP client for API requests
 * Handles all network communication and error handling
 */

import { getAuthToken } from '@/lib/auth/tokens';
import { API_BASE_URL } from './config';
import { ApiError, handleResponseError } from './errors';
import { handle401Response } from './interceptor';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

/**
 * Transform camelCase parameters to snake_case for API compatibility
 */
export function transformParams(params: Record<string, unknown>): Record<string, unknown> {
    const transformed: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(params)) {
        // Skip undefined and null values
        if (value === undefined || value === null) {
            continue;
        }

        // Transform camelCase to snake_case
        const snakeCaseKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        transformed[snakeCaseKey] = value;
    }

    return transformed;
}

/**
 * Build query string from parameters
 */
export function buildQueryString(params: Record<string, unknown>): string {
    const searchParams = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
            searchParams.append(key, String(value));
        }
    }

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
}

/**
 * Generic fetch wrapper for API calls
 * Handles error handling, JSON parsing, type safety, and token refresh
 */
export async function apiCall<T>(
    endpoint: string,
    method: HttpMethod = 'GET',
    data?: unknown,
    params?: Record<string, unknown>,
): Promise<T> {
    // Transform parameters from camelCase to snake_case
    const transformedParams = params ? transformParams(params) : {};
    const queryString = buildQueryString(transformedParams);

    const url = `${API_BASE_URL}${endpoint}${queryString}`;

    // Get auth token if available
    let token = getAuthToken();

    const options: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
        },
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        let response = await fetch(url, options);

        // Handle 401 Unauthorized - attempt token refresh
        if (response.status === 401) {
            const refreshResult = await handle401Response(options);

            // If refresh failed, don't retry
            if (refreshResult === null && getAuthToken() === token) {
                await handleResponseError(response, `API error: ${response.statusText}`);
            }

            // Token was refreshed, retry with new token
            token = getAuthToken();
            if (token) {
                const newOptions: RequestInit = {
                    ...options,
                    headers: {
                        ...options.headers,
                        'Authorization': `Bearer ${token}`,
                    },
                };
                response = await fetch(url, newOptions);
            }
        }

        if (!response.ok) {
            await handleResponseError(response, `API error: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        // Re-throw ApiError as-is
        if (error instanceof ApiError) {
            throw error;
        }

        // Handle network errors and other exceptions
        if (error instanceof Error) {
            throw new ApiError(0, `API request failed: ${error.message}`);
        }

        throw new ApiError(0, 'An unexpected error occurred');
    }
}
