/**
 * Favorites API endpoints
 * Handles user favorites for bidding package players
 */

import { getAuthToken } from '@/lib/auth/tokens';
import { API_BASE_URL } from './config';
import { ApiError, handleResponseError } from './errors';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface FavoritesList {
    favorites: string[];
}

export interface FavoriteResponse {
    signup_id: string;
    is_favorite: boolean;
}

// ============================================
// FAVORITES API FUNCTIONS
// ============================================

/**
 * Get all favorites for the current user
 */
export async function getFavorites(): Promise<string[]> {
    const token = getAuthToken();

    if (!token) {
        return []; // Return empty array if not authenticated
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/favorites`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                return []; // Return empty if not authenticated
            }
            await handleResponseError(response, 'Failed to fetch favorites');
        }

        const data: FavoritesList = await response.json();
        return data.favorites;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        console.error('Failed to fetch favorites:', error);
        return [];
    }
}

/**
 * Add a player to favorites
 */
export async function addFavorite(signupId: string): Promise<boolean> {
    const token = getAuthToken();

    if (!token) {
        throw new ApiError(401, 'No authentication token found');
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/favorites/${signupId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            await handleResponseError(response, 'Failed to add favorite');
        }

        const data: FavoriteResponse = await response.json();
        return data.is_favorite;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(0, 'Failed to add favorite');
    }
}

/**
 * Remove a player from favorites
 */
export async function removeFavorite(signupId: string): Promise<boolean> {
    const token = getAuthToken();

    if (!token) {
        throw new ApiError(401, 'No authentication token found');
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/favorites/${signupId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            await handleResponseError(response, 'Failed to remove favorite');
        }

        const data: FavoriteResponse = await response.json();
        return data.is_favorite;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(0, 'Failed to remove favorite');
    }
}

/**
 * Toggle a player's favorite status
 */
export async function toggleFavorite(signupId: string, isFavorite: boolean): Promise<boolean> {
    if (isFavorite) {
        await removeFavorite(signupId);
        return false;
    } else {
        await addFavorite(signupId);
        return true;
    }
}
