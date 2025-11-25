/**
 * Goalie Statistics API Types
 */

export interface GoalieStats {
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

    // Goalie Stats
    shots_against: number;
    xSH: number;
    shots_prevented: number;
    goals_against: number;
    xGA: number;
    GSAX: number;
    GSAA: number;
    shutouts: number;

    // Ratings
    overall_rating: number | null;
    teammate_rating: number | null;
    opponent_rating: number | null;
}

/**
 * Goalie Stats API Response
 * 
 * Paginated response for goalie statistics.
 * Uses camelCase following REST API conventions.
 */
export interface GoalieStatsResponse {
    data: GoalieStats[];
    pageNumber: number;
    pageSize: number;
    total: number;
    totalPages: number;
    lastUpdated: string;
}
