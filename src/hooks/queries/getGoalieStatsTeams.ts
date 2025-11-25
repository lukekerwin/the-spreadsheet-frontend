'use client'

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { DEFAULT_SEASON_ID, DEFAULT_LEAGUE_ID } from '@/constants/filters';
import { fetchGoalieStatsTeams } from '@/lib/api';

interface GetGoalieStatsTeamsQueryParams {
    seasonId?: number;
    leagueId?: number;
    enabled?: boolean;
}

interface TeamFilterOption {
    team_name: string;
}

export function useGoalieStatsTeams({
    seasonId = DEFAULT_SEASON_ID,
    leagueId = DEFAULT_LEAGUE_ID,
    enabled = true,
}: GetGoalieStatsTeamsQueryParams = {}): UseQueryResult<TeamFilterOption[]> {
    return useQuery<TeamFilterOption[]>({
        queryKey: ['goalieStatsTeams', { seasonId, leagueId }],
        queryFn: () =>
            fetchGoalieStatsTeams({
                seasonId,
                leagueId,
            }) as Promise<TeamFilterOption[]>,
        enabled,
    });
}
