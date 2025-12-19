'use client'

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { DEFAULT_SEASON_ID, DEFAULT_LEAGUE_ID, DEFAULT_GAME_TYPE_ID } from '@/constants/filters';
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
    gameTypeId?: number;
    enabled?: boolean;
}

export function useTeamSOSFilters({
    seasonId = DEFAULT_SEASON_ID,
    leagueId = DEFAULT_LEAGUE_ID,
    gameTypeId = DEFAULT_GAME_TYPE_ID,
    enabled = true,
}: GetTeamSOSFiltersParams = {}): UseQueryResult<TeamSOSFiltersResponse> {
    return useQuery<TeamSOSFiltersResponse>({
        queryKey: ['teamSOSFilters', { seasonId, leagueId, gameTypeId }],
        queryFn: () =>
            fetchTeamSOSFilters({
                seasonId,
                leagueId,
                gameTypeId,
            }) as Promise<TeamSOSFiltersResponse>,
        enabled,
    });
}
