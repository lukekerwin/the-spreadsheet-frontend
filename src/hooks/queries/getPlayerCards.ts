'use client';

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { DEFAULT_SEASON_ID, DEFAULT_LEAGUE_ID, DEFAULT_GAME_TYPE_ID } from '@/constants/filters';
import type { CardResponse } from '@/types/api';
import { fetchPlayerCards } from '@/lib/api';

interface GetPlayerCardsQueryParams {
    seasonId?: number;
    leagueId?: number;
    gameTypeId?: number;
    posGroup?: string;
    playerId?: number | null;
    playerIds?: number[];
    pageNumber?: number;
    pageSize?: number;
    enabled?: boolean;
}

export function usePlayerCards({
    seasonId = DEFAULT_SEASON_ID,
    leagueId = DEFAULT_LEAGUE_ID,
    gameTypeId = DEFAULT_GAME_TYPE_ID,
    posGroup = 'C',
    playerId = null,
    playerIds,
    pageNumber = 1,
    pageSize = 24,
    enabled = true,
}: GetPlayerCardsQueryParams = {}): UseQueryResult<CardResponse> {
    return useQuery<CardResponse>({
        queryKey: ['players', { seasonId, leagueId, posGroup, gameTypeId, playerId, playerIds, pageNumber, pageSize }],
        queryFn: () =>
            fetchPlayerCards({
                seasonId,
                leagueId,
                posGroup,
                gameTypeId,
                playerId,
                playerIds,
                pageNumber,
                pageSize
            }) as Promise<CardResponse>,
        enabled,
    });
}