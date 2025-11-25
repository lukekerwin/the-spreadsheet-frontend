// ============================================
// FILTER OPTIONS
// ============================================

export const SEASONS = [
    { label: 'Season 52', value: 52 },
    { label: 'Season 51', value: 51 },
    { label: 'Season 50', value: 50 },
    { label: 'Season 49', value: 49 },
    { label: 'Season 48', value: 48 },
    { label: 'Season 47', value: 47 },
    { label: 'Season 46', value: 46 },
] as const;

export const LEAGUES = [
    { label: 'NHL', value: 37 },
    { label: 'AHL', value: 38 },
    { label: 'ECHL', value: 84 },
    { label: 'CHL', value: 39 },
    { label: 'NCAA', value: 112 },
] as const;

export const POSITIONS = [
    { label: 'Centers', value: 'C' },
    { label: 'Wingers', value: 'W' },
    { label: 'Defensemen', value: 'D' },
] as const;

// ============================================
// DEFAULT API PARAMETERS
// ============================================

/**
 * Default season ID for API requests
 * Current season: 2024-25 (Season 52)
 */
export const DEFAULT_SEASON_ID = 52;

/**
 * Default league ID for API requests
 * NHL (League 37)
 */
export const DEFAULT_LEAGUE_ID = 37;

/**
 * Default game type ID for API requests
 * Regular season games
 */
export const DEFAULT_GAME_TYPE_ID = 1;

/**
 * Default pagination page size
 */
export const DEFAULT_CARD_PAGE_SIZE = 24;