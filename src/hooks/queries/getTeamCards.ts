'use client';

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { DEFAULT_SEASON_ID, DEFAULT_LEAGUE_ID, DEFAULT_GAME_TYPE_ID } from '@/constants/filters';
import type { CardResponse } from '@/types/api';
import { fetchTeamCards } from '@/lib/api';

interface GetTeamCardsQueryParams {
    seasonId?: number;
    leagueId?: number;
    gameTypeId?: number;
    teamId?: number | null;
    pageNumber?: number;
    pageSize?: number;
    enabled?: boolean;
}

export function useTeamCards({
    seasonId = DEFAULT_SEASON_ID,
    leagueId = DEFAULT_LEAGUE_ID,
    gameTypeId = DEFAULT_GAME_TYPE_ID,
    teamId = null,
    pageNumber = 1,
    pageSize = 24,
    enabled = true,
}: GetTeamCardsQueryParams = {}): UseQueryResult<CardResponse> {
    return useQuery<CardResponse>({
        queryKey: ['teams', { seasonId, leagueId, gameTypeId, teamId, pageNumber, pageSize }],
        queryFn: () =>
            fetchTeamCards({
                seasonId,
                leagueId,
                gameTypeId,
                teamId,
                pageNumber,
                pageSize
            }) as Promise<CardResponse>,
        enabled,
    });
}