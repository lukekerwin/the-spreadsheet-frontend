/**
 * Bidding Package API endpoints
 * Premium-only endpoints for fetching bidding package data
 */

import { apiCall } from './client';
import type { BiddingPackageResponse, BiddingPackageFilters } from '@/types/api';

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
