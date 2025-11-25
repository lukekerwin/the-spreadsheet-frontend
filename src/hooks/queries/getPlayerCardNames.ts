'use client'

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { DEFAULT_SEASON_ID, DEFAULT_LEAGUE_ID, DEFAULT_GAME_TYPE_ID } from '@/constants/filters';
import type { SearchResult } from '@/types/api';
import { fetchPlayerCardNames } from '@/lib/api';

interface GetPlayerCardNamesQueryParams {
    seasonId?: number;
    leagueId?: number;
    gameTypeId?: number;
    posGroup?: string;
    enabled?: boolean;
}

export function usePlayerCardNames({
    seasonId = DEFAULT_SEASON_ID,
    leagueId = DEFAULT_LEAGUE_ID,
    gameTypeId = DEFAULT_GAME_TYPE_ID,
    posGroup = 'C',
    enabled = true,
}: GetPlayerCardNamesQueryParams = {}): UseQueryResult<SearchResult> {
    return useQuery<SearchResult>({
        queryKey: ['players', { seasonId, leagueId, posGroup, gameTypeId}],
        queryFn: () =>
            fetchPlayerCardNames({
                seasonId,
                leagueId,
                posGroup,
                gameTypeId,
            }) as Promise<SearchResult>,
        enabled,
    });
}