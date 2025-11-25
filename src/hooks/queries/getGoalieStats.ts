'use client';

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { DEFAULT_SEASON_ID, DEFAULT_LEAGUE_ID, DEFAULT_GAME_TYPE_ID } from '@/constants/filters';
import type { GoalieStatsResponse } from '@/types/api';
import { fetchGoalieStats } from '@/lib/api';

interface GetGoalieStatsQueryParams {
    seasonId?: number;
    leagueId?: number;
    gameTypeId?: number;
    playerId?: number;
    playerIds?: number[];
    teamName?: string;
    pageNumber?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    enabled?: boolean;
}

export function useGoalieStats({
    seasonId = DEFAULT_SEASON_ID,
    leagueId = DEFAULT_LEAGUE_ID,
    gameTypeId = DEFAULT_GAME_TYPE_ID,
    playerId,
    playerIds,
    teamName,
    pageNumber = 1,
    pageSize = 50,
    sortBy = 'overall_rating',
    sortOrder = 'desc',
    enabled = true,
}: GetGoalieStatsQueryParams = {}): UseQueryResult<GoalieStatsResponse> {
    return useQuery<GoalieStatsResponse>({
        queryKey: ['goalieStats', {
            seasonId,
            leagueId,
            gameTypeId,
            playerId,
            playerIds,
            teamName,
            pageNumber,
            pageSize,
            sortBy,
            sortOrder
        }],
        queryFn: () =>
            fetchGoalieStats({
                seasonId,
                leagueId,
                gameTypeId,
                playerId,
                playerIds,
                teamName,
                pageNumber,
                pageSize,
                sortBy,
                sortOrder
            }) as Promise<GoalieStatsResponse>,
        enabled,
    });
}
