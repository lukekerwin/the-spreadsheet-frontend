'use client';

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { DEFAULT_SEASON_ID, DEFAULT_LEAGUE_ID, DEFAULT_GAME_TYPE_ID } from '@/constants/filters';
import type { CardResponse } from '@/types/api';
import { fetchGoalieCards } from '@/lib/api';

interface GetGoalieCardsQueryParams {
    seasonId?: number;
    leagueId?: number;
    gameTypeId?: number;
    playerId?: number | null;
    playerIds?: number[];
    pageNumber?: number;
    pageSize?: number;
    enabled?: boolean;
}

export function useGoalieCards({
    seasonId = DEFAULT_SEASON_ID,
    leagueId = DEFAULT_LEAGUE_ID,
    gameTypeId = DEFAULT_GAME_TYPE_ID,
    playerId = null,
    playerIds,
    pageNumber = 1,
    pageSize = 24,
    enabled = true,
}: GetGoalieCardsQueryParams = {}): UseQueryResult<CardResponse> {
    return useQuery<CardResponse>({
        queryKey: ['goalies', { seasonId, leagueId, gameTypeId, playerId, playerIds, pageNumber, pageSize }],
        queryFn: () =>
            fetchGoalieCards({
                seasonId,
                leagueId,
                gameTypeId,
                playerId,
                playerIds,
                pageNumber,
                pageSize
            }) as Promise<CardResponse>,
        enabled,
    });
}