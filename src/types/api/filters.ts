/**
 * Filter options API types
 */

export interface FilterOption {
    id?: string | number;
    value?: string | number;
    label: string;
    name?: string;
}

export interface FilterOptions {
    seasons: FilterOption[];
    leagues: FilterOption[];
    positions: FilterOption[];
    gameTypes: FilterOption[];
}
