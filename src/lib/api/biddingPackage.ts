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
    // Convert array filters to comma-separated strings for API
    const params: Record<string, unknown> = { ...filters };

    // Convert array params to comma-separated strings
    if (filters?.positions?.length) {
        params.positions = filters.positions.join(',');
    } else {
        delete params.positions;
    }

    if (filters?.servers?.length) {
        params.servers = filters.servers.join(',');
    } else {
        delete params.servers;
    }

    if (filters?.consoles?.length) {
        params.consoles = filters.consoles.join(',');
    } else {
        delete params.consoles;
    }

    if (filters?.lastSeasonIds?.length) {
        params.lastSeasonIds = filters.lastSeasonIds.join(',');
    } else {
        delete params.lastSeasonIds;
    }

    if (filters?.lastLeagueIds?.length) {
        params.lastLeagueIds = filters.lastLeagueIds.join(',');
    } else {
        delete params.lastLeagueIds;
    }

    if (filters?.signupIds?.length) {
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
