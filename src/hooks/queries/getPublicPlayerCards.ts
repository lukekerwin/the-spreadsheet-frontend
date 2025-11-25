'use client'

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { CardResponse } from '@/types/api';
import { fetchPublicPlayerCards } from '@/lib/api/public';

/**
 * Fetch public player cards
 * Returns first 24 Centers for Season 52, League 37 (NHL), Game Type 1
 * Does not require authentication
 */
export function usePublicPlayerCards(): UseQueryResult<CardResponse> {
    return useQuery<CardResponse>({
        queryKey: ['public', 'players'],
        queryFn: () => fetchPublicPlayerCards() as Promise<CardResponse>,
    });
}
