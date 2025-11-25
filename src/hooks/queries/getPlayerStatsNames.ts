'use client'

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { DEFAULT_SEASON_ID, DEFAULT_LEAGUE_ID, DEFAULT_GAME_TYPE_ID } from '@/constants/filters';
import type { SearchResult } from '@/types/api';
import { fetchPlayerStatsNames } from '@/lib/api';

interface GetPlayerStatsNamesQueryParams {
    seasonId?: number;
    leagueId?: number;
    gameTypeId?: number;
    posGroup?: string;
    enabled?: boolean;
}

export function usePlayerStatsNames({
    seasonId = DEFAULT_SEASON_ID,
    leagueId = DEFAULT_LEAGUE_ID,
    gameTypeId = DEFAULT_GAME_TYPE_ID,
    posGroup = 'C',
    enabled = true,
}: GetPlayerStatsNamesQueryParams = {}): UseQueryResult<SearchResult> {
    return useQuery<SearchResult>({
        queryKey: ['playerStatsNames', { seasonId, leagueId, gameTypeId, posGroup }],
        queryFn: () =>
            fetchPlayerStatsNames({
                seasonId,
                leagueId,
                gameTypeId,
                posGroup,
            }) as Promise<SearchResult>,
        enabled,
    });
}
