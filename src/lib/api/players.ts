/**
 * Players API endpoints
 * Handles all player-related data fetching
 */

import { apiCall } from './client';

export interface FetchPlayerCardsFilters {
    seasonId?: number;
    leagueId?: number;
    gameTypeId?: number;
    posGroup?: string;
    playerId?: number | null;
    playerIds?: number[];
    pageNumber?: number;
    pageSize?: number;
}

export async function fetchPlayerCards(filters?: FetchPlayerCardsFilters) {
    // Convert playerIds array to comma-separated string for API
    const apiFilters: Record<string, unknown> = { ...filters };

    // Remove playerIds from the object and add as string if present
    if (filters?.playerIds && filters.playerIds.length > 0) {
        delete apiFilters.playerIds;
        apiFilters.player_ids = filters.playerIds.join(',');
    }

    return apiCall('/api/v1/players/cards', 'GET', undefined, apiFilters);
}

export interface FetchPlayerCardNamesFilters {
    seasonId?: number;
    leagueId?: number;
    gameTypeId?: number;
    posGroup?: string;
}

export async function fetchPlayerCardNames(filters?: FetchPlayerCardNamesFilters) {
    return apiCall('/api/v1/players/cards/names', 'GET', undefined, filters as Record<string, unknown> | undefined);
}

export interface FetchPlayerStatsFilters {
    seasonId: number;
    leagueId: number;
    gameTypeId: number;
    posGroup: string;
    playerId?: number;
    playerIds?: number[];
    teamName?: string;
    pageNumber?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export async function fetchPlayerStats(filters: FetchPlayerStatsFilters) {
    // Convert playerIds array to comma-separated string for API
    const apiFilters: Record<string, unknown> = { ...filters };
    
    // Remove playerIds from the object and add as string if present
    if (filters.playerIds && filters.playerIds.length > 0) {
        delete apiFilters.playerIds;
        apiFilters.player_ids = filters.playerIds.join(',');
    }
    
    return apiCall('/api/v1/players/stats', 'GET', undefined, apiFilters);
}

export interface FetchPlayerStatsTeamsFilters {
    seasonId: number;
    leagueId: number;
}

export async function fetchPlayerStatsTeams(filters: FetchPlayerStatsTeamsFilters) {
    return apiCall('/api/v1/players/stats/filters', 'GET', undefined, filters as unknown as Record<string, unknown>);
}

export interface FetchPlayerStatsNamesFilters {
    seasonId: number;
    leagueId: number;
    gameTypeId: number;
    posGroup: string;
}

export async function fetchPlayerStatsNames(filters: FetchPlayerStatsNamesFilters) {
    return apiCall('/api/v1/players/stats/names', 'GET', undefined, filters as unknown as Record<string, unknown>);
}
