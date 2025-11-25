'use client'

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { DEFAULT_SEASON_ID, DEFAULT_LEAGUE_ID } from '@/constants/filters';
import { fetchPlayerStatsTeams } from '@/lib/api';

interface TeamFilterOption {
    team_name: string;
}

interface GetPlayerStatsTeamsQueryParams {
    seasonId?: number;
    leagueId?: number;
    enabled?: boolean;
}

export function usePlayerStatsTeams({
    seasonId = DEFAULT_SEASON_ID,
    leagueId = DEFAULT_LEAGUE_ID,
    enabled = true,
}: GetPlayerStatsTeamsQueryParams = {}): UseQueryResult<TeamFilterOption[]> {
    return useQuery<TeamFilterOption[]>({
        queryKey: ['playerStatsTeams', { seasonId, leagueId }],
        queryFn: () =>
            fetchPlayerStatsTeams({
                seasonId,
                leagueId,
            }) as Promise<TeamFilterOption[]>,
        enabled,
    });
}
