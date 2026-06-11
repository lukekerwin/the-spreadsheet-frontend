'use client';

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { DEFAULT_SEASON_ID, DEFAULT_LEAGUE_ID, DEFAULT_GAME_TYPE_ID } from '@/constants/filters';
import type { CardResponse } from '@/types/api';
import { fetchPlayerWeeklyCards } from '@/lib/api';

interface GetPlayerWeeklyCardsQueryParams {
    seasonId?: number;
    leagueId?: number;
    gameTypeId?: number;
    posGroup?: string;
    playerId?: number | null;
    enabled?: boolean;
}

export function usePlayerWeeklyCards({
    seasonId = DEFAULT_SEASON_ID,
    leagueId = DEFAULT_LEAGUE_ID,
    gameTypeId = DEFAULT_GAME_TYPE_ID,
    posGroup = 'C',
    playerId = null,
    enabled = true,
}: GetPlayerWeeklyCardsQueryParams = {}): UseQueryResult<CardResponse> {
    return useQuery<CardResponse>({
        queryKey: ['players', 'weekly', { seasonId, leagueId, gameTypeId, posGroup, playerId }],
        queryFn: () =>
            fetchPlayerWeeklyCards({
                seasonId,
                leagueId,
                gameTypeId,
                posGroup,
                playerId: playerId as number,
            }) as Promise<CardResponse>,
        enabled: enabled !== false && !!playerId,
    });
}
