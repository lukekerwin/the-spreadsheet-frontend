/**
 * Players API endpoints
 * Handles all player-related data fetching
 */

import { apiCall } from './client';

export interface FetchTeamCardsFilters {
    seasonId?: number;
    leagueId?: number;
    gameTypeId?: number;
    teamId?: number | null;
    pageNumber?: number;
    pageSize?: number;
}

export async function fetchTeamCards(filters?: FetchTeamCardsFilters) {
    return apiCall('/api/v1/teams/cards', 'GET', undefined, filters as Record<string, unknown> | undefined);
}

export interface FetchTeamCardNamesFilters {
    seasonId?: number;
    leagueId?: number;
    gameTypeId?: number;
}

export async function fetchTeamCardNames(filters?: FetchTeamCardNamesFilters) {
    return apiCall('/api/v1/teams/cards/names', 'GET', undefined, filters as Record<string, unknown> | undefined);
}

export interface FetchTeamSOSFiltersParams {
    seasonId: number;
    leagueId: number;
    gameTypeId?: number;
}

export async function fetchTeamSOSFilters(params: FetchTeamSOSFiltersParams) {
    return apiCall('/api/v1/teams/sos/filters', 'GET', undefined, {
        season_id: params.seasonId,
        league_id: params.leagueId,
        game_type_id: params.gameTypeId ?? 1,
    });
}

export interface FetchTeamSOSDataParams {
    seasonId: number;
    leagueId: number;
    gameTypeId?: number;
    weekId?: number;
    gameDow?: number;
}

export async function fetchTeamSOSData(params: FetchTeamSOSDataParams) {
    return apiCall('/api/v1/teams/sos/data', 'GET', undefined, {
        season_id: params.seasonId,
        league_id: params.leagueId,
        game_type_id: params.gameTypeId ?? 1,
        week_id: params.weekId ?? 0,
        game_dow: params.gameDow ?? -1,
    });
}

