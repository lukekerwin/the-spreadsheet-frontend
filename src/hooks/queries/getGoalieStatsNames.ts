'use client'

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { DEFAULT_SEASON_ID, DEFAULT_LEAGUE_ID, DEFAULT_GAME_TYPE_ID } from '@/constants/filters';
import { fetchGoalieStatsNames } from '@/lib/api';

interface GetGoalieStatsNamesQueryParams {
    seasonId?: number;
    leagueId?: number;
    gameTypeId?: number;
    enabled?: boolean;
}

interface SearchResult {
    results: Array<{
        id: number;
        name: string;
    }>;
}

export function useGoalieStatsNames({
    seasonId = DEFAULT_SEASON_ID,
    leagueId = DEFAULT_LEAGUE_ID,
    gameTypeId = DEFAULT_GAME_TYPE_ID,
    enabled = true,
}: GetGoalieStatsNamesQueryParams = {}): UseQueryResult<SearchResult> {
    return useQuery<SearchResult>({
        queryKey: ['goalieStatsNames', { seasonId, leagueId, gameTypeId }],
        queryFn: () =>
            fetchGoalieStatsNames({
                seasonId,
                leagueId,
                gameTypeId,
            }) as Promise<SearchResult>,
        enabled,
    });
}
