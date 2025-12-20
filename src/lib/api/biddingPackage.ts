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
    return apiCall<BiddingPackageResponse>(
        '/api/v1/bidding-package/data',
        'GET',
        undefined,
        filters as Record<string, unknown> | undefined
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
