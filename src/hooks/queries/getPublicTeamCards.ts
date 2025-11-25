'use client'

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { CardResponse } from '@/types/api';
import { fetchPublicTeamCards } from '@/lib/api/public';

/**
 * Fetch public team cards
 * Returns first 24 teams for Season 52, League 37 (NHL), Game Type 1
 * Does not require authentication
 */
export function usePublicTeamCards(): UseQueryResult<CardResponse> {
    return useQuery<CardResponse>({
        queryKey: ['public', 'teams'],
        queryFn: () => fetchPublicTeamCards() as Promise<CardResponse>,
    });
}
