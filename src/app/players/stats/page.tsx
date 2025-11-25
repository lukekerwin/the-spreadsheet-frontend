'use client';

/**
 * Player Stats Page
 * Comprehensive statistics table with sortable columns, filtering, and pagination
 * Requires authentication
 */

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import type { PlayerStats } from '@/types/api';
import type { FiltersBarItem } from '@/components/shared/filters-bar/FiltersBar';
import type { MultiSelectAutocompleteOption } from '@/components/shared/multiselect-autocomplete/MultiSelectAutocomplete';
import type { DropdownOption } from '@/components/shared/dropdown/Dropdown';
import { useAuth } from '@/providers/AuthProvider';
import PageHeader from '@/components/shared/header/PageHeader';
import SubNav from '@/components/shared/subnav/SubNav';
import FiltersBar from '@/components/shared/filters-bar/FiltersBar';
import Table from '@/components/shared/table/Table';
import Pagination from '@/components/shared/pagination/Pagination';
import TeamLogo from '@/components/shared/logo/TeamLogo';
import Legend from '@/components/shared/legend/Legend';
import { getLogoUrl } from '@/utils/logoUrl';
import { SEASONS, LEAGUES, POSITIONS } from '@/constants/filters';
import { usePlayerStats, usePlayerStatsTeams, usePlayerStatsNames } from '@/hooks/queries';

// ============================================
// HELPER: Get rating tier class
// ============================================
const getRatingTier = (rating: number | null): string => {
    if (rating === null) return 'tier-unranked';
    if (rating >= 80) return 'tier-excellent';
    if (rating >= 60) return 'tier-good';
    if (rating >= 40) return 'tier-average';
    if (rating >= 20) return 'tier-below-average';
    return 'tier-poor';
};

// ============================================
// LEGEND DATA
// ============================================
const STATS_LEGEND = [
    {
        title: 'Offensive Statistics',
        items: [
            { abbreviation: 'xG', fullName: 'Expected Goals' },
            { abbreviation: 'xA', fullName: 'Expected Assists' },
            { abbreviation: 'GaX', fullName: 'Goals above Expected' },
            { abbreviation: 'AaX', fullName: 'Assists above Expected' },
            { abbreviation: 'iOFF%', fullName: 'Individual Offense %' },
            { abbreviation: 'OFF', fullName: 'Offensive GAR' },
        ]
    },
    {
        title: 'Defensive Statistics',
        items: [
            { abbreviation: 'iDEF%', fullName: 'Individual Defense %' },
            { abbreviation: 'DEF', fullName: 'Defensive GAR' },
        ]
    },
    {
        title: 'Rating Metrics',
        items: [
            { abbreviation: 'OVR', fullName: 'Overall Rating' },
            { abbreviation: 'OFF', fullName: 'Offense Rating' },
            { abbreviation: 'DEF', fullName: 'Defense Rating' },
            { abbreviation: 'TEAM', fullName: 'Teammate Rating' },
            { abbreviation: 'SOS', fullName: 'Strength of Schedule' },
        ]
    }
];

export default function PlayerStatsPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

    // ============================================
    // STATE
    // ============================================
    // Filter state (initialize from dropdown defaults)
    const [seasonId, setSeasonId] = useState(52);        // Season 52 (first in SEASONS constant)
    const [leagueId, setLeagueId] = useState(37);        // NHL (first in LEAGUES constant)
    const [gameTypeId] = useState(1);                     // Regular season
    const [posGroup, setPosGroup] = useState('C');       // Centers (first in POSITIONS constant)
    const [teamName, setTeamName] = useState<string | undefined>(undefined);  // Team filter
    const [selectedPlayers, setSelectedPlayers] = useState<MultiSelectAutocompleteOption[]>([]);  // Player search (multi-select)
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(50);

    // Sorting state
    const [sorting, setSorting] = useState<SortingState>([
        { id: 'overall_rating', desc: true }  // Default sort by overall rating
    ]);

    // Column visibility state (General is always visible, not in the list)
    const [visibleColumnGroups, setVisibleColumnGroups] = useState<(string | number)[]>([
        'offense', 'defense', 'ratings'
    ]);

    // Derive sort parameters from sorting state
    const sortBy = sorting.length > 0 ? sorting[0].id : 'overall_rating';
    const sortOrder = sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : 'desc';

    // ============================================
    // DATA FETCHING with React Query
    // ============================================
    // Fetch available teams for the filter
    const { data: teamsData } = usePlayerStatsTeams({
        seasonId,
        leagueId,
    });

    // Fetch player names for autocomplete
    const { data: playerNamesData } = usePlayerStatsNames({
        seasonId,
        leagueId,
        gameTypeId,
        posGroup,
    });

    // Fetch player stats
    const { data: response, isLoading, error } = usePlayerStats({
        seasonId,
        leagueId,
        gameTypeId,
        posGroup,
        playerIds: selectedPlayers.length > 0 ? selectedPlayers.map(p => Number(p.id)) : undefined,
        teamName,
        pageNumber,
        pageSize,
        sortBy,
        sortOrder,
    });

    const data = response?.data || [];
    const totalPages = response?.totalPages || 1;

    // ============================================
    // PAGINATION HANDLER
    // ============================================
    const goToPage = (page: number) => {
        const validPage = Math.max(1, Math.min(page, totalPages));
        setPageNumber(validPage);
        // Scroll to top of table when changing pages
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ============================================
    // TABLE COLUMNS
    // ============================================
    const allColumns = useMemo<ColumnDef<PlayerStats, unknown>[]>(
        () => [
            {
                id: 'general',
                header: 'GENERAL',
                columns: [
                    {
                        accessorKey: 'player_name',
                        header: 'PLAYER',
                        size: 200,
                        meta: {
                            sticky: true, // Mark this column as sticky
                        },
                        cell: (info) => {
                            const row = info.row.original;
                            const logoUrl = getLogoUrl(row.team_name);
                            return (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <TeamLogo url={logoUrl} width={32} height={32} alt={row.team_name} />
                                    <div>
                                        <div>{info.getValue() as string}</div>
                                        <div style={{ fontSize: '0.8125rem', color: '#6b7280', marginTop: '0.1rem' }}>
                                            {row.pos_group} • {row.win}-{row.loss}-{row.otl}
                                        </div>
                                    </div>
                                </div>
                            );
                        },
                    },
                ],
            },
            {
                id: 'offense',
                header: 'OFFENSE',
                columns: [
                    {
                        accessorKey: 'points',
                        header: 'PTS',
                        size: 80,
                    },
                    {
                        accessorKey: 'goals',
                        header: 'G',
                        size: 80,
                    },
                    {
                        accessorKey: 'assists',
                        header: 'A',
                        size: 80,
                    },
                    {
                        accessorKey: 'plus_minus',
                        header: '+/-',
                        size: 80,
                    },
                    {
                        id: 'xg',
                        accessorKey: 'xG',
                        header: 'xG',
                        size: 80,
                    },
                    {
                        id: 'xa',
                        accessorKey: 'xA',
                        header: 'xA',
                        size: 80,
                    },
                    {
                        id: 'gax',
                        accessorKey: 'GaX',
                        header: 'GaX',
                        size: 80,
                    },
                    {
                        id: 'aax',
                        accessorKey: 'AaX',
                        header: 'AaX',
                        size: 80,
                    },
                    {
                        id: 'ioff',
                        accessorKey: 'iOFF',
                        header: 'iOFF%',
                        size: 80,
                        cell: (info) => `${(info.getValue() as number).toFixed(1)}%`,
                    },
                    {
                        accessorKey: 'off_gar',
                        header: 'OFF',
                        size: 80,
                    },
                ],
            },
            {
                id: 'defense',
                header: 'DEFENSE',
                columns: [
                    {
                        accessorKey: 'interceptions',
                        header: 'INT',
                        size: 80,
                    },
                    {
                        accessorKey: 'takeaways',
                        header: 'TK',
                        size: 80,
                    },
                    {
                        accessorKey: 'blocks',
                        header: 'BLK',
                        size: 80,
                    },
                    {
                        id: 'idef',
                        accessorKey: 'iDEF',
                        header: 'iDEF%',
                        size: 80,
                        cell: (info) => `${(info.getValue() as number).toFixed(1)}%`,
                    },
                    {
                        accessorKey: 'def_gar',
                        header: 'DEF',
                        size: 80,
                    },
                ],
            },
            {
                id: 'ratings',
                header: 'RATINGS',
                columns: [
                    {
                        accessorKey: 'overall_rating',
                        header: 'OVR',
                        size: 80,
                        cell: (info) => {
                            const rawValue = info.getValue() as number | null;
                            if (rawValue === null) {
                                return (
                                    <div className={`rating-bg tier-unranked`}>
                                        N/A
                                    </div>
                                );
                            }
                            const value = Math.round(rawValue * 100);
                            return (
                                <div className={`rating-bg ${getRatingTier(value)}`}>
                                    {value}
                                </div>
                            );
                        },
                    },
                    {
                        accessorKey: 'offense_rating',
                        header: 'OFF',
                        size: 80,
                        cell: (info) => {
                            const rawValue = info.getValue() as number | null;
                            if (rawValue === null) {
                                return (
                                    <div className={`rating-bg tier-unranked`}>
                                        N/A
                                    </div>
                                );
                            }
                            const value = Math.round(rawValue * 100);
                            return (
                                <div className={`rating-bg ${getRatingTier(value)}`}>
                                    {value}
                                </div>
                            );
                        },
                    },
                    {
                        accessorKey: 'defense_rating',
                        header: 'DEF',
                        size: 80,
                        cell: (info) => {
                            const rawValue = info.getValue() as number | null;
                            if (rawValue === null) {
                                return (
                                    <div className={`rating-bg tier-unranked`}>
                                        N/A
                                    </div>
                                );
                            }
                            const value = Math.round(rawValue * 100);
                            return (
                                <div className={`rating-bg ${getRatingTier(value)}`}>
                                    {value}
                                </div>
                            );
                        },
                    },
                    {
                        accessorKey: 'teammate_rating',
                        header: 'TEAM',
                        size: 100,
                        cell: (info) => {
                            const rawValue = info.getValue() as number | null;
                            if (rawValue === null) {
                                return (
                                    <div className={`rating-bg tier-unranked`}>
                                        N/A
                                    </div>
                                );
                            }
                            const value = Math.round(rawValue * 100);
                            return (
                                <div className={`rating-bg ${getRatingTier(value)}`}>
                                    {value}
                                </div>
                            );
                        },
                    },
                    {
                        accessorKey: 'opponent_rating',
                        header: 'SOS',
                        size: 100,
                        cell: (info) => {
                            const rawValue = info.getValue() as number | null;
                            if (rawValue === null) {
                                return (
                                    <div className={`rating-bg tier-unranked`}>
                                        N/A
                                    </div>
                                );
                            }
                            const value = Math.round(rawValue * 100);
                            return (
                                <div className={`rating-bg ${getRatingTier(value)}`}>
                                    {value}
                                </div>
                            );
                        },
                    }
                ],
            },
        ],
        []
    );

    // Filter columns based on visibility
    const columns = useMemo<ColumnDef<PlayerStats, unknown>[]>(() => {
        // Always show General column, plus selected column groups
        return allColumns.filter(columnGroup => {
            // Always include General
            if (columnGroup.id === 'general') {
                return true;
            }
            // Show all other columns if none are selected
            if (visibleColumnGroups.length === 0) {
                return true;
            }
            // Otherwise show only selected column groups
            return visibleColumnGroups.includes(columnGroup.id as string);
        });
    }, [allColumns, visibleColumnGroups]);

    // ============================================
    // FILTERS BAR CONFIGURATION
    // ============================================
    // Transform teams data for dropdown
    const TEAMS = useMemo(() => {
        const teams = [{ label: 'All Teams', value: '' }];
        if (teamsData) {
            teams.push(
                ...teamsData
                    .map(team => ({
                        label: team.team_name,
                        value: team.team_name,
                    }))
                    .sort((a, b) => a.label.localeCompare(b.label))
            );
        }
        return teams;
    }, [teamsData]);

    const COLUMN_OPTIONS = [
        { label: 'Offense', value: 'offense' },
        { label: 'Defense', value: 'defense' },
        { label: 'Ratings', value: 'ratings' },
    ];

    const FILTERS_BAR_ITEMS: FiltersBarItem[][] = useMemo(() => [
        // Row 1: Main filters
        [
            {
                label: 'Season',
                type: 'dropdown',
                data: SEASONS,
                selectFirstByDefault: true,
                minWidth: '150px',
                onChange: (option) => {
                    setSeasonId(option.value as number);
                    setTeamName(undefined); // Reset team filter when season changes
                    setSelectedPlayers([]); // Reset player search when season changes
                    setPageNumber(1); // Reset to first page on filter change
                },
            },
            {
                label: 'League',
                type: 'dropdown',
                data: LEAGUES,
                selectFirstByDefault: true,
                minWidth: '120px',
                onChange: (option) => {
                    setLeagueId(option.value as number);
                    setTeamName(undefined); // Reset team filter when league changes
                    setSelectedPlayers([]); // Reset player search when league changes
                    setPageNumber(1); // Reset to first page on filter change
                },
            },
            {
                label: 'Team',
                type: 'dropdown',
                data: TEAMS,
                selectFirstByDefault: true,
                minWidth: '180px',
                onChange: (option) => {
                    setTeamName(option.value === '' ? undefined : option.value as string);
                    setPageNumber(1); // Reset to first page on filter change
                },
                // Add key based on seasonId and leagueId to force reset when they change
                key: `team-${seasonId}-${leagueId}`,
            } as FiltersBarItem & { key: string },
            {
                label: 'Position',
                type: 'dropdown',
                data: POSITIONS,
                selectFirstByDefault: true,
                minWidth: '140px',
                onChange: (option) => {
                    setPosGroup(option.value as string);
                    setSelectedPlayers([]); // Reset player search when position changes
                    setPageNumber(1); // Reset to first page on filter change
                },
            },
            {
                label: 'Player Comparison',
                type: 'multiselect-autocomplete',
                data: playerNamesData?.results || [],
                placeholder: 'Search players...',
                values: selectedPlayers,
                minWidth: '300px',
                maxSelections: 10,
                onChange: (options) => {
                    setSelectedPlayers(options);
                    setPageNumber(1); // Reset to first page on search
                },
                // Add key based on filters to force reset when filters change
                key: `player-search-${seasonId}-${leagueId}-${posGroup}`,
            } as FiltersBarItem & { key: string },
            {
                label: 'Columns',
                type: 'multiselect',
                data: COLUMN_OPTIONS,
                defaultValues: ['offense', 'defense', 'ratings'],
                placeholder: 'Select columns...',
                minWidth: '180px',
                onChange: (selectedValues) => {
                    setVisibleColumnGroups(selectedValues);
                },
            }
        ],
    ], [seasonId, leagueId, posGroup, TEAMS, playerNamesData, selectedPlayers]);

    // ============================================
    // AUTHENTICATION ENFORCEMENT
    // ============================================
    useEffect(() => {
        if (!isAuthLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, isAuthLoading, router]);

    // Show loading state while checking auth
    if (isAuthLoading) {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <div className='text-center'>
                    <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4'></div>
                    <p className='text-gray-400'>Loading...</p>
                </div>
            </div>
        );
    }

    // Don't render anything if not authenticated (will redirect)
    if (!isAuthenticated) {
        return null;
    }

    // ============================================
    // RENDER
    // ============================================
    return (
        <div className='page-container'>
            {/* Sub Navigation */}
            <SubNav
                items={[
                    { label: 'Cards', href: '/players' },
                    { label: 'Stats', href: '/players/stats' },
                ]}
            />
            
            {/* Page Header */}
            <PageHeader
                title="PLAYER STATS"
                subtitle={`Last Updated: ${response?.lastUpdated ?? ""}`}
            />

            {/* Content */}
            <div className='content-container'>
                {/* Filters Bar */}
                <FiltersBar items={FILTERS_BAR_ITEMS} />

                {/* Loading State */}
                {isLoading && <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>}

                {/* Error State */}
                {error && (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#f87171' }}>
                        Error: {error instanceof Error ? error.message : 'Failed to load stats'}
                    </div>
                )}

                {/* Stats Table */}
                {!isLoading && !error && (
                    <>
                        <Table
                            data={data}
                            columns={columns}
                            sorting={sorting}
                            onSortingChange={setSorting}
                            enableSorting={true}
                        />

                        {/* Pagination Controls */}
                        <Pagination
                            currentPage={pageNumber}
                            totalPages={totalPages}
                            onPageChange={goToPage}
                        />

                        {/* Statistics Legend */}
                        <Legend sections={STATS_LEGEND} />
                    </>
                )}
            </div>
        </div>
    );
}
