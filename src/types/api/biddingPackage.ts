/**
 * Bidding Package API Types
 */

export interface BiddingPackageData {
    // Signup info
    signup_id: string;
    player_id: number;
    player_name: string | null;
    position: string;
    pos_group: string;
    status: string | null;
    server: string | null;
    console: string | null;
    signup_timestamp: string | null;

    // Roster status
    is_rostered: boolean;
    current_team_id: number | null;
    current_team_name: string | null;

    // Last season stats
    last_season_id: number | null;
    last_league_id: number | null;
    last_league_name: string | null;
    last_pos_group: string | null;
    games_played: number | null;
    wins: number | null;
    losses: number | null;
    ot_losses: number | null;
    points: number | null;

    // Ratings (0-1 scale, multiply by 100 for display)
    war_percentile: number | null;
    team_percentile: number | null;
    sos_percentile: number | null;
}

/**
 * Bidding Package API Response
 *
 * Paginated response for bidding package data.
 * Uses camelCase following REST API conventions.
 */
export interface BiddingPackageResponse {
    data: BiddingPackageData[];
    pageNumber: number;
    pageSize: number;
    total: number;
    totalPages: number;
    lastUpdated: string;
}

/**
 * Bidding Package Filter Parameters
 */
export interface BiddingPackageFilters {
    posGroup?: string;
    server?: string;
    console?: string;
    showRostered?: boolean;
    lastSeasonId?: number;
    lastLeagueId?: number;
    pageNumber?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
