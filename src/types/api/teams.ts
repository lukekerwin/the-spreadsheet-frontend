/**
 * Team-related API types
 */

export type TeamTier = 'CONTENDER' | 'COMPETITIVE' | 'REBUILDING' | 'DEVELOPING';

export interface StatEntry {
    label: string;
    value: number;
}

export interface TeamBannerInfo {
    overallPercentile: number;
    tier: TeamTier;
    teamName: string;
}

export interface TeamHeader {
    teamName: string;
    wins: number;
    losses: number;
    otLosses: number;
    points: number;
}

export interface TeamCard {
    teamId: number;
    header: TeamHeader;
    banner: TeamBannerInfo;
    headerStats: StatEntry[];
    ratings: StatEntry[];
    stats: StatEntry[];
    teamColor: string;
}

/**
 * Teams API Response
 * 
 * Paginated response for team cards.
 * Uses camelCase following REST API conventions.
 */
export interface TeamsResponse {
    data: TeamCard[];
    pageNumber: number;
    pageSize: number;
    total: number;
    totalPages: number;
    lastUpdated: string;
}
