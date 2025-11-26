/**
 * Authentication API endpoints
 * Handles user registration, login, logout, and user info
 */

import { getAuthToken } from '@/lib/auth/tokens';
import { API_BASE_URL } from './config';
import { ApiError, handleResponseError } from './errors';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface User {
    id: string;
    email: string;
    is_active: boolean;
    is_superuser: boolean;
    is_verified: boolean;
    first_name?: string;
    last_name?: string;
    // Subscription fields
    subscription_tier: 'free' | 'premium';
    subscription_status: 'none' | 'active' | 'canceled' | 'past_due' | 'trialing';
    subscription_current_period_end?: string;
    has_premium_access: boolean;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    access_token: string;
    token_type: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
}

// ============================================
// AUTH API FUNCTIONS
// ============================================

/**
 * Register a new user
 */
export async function register(data: RegisterRequest): Promise<User> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            await handleResponseError(response, 'Registration failed');
        }

        return await response.json();
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        if (error instanceof Error) {
            throw new ApiError(0, `Registration failed: ${error.message}`);
        }

        throw new ApiError(0, 'Registration failed');
    }
}

/**
 * Login user and get JWT token
 * Note: Backend expects application/x-www-form-urlencoded format
 * Field is called 'username' but we pass email
 */
export async function login(data: LoginRequest): Promise<LoginResponse> {
    try {
        const formData = new URLSearchParams();
        formData.append('username', data.email);
        formData.append('password', data.password);

        const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData,
        });

        if (!response.ok) {
            await handleResponseError(response, 'Login failed');
        }

        return await response.json();
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        if (error instanceof Error) {
            throw new ApiError(0, `Login failed: ${error.message}`);
        }

        throw new ApiError(0, 'Login failed');
    }
}

/**
 * Logout user (invalidate token)
 */
export async function logout(): Promise<void> {
    const token = getAuthToken();

    if (token) {
        await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    }
}

/**
 * Get current user information
 */
export async function getCurrentUser(): Promise<User> {
    const token = getAuthToken();

    if (!token) {
        throw new ApiError(401, 'No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        // Only throw ApiError for auth errors (401/403)
        // This allows the caller to distinguish between auth failures and transient errors
        if (response.status === 401 || response.status === 403) {
            throw new ApiError(response.status, 'Authentication failed');
        }
        // For other errors (network, 500, etc.), throw a generic error
        // but don't signal it as an auth error
        throw new ApiError(response.status, 'Failed to fetch user information');
    }

    return await response.json();
}
