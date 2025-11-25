'use client'

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { DEFAULT_SEASON_ID, DEFAULT_LEAGUE_ID, DEFAULT_GAME_TYPE_ID } from '@/constants/filters';
import type { SearchResult } from '@/types/api';
import { fetchTeamCardNames } from '@/lib/api';

interface GetTeamCardNamesQueryParams {
    seasonId?: number;
    leagueId?: number;
    gameTypeId?: number;
    enabled?: boolean;
}

export function useTeamCardNames({
    seasonId = DEFAULT_SEASON_ID,
    leagueId = DEFAULT_LEAGUE_ID,
    gameTypeId = DEFAULT_GAME_TYPE_ID,
    enabled = true,
}: GetTeamCardNamesQueryParams = {}): UseQueryResult<SearchResult> {
    return useQuery<SearchResult>({
        queryKey: ['teams', { seasonId, leagueId, gameTypeId}],
        queryFn: () =>
            fetchTeamCardNames({
                seasonId,
                leagueId,
                gameTypeId,
            }) as Promise<SearchResult>,
        enabled,
    });
}
