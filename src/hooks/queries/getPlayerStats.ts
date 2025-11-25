'use client';

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { DEFAULT_SEASON_ID, DEFAULT_LEAGUE_ID, DEFAULT_GAME_TYPE_ID } from '@/constants/filters';
import type { PlayerStatsResponse } from '@/types/api';
import { fetchPlayerStats } from '@/lib/api';

interface GetPlayerStatsQueryParams {
    seasonId?: number;
    leagueId?: number;
    gameTypeId?: number;
    posGroup?: string;
    playerId?: number;
    playerIds?: number[];
    teamName?: string;
    pageNumber?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    enabled?: boolean;
}

export function usePlayerStats({
    seasonId = DEFAULT_SEASON_ID,
    leagueId = DEFAULT_LEAGUE_ID,
    gameTypeId = DEFAULT_GAME_TYPE_ID,
    posGroup = 'C',
    playerId,
    playerIds,
    teamName,
    pageNumber = 1,
    pageSize = 100,
    sortBy = 'overall_rating',
    sortOrder = 'desc',
    enabled = true,
}: GetPlayerStatsQueryParams = {}): UseQueryResult<PlayerStatsResponse> {
    return useQuery<PlayerStatsResponse>({
        queryKey: ['playerStats', {
            seasonId,
            leagueId,
            gameTypeId,
            posGroup,
            playerId,
            playerIds,
            teamName,
            pageNumber,
            pageSize,
            sortBy,
            sortOrder
        }],
        queryFn: () =>
            fetchPlayerStats({
                seasonId,
                leagueId,
                gameTypeId,
                posGroup,
                playerId,
                playerIds,
                teamName,
                pageNumber,
                pageSize,
                sortBy,
                sortOrder
            }) as Promise<PlayerStatsResponse>,
        enabled,
    });
}
