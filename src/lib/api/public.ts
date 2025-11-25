/**
 * Public API endpoints
 * These endpoints are accessible without authentication
 * Returns default data: Season 52, League 37 (NHL), Game Type 1
 *
 * Player endpoint: First 24 Centers (C)
 * Goalie endpoint: First 24 goalies
 * Team endpoint: First 24 teams
 */

import { apiCall } from './client';

/**
 * Fetch public player cards
 * Returns first 24 Centers for Season 52, League 37 (NHL), Game Type 1
 */
export async function fetchPublicPlayerCards() {
    return apiCall('/api/v1/public/cards/player', 'GET');
}

/**
 * Fetch public goalie cards
 * Returns first 24 goalies for Season 52, League 37 (NHL), Game Type 1
 */
export async function fetchPublicGoalieCards() {
    return apiCall('/api/v1/public/cards/goalie', 'GET');
}

/**
 * Fetch public team cards
 * Returns first 24 teams for Season 52, League 37 (NHL), Game Type 1
 */
export async function fetchPublicTeamCards() {
    return apiCall('/api/v1/public/cards/team', 'GET');
}
