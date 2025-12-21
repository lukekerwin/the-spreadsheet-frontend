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
    search?: string;
    position?: string;
    server?: string;
    console?: string;
    showRostered?: boolean;
    lastSeasonId?: number;
    lastLeagueId?: number;
    signupIds?: string[];
    pageNumber?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

/**
 * Player Season Stats - Historical data for one season
 */
export interface PlayerSeasonStats {
    // Season info
    season_id: number;
    league_id: number;
    league_name: string | null;
    game_type_id: number;
    pos_group: string;

    // Team info
    team_id: number | null;
    team_name: string | null;
    contract: number | null;

    // Record
    games_played: number | null;
    wins: number | null;
    losses: number | null;
    ot_losses: number | null;

    // Basic stats (skaters)
    points: number | null;
    goals: number | null;
    assists: number | null;
    plus_minus: number | null;

    // Advanced stats (skaters)
    toi: number | null;
    shots: number | null;
    hits: number | null;
    blocks: number | null;
    takeaways: number | null;
    interceptions: number | null;
    giveaways: number | null;
    pim: number | null;

    // Goalie stats
    shots_against: number | null;
    saves: number | null;
    goals_against: number | null;
    save_pct: number | null;
    gaa: number | null;
    shutouts: number | null;

    // Expected metrics (skaters)
    expected_goals: number | null;
    expected_assists: number | null;
    goals_above_expected: number | null;
    assists_above_expected: number | null;

    // GAR metrics (skaters)
    offensive_gar: number | null;
    defensive_gar: number | null;
    total_gar: number | null;

    // Goalie advanced metrics
    gsax: number | null;
    gsaa: number | null;

    // Ratings (0-1 scale)
    war_percentile: number | null;
    offense_percentile: number | null;
    defense_percentile: number | null;
    teammate_rating: number | null;
    opponent_rating: number | null;
    // Goalie-specific percentiles
    save_pct_percentile: number | null;
    gaa_percentile: number | null;
    gsax_percentile: number | null;
}

/**
 * Player Basic Info from signup
 */
export interface PlayerBasicInfo {
    player_id: number;
    player_name: string | null;
    position: string;
    pos_group: string;
    signup_id: string;
    status: string | null;
    server: string | null;
    console: string | null;
    signup_timestamp: string | null;
    is_rostered: boolean;
    current_team_id: number | null;
    current_team_name: string | null;
}

/**
 * Complete player detail response
 */
export interface BiddingPackagePlayerDetail {
    player: PlayerBasicInfo;
    seasons: PlayerSeasonStats[];
}
