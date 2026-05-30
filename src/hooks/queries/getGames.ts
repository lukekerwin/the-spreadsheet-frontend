'use client';

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { DEFAULT_LEAGUE_ID, DEFAULT_GAME_TYPE_ID } from '@/constants/filters';
import type { GamesResponse } from '@/types/api/games';
import { fetchGames } from '@/lib/api/games';

interface UseGamesParams {
    leagueId?: number;
    gameTypeId?: number;
    seasonId?: number | null;
    weekId?: number | null;
    gameDate?: string | null;
    pageNumber?: number;
    pageSize?: number;
    enabled?: boolean;
}

export function useGames({
    leagueId = DEFAULT_LEAGUE_ID,
    gameTypeId = DEFAULT_GAME_TYPE_ID,
    seasonId = null,
    weekId = null,
    gameDate = null,
    pageNumber = 1,
    pageSize = 200,
    enabled = true,
}: UseGamesParams = {}): UseQueryResult<GamesResponse> {
    return useQuery<GamesResponse>({
        queryKey: ['games', { leagueId, gameTypeId, seasonId, weekId, gameDate, pageNumber, pageSize }],
        queryFn: () => fetchGames({ leagueId, gameTypeId, seasonId, weekId, gameDate, pageNumber, pageSize }),
        enabled,
        placeholderData: (prev) => prev, // keep previous data while refetching on filter change
    });
}
