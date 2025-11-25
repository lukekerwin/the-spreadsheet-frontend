'use client'

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { CardResponse } from '@/types/api';
import { fetchPublicGoalieCards } from '@/lib/api/public';

/**
 * Fetch public goalie cards
 * Returns first 24 goalies for Season 52, League 37 (NHL), Game Type 1
 * Does not require authentication
 */
export function usePublicGoalieCards(): UseQueryResult<CardResponse> {
    return useQuery<CardResponse>({
        queryKey: ['public', 'goalies'],
        queryFn: () => fetchPublicGoalieCards() as Promise<CardResponse>,
    });
}
