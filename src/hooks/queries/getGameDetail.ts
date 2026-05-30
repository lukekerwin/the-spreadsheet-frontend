'use client';

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { GameDetailResponse } from '@/types/api/games';
import { fetchGameDetail } from '@/lib/api/games';

export function useGameDetail(gameId: number, enabled = true): UseQueryResult<GameDetailResponse> {
    return useQuery<GameDetailResponse>({
        queryKey: ['game-detail', gameId],
        queryFn: () => fetchGameDetail(gameId),
        enabled: enabled && Number.isFinite(gameId),
    });
}
