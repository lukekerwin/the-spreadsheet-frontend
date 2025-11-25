/**
 * Goalie-related API types
 */

export type GoalieTier = 'ELITE' | 'STAR' | 'CORE' | 'GAME_7' | 'STRONG' | 'SOLID' | 'DEPTH' | 'PROSPECT';

export interface StatEntry {
    label: string;
    value: number;
}

export interface GoalieBannerInfo {
    overallPercentile: number;
    tier: GoalieTier;
    teamName: string;
}

export interface GoalieHeader {
    playerName: string;
    posGroup: 'G';
    wins: number;
    losses: number;
    otLosses: number;
    contract: number;
}

export interface GoalieCard {
    header: GoalieHeader;
    banner: GoalieBannerInfo;
    headerStats: StatEntry[];
    ratings: StatEntry[];
    stats: StatEntry[];
    teamColor: string;
}

/**
 * Goalies API Response
 * 
 * Paginated response for goalie cards.
 * Uses camelCase following REST API conventions.
 */
export interface GoaliesResponse {
    data: GoalieCard[];
    pageNumber: number;
    pageSize: number;
    total: number;
    totalPages: number;
    lastUpdated: string;
}
