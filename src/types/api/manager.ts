/**
 * Manager Tools API Types
 */

export interface ContractValueData {
    player_id: number;
    player_name: string | null;
    pos_group: string | null;
    team_name: string | null;
    team_color: string | null;
    wins: number | null;
    losses: number | null;
    ot_losses: number | null;
    goals: number | null;
    assists: number | null;
    points: number | null;
    contract: number | null;
    fair_contract: number | null;
    surplus_value: number | null;
    total_gar: number | null;
    gar_per_60: number | null;
    war_percentile: number | null;
    contract_tier: string | null;
    tier_rank: number | null;
    contract_rank: number | null;
    position_contract_rank: number | null;
    salary_cap: number | null;
}

export interface ContractValuesResponse {
    data: ContractValueData[];
    pageNumber: number;
    pageSize: number;
    total: number;
    totalPages: number;
    lastUpdated: string;
}

/**
 * Contract Values Filter Parameters
 */
export interface ContractValuesFilters {
    seasonId: number;
    leagueId: number;
    gameTypeId?: number;
    search?: string;
    posGroup?: string;
    rosteredOnly?: boolean;
    pageNumber?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
