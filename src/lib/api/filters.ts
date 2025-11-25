/**
 * Filters API endpoints
 * Handles all filter options data fetching
 */

import { apiCall } from './client';

/**
 * Fetch all available filter options
 * Returns seasons, leagues, positions, game types, etc.
 */
export async function fetchFilterOptions() {
    return apiCall('/filters');
}
