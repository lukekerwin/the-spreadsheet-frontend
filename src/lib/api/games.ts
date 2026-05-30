/**
 * Games API endpoints
 */

import { apiCall } from './client';
import type { GamesResponse, GameDetailResponse } from '@/types/api/games';

export interface FetchGamesFilters {
    leagueId: number;
    gameTypeId?: number;
    seasonId?: number | null;   // omitted -> backend resolves to latest season
    weekId?: number | null;     // omitted -> backend resolves to latest week with results
    gameDate?: string | null;   // omitted -> backend resolves to latest day with completed games
    pageNumber?: number;
    pageSize?: number;
}

export async function fetchGames(filters: FetchGamesFilters): Promise<GamesResponse> {
    // null/undefined params are dropped by the client, letting the backend resolve defaults.
    return apiCall<GamesResponse>(
        '/api/v1/games/cards',
        'GET',
        undefined,
        filters as Record<string, unknown>,
    );
}

export async function fetchGameDetail(gameId: number): Promise<GameDetailResponse> {
    return apiCall<GameDetailResponse>(`/api/v1/games/${gameId}`, 'GET');
}
