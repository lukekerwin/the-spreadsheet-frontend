'use client'

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { DEFAULT_SEASON_ID, DEFAULT_LEAGUE_ID, DEFAULT_GAME_TYPE_ID } from '@/constants/filters';
import { fetchTeamSOSData } from '@/lib/api/teams';

export interface TeamSOSData {
    season_id: number;
    league_id: number;
    game_type_id: number;
    week_id: number;
    game_dow: number;
    team_id: number;
    team_name: string;
    win: number | null;
    loss: number | null;
    otl: number | null;
    teammate_win_pct: number | null;
    opponent_win_pct: number | null;
    teammate_rating: number | null;
    opponent_rating: number | null;
}

interface GetTeamSOSDataParams {
    seasonId?: number;
    leagueId?: number;
    gameTypeId?: number;
    weekId?: number;
    gameDow?: number;
    enabled?: boolean;
}

export function useTeamSOSData({
    seasonId = DEFAULT_SEASON_ID,
    leagueId = DEFAULT_LEAGUE_ID,
    gameTypeId = DEFAULT_GAME_TYPE_ID,
    weekId = 0,
    gameDow = -1,
    enabled = true,
}: GetTeamSOSDataParams = {}): UseQueryResult<TeamSOSData[]> {
    return useQuery<TeamSOSData[]>({
        queryKey: ['teamSOSData', { seasonId, leagueId, gameTypeId, weekId, gameDow }],
        queryFn: () =>
            fetchTeamSOSData({
                seasonId,
                leagueId,
                gameTypeId,
                weekId,
                gameDow,
            }) as Promise<TeamSOSData[]>,
        enabled,
    });
}
