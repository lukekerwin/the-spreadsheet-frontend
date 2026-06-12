'use client';

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { ContractValuesResponse } from '@/types/api';
import { fetchContractValues } from '@/lib/api';

interface UseContractValuesParams {
    seasonId: number;
    leagueId: number;
    gameTypeId?: number;
    search?: string;
    posGroup?: string;
    rosteredOnly?: boolean;
    pageNumber?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    enabled?: boolean;
}

export function useContractValues({
    seasonId,
    leagueId,
    gameTypeId = 1,
    search,
    posGroup,
    rosteredOnly = false,
    pageNumber = 1,
    pageSize = 50,
    sortBy = 'surplus_value',
    sortOrder = 'desc',
    enabled = true,
}: UseContractValuesParams): UseQueryResult<ContractValuesResponse> {
    return useQuery<ContractValuesResponse>({
        queryKey: [
            'contractValues',
            {
                seasonId,
                leagueId,
                gameTypeId,
                search,
                posGroup,
                rosteredOnly,
                pageNumber,
                pageSize,
                sortBy,
                sortOrder,
            },
        ],
        queryFn: () =>
            fetchContractValues({
                seasonId,
                leagueId,
                gameTypeId,
                search,
                posGroup,
                rosteredOnly,
                pageNumber,
                pageSize,
                sortBy,
                sortOrder,
            }),
        enabled,
    });
}
