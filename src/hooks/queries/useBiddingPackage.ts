'use client';

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { BiddingPackageResponse } from '@/types/api';
import { fetchBiddingPackageData } from '@/lib/api';

interface UseBiddingPackageParams {
    search?: string;
    positions?: string[];
    servers?: string[];
    consoles?: string[];
    showRostered?: boolean;
    lastSeasonIds?: number[];
    lastLeagueIds?: number[];
    signupIds?: string[];
    pageNumber?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    enabled?: boolean;
}

export function useBiddingPackage({
    search,
    positions,
    servers,
    consoles,
    showRostered = true,
    lastSeasonIds,
    lastLeagueIds,
    signupIds,
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
                search,
                positions,
                servers,
                consoles,
                showRostered,
                lastSeasonIds,
                lastLeagueIds,
                signupIds,
                pageNumber,
                pageSize,
                sortBy,
                sortOrder,
            },
        ],
        queryFn: () =>
            fetchBiddingPackageData({
                search,
                positions,
                servers,
                consoles,
                showRostered,
                lastSeasonIds,
                lastLeagueIds,
                signupIds,
                pageNumber,
                pageSize,
                sortBy,
                sortOrder,
            }),
        enabled,
    });
}
