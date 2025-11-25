'use client'

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { DEFAULT_SEASON_ID, DEFAULT_LEAGUE_ID } from '@/constants/filters';
import { fetchTeamSOSFilters } from '@/lib/api/teams';

export interface FilterOption {
    label: string;
    value: number;
}

export interface TeamSOSFiltersResponse {
    weeks: FilterOption[];
    days_of_week: FilterOption[];
}

interface GetTeamSOSFiltersParams {
    seasonId?: number;
    leagueId?: number;
    enabled?: boolean;
}

export function useTeamSOSFilters({
    seasonId = DEFAULT_SEASON_ID,
    leagueId = DEFAULT_LEAGUE_ID,
    enabled = true,
}: GetTeamSOSFiltersParams = {}): UseQueryResult<TeamSOSFiltersResponse> {
    return useQuery<TeamSOSFiltersResponse>({
        queryKey: ['teamSOSFilters', { seasonId, leagueId }],
        queryFn: () =>
            fetchTeamSOSFilters({
                seasonId,
                leagueId,
            }) as Promise<TeamSOSFiltersResponse>,
        enabled,
    });
}
