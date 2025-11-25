'use client'

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { DEFAULT_SEASON_ID, DEFAULT_LEAGUE_ID, DEFAULT_GAME_TYPE_ID } from '@/constants/filters';
import type { SearchResult } from '@/types/api';
import { fetchGoalieCardNames } from '@/lib/api';

interface GetGoalieCardNamesQueryParams {
    seasonId?: number;
    leagueId?: number;
    gameTypeId?: number;
    enabled?: boolean;
}

export function useGoalieCardNames({
    seasonId = DEFAULT_SEASON_ID,
    leagueId = DEFAULT_LEAGUE_ID,
    gameTypeId = DEFAULT_GAME_TYPE_ID,
    enabled = true,
}: GetGoalieCardNamesQueryParams = {}): UseQueryResult<SearchResult> {
    return useQuery<SearchResult>({
        queryKey: ['goalies', { seasonId, leagueId, gameTypeId}],
        queryFn: () =>
            fetchGoalieCardNames({
                seasonId,
                leagueId,
                gameTypeId,
            }) as Promise<SearchResult>,
        enabled,
    });
}
