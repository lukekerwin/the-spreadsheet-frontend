/**
 * Player Statistics API Types
 */

export interface PlayerStats {
    // IDs (for filtering)
    season_id: number;
    league_id: number;
    game_type_id: number;
    player_id: number;
    pos_group: string;

    // General
    player_name: string;
    team_name: string;
    win: number;
    loss: number;
    otl: number;
    contract: number; // in millions

    // Offense
    points: number;
    goals: number;
    assists: number;
    plus_minus: number;
    xG: number;
    xA: number;
    GaX: number;
    AaX: number;
    iOFF: number; // percentage (0-100)
    off_gar: number; // Total Offense GAR

    // Defense
    interceptions: number;
    takeaways: number;
    blocks: number;
    iDEF: number; // percentage (0-100)
    def_gar: number; // Total Defense GAR

    // Ratings
    overall_rating: number;
    offense_rating: number;
    defense_rating: number;
    teammate_rating: number;
    opponent_rating: number;
}

/**
 * Player Stats API Response
 * 
 * Paginated response for player statistics.
 * Uses camelCase following REST API conventions.
 */
export interface PlayerStatsResponse {
    data: PlayerStats[];
    pageNumber: number;
    pageSize: number;
    total: number;
    totalPages: number;
    lastUpdated: string;
}
