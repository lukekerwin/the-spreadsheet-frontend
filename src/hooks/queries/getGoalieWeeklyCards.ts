'use client';

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { DEFAULT_SEASON_ID, DEFAULT_LEAGUE_ID, DEFAULT_GAME_TYPE_ID } from '@/constants/filters';
import type { CardResponse } from '@/types/api';
import { fetchGoalieWeeklyCards } from '@/lib/api';

interface GetGoalieWeeklyCardsQueryParams {
    seasonId?: number;
    leagueId?: number;
    gameTypeId?: number;
    playerId?: number | null;
    enabled?: boolean;
}

export function useGoalieWeeklyCards({
    seasonId = DEFAULT_SEASON_ID,
    leagueId = DEFAULT_LEAGUE_ID,
    gameTypeId = DEFAULT_GAME_TYPE_ID,
    playerId = null,
    enabled = true,
}: GetGoalieWeeklyCardsQueryParams = {}): UseQueryResult<CardResponse> {
    return useQuery<CardResponse>({
        queryKey: ['goalies', 'weekly', { seasonId, leagueId, gameTypeId, playerId }],
        queryFn: () =>
            fetchGoalieWeeklyCards({
                seasonId,
                leagueId,
                gameTypeId,
                playerId: playerId as number,
            }) as Promise<CardResponse>,
        enabled: enabled !== false && !!playerId,
    });
}
