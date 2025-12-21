/**
 * Bidding Package API endpoints
 * Premium-only endpoints for fetching bidding package data
 */

import { apiCall } from './client';
import type { BiddingPackageResponse, BiddingPackageFilters, BiddingPackagePlayerDetail } from '@/types/api';

/**
 * Fetch bidding package data with filtering and pagination
 *
 * @param filters - Filter and pagination options
 * @returns Paginated bidding package data
 */
export async function fetchBiddingPackageData(filters?: BiddingPackageFilters): Promise<BiddingPackageResponse> {
    // Convert signupIds array to comma-separated string for API
    const params: Record<string, unknown> = { ...filters };
    if (filters?.signupIds && filters.signupIds.length > 0) {
        params.signupIds = filters.signupIds.join(',');
    } else {
        delete params.signupIds;
    }

    return apiCall<BiddingPackageResponse>(
        '/api/v1/bidding-package/data',
        'GET',
        undefined,
        params
    );
}

/**
 * Fetch detailed player information including historical seasons
 *
 * @param playerId - The player's unique ID
 * @returns Player basic info and historical season stats
 */
export async function fetchBiddingPackagePlayer(playerId: number): Promise<BiddingPackagePlayerDetail> {
    return apiCall<BiddingPackagePlayerDetail>(
        `/api/v1/bidding-package/player/${playerId}`,
        'GET'
    );
}
