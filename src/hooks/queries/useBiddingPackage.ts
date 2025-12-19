'use client';

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { BiddingPackageResponse } from '@/types/api';
import { fetchBiddingPackageData } from '@/lib/api';

interface UseBiddingPackageParams {
    position?: string;
    server?: string;
    console?: string;
    showRostered?: boolean;
    lastSeasonId?: number;
    lastLeagueId?: number;
    pageNumber?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    enabled?: boolean;
}

export function useBiddingPackage({
    position,
    server,
    console,
    showRostered = true,
    lastSeasonId,
    lastLeagueId,
    pageNumber = 1,
    pageSize = 50,
    sortBy = 'war_percentile',
    sortOrder = 'desc',
    enabled = true,
}: UseBiddingPackageParams = {}): UseQueryResult<BiddingPackageResponse> {
    return useQuery<BiddingPackageResponse>({
        queryKey: [
            'biddingPackage',
            {
                position,
                server,
                console,
                showRostered,
                lastSeasonId,
                lastLeagueId,
                pageNumber,
                pageSize,
                sortBy,
                sortOrder,
            },
        ],
        queryFn: () =>
            fetchBiddingPackageData({
                position,
                server,
                console,
                showRostered,
                lastSeasonId,
                lastLeagueId,
                pageNumber,
                pageSize,
                sortBy,
                sortOrder,
            }),
        enabled,
    });
}
