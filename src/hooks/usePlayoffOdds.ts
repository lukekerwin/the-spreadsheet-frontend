import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/utils/api';

// ============================================
// TYPES
// ============================================

export interface PlayoffOdds {
    season_id: number;
    league_id: number;
    team_id: number;
    full_team_name: string;
    team_name: string;
    conference_id: number | null;
    points: number;
    wins: number;
    losses: number;
    ot_losses: number;
    games_remaining: number;
    playoff_odds: number;
    seed_probabilities?: { [key: string]: number }; // Flexible seeds (for leagues with >8 playoff teams)
    seed_1_prob: number;
    seed_2_prob: number;
    seed_3_prob: number;
    seed_4_prob: number;
    seed_5_prob: number;
    seed_6_prob: number;
    seed_7_prob: number;
    seed_8_prob: number;
    num_simulations: number;
    last_updated: string;
}

interface UsePlayoffOddsParams {
    seasonId: number;
    leagueId: number;
    enabled?: boolean;
}

// ============================================
// HOOK
// ============================================

export function usePlayoffOdds({ seasonId, leagueId, enabled = true }: UsePlayoffOddsParams) {
    return useQuery<PlayoffOdds[]>({
        queryKey: ['playoff-odds', seasonId, leagueId],
        queryFn: () => apiClient.get<PlayoffOdds[]>(`/playoff-odds/data?season_id=${seasonId}&league_id=${leagueId}`),
        enabled,
        staleTime: 1000 * 60 * 60, // Data is fresh for 1 hour
        refetchOnWindowFocus: false,
    });
}
