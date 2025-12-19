/**
 * API types - Main export file
 * Re-exports all API response types for clean imports
 *
 * Usage:
 *   import type { PlayerCard, PlayersResponse } from '@/types/api';
 *   import type { GoalieCard, GoaliesResponse } from '@/types/api';
 *   import type { Team, TeamsResponse } from '@/types/api';
 */

// Search
export type { SearchResultItem, SearchResult } from './search';

// Filters
export type { FilterOption, FilterOptions } from './filters';

// Cards
export type { CardProps, CardResponse } from './cards'

// Player Stats
export type { PlayerStats, PlayerStatsResponse } from './player_stats';

// Goalie Stats
export type { GoalieStats, GoalieStatsResponse } from './goalie_stats';

// Bidding Package
export type { BiddingPackageData, BiddingPackageResponse, BiddingPackageFilters } from './biddingPackage';
