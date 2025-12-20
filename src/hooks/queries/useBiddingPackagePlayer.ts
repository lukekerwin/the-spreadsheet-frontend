'use client';

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { BiddingPackagePlayerDetail } from '@/types/api';
import { fetchBiddingPackagePlayer } from '@/lib/api';

interface UseBiddingPackagePlayerParams {
    playerId: number;
    enabled?: boolean;
}

export function useBiddingPackagePlayer({
    playerId,
    enabled = true,
}: UseBiddingPackagePlayerParams): UseQueryResult<BiddingPackagePlayerDetail> {
    return useQuery<BiddingPackagePlayerDetail>({
        queryKey: ['biddingPackagePlayer', playerId],
        queryFn: () => fetchBiddingPackagePlayer(playerId),
        enabled: enabled && playerId > 0,
    });
}
