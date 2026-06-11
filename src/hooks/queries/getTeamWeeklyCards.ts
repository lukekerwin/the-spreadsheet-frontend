'use client';

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { DEFAULT_SEASON_ID, DEFAULT_LEAGUE_ID, DEFAULT_GAME_TYPE_ID } from '@/constants/filters';
import type { CardResponse } from '@/types/api';
import { fetchTeamWeeklyCards } from '@/lib/api';

interface GetTeamWeeklyCardsQueryParams {
    seasonId?: number;
    leagueId?: number;
    gameTypeId?: number;
    teamId?: number | null;
    enabled?: boolean;
}

export function useTeamWeeklyCards({
    seasonId = DEFAULT_SEASON_ID,
    leagueId = DEFAULT_LEAGUE_ID,
    gameTypeId = DEFAULT_GAME_TYPE_ID,
    teamId = null,
    enabled = true,
}: GetTeamWeeklyCardsQueryParams = {}): UseQueryResult<CardResponse> {
    return useQuery<CardResponse>({
        queryKey: ['teams', 'weekly', { seasonId, leagueId, gameTypeId, teamId }],
        queryFn: () =>
            fetchTeamWeeklyCards({
                seasonId,
                leagueId,
                gameTypeId,
                teamId: teamId as number,
            }) as Promise<CardResponse>,
        enabled: enabled !== false && !!teamId,
    });
}
