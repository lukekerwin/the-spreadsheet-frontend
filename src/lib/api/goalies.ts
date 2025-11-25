/**
 * Players API endpoints
 * Handles all player-related data fetching
 */

import { apiCall } from './client';

export interface FetchGoalieCardsFilters {
    seasonId?: number;
    leagueId?: number;
    gameTypeId?: number;
    playerId?: number | null;
    playerIds?: number[];
    pageNumber?: number;
    pageSize?: number;
}

export async function fetchGoalieCards(filters?: FetchGoalieCardsFilters) {
    // Convert playerIds array to comma-separated string for API
    const apiFilters: Record<string, unknown> = { ...filters };

    // Remove playerIds from the object and add as string if present
    if (filters?.playerIds && filters.playerIds.length > 0) {
        delete apiFilters.playerIds;
        apiFilters.player_ids = filters.playerIds.join(',');
    }

    return apiCall('/api/v1/goalies/cards', 'GET', undefined, apiFilters);
}

export interface FetchGoalieCardNamesFilters {
    seasonId?: number;
    leagueId?: number;
    gameTypeId?: number;
}

export async function fetchGoalieCardNames(filters?: FetchGoalieCardNamesFilters) {
    return apiCall('/api/v1/goalies/cards/names', 'GET', undefined, filters as Record<string, unknown> | undefined);
}

export interface FetchGoalieStatsFilters {
    seasonId: number;
    leagueId: number;
    gameTypeId: number;
    playerId?: number;
    playerIds?: number[];
    teamName?: string;
    pageNumber?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export async function fetchGoalieStats(filters: FetchGoalieStatsFilters) {
    // Convert playerIds array to comma-separated string for API
    const apiFilters: Record<string, unknown> = { ...filters };
    
    // Remove playerIds from the object and add as string if present
    if (filters.playerIds && filters.playerIds.length > 0) {
        delete apiFilters.playerIds;
        apiFilters.player_ids = filters.playerIds.join(',');
    }
    
    return apiCall('/api/v1/goalies/stats', 'GET', undefined, apiFilters);
}

export interface FetchGoalieStatsTeamsFilters {
    seasonId: number;
    leagueId: number;
}

export async function fetchGoalieStatsTeams(filters: FetchGoalieStatsTeamsFilters) {
    return apiCall('/api/v1/goalies/stats/filters', 'GET', undefined, filters as unknown as Record<string, unknown>);
}

export interface FetchGoalieStatsNamesFilters {
    seasonId: number;
    leagueId: number;
    gameTypeId: number;
}

export async function fetchGoalieStatsNames(filters: FetchGoalieStatsNamesFilters) {
    return apiCall('/api/v1/goalies/stats/names', 'GET', undefined, filters as unknown as Record<string, unknown>);
}

