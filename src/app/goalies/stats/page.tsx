'use client';

/**
 * Goalie Stats Page
 * Comprehensive goalie statistics table with sortable columns, filtering, and pagination
 * Requires authentication
 */

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import type { GoalieStats } from '@/types/api';
import type { FiltersBarItem } from '@/components/shared/filters-bar/FiltersBar';
import type { MultiSelectAutocompleteOption } from '@/components/shared/multiselect-autocomplete/MultiSelectAutocomplete';
import { useAuth } from '@/providers/AuthProvider';
import PageHeader from '@/components/shared/header/PageHeader';
import SubNav from '@/components/shared/subnav/SubNav';
import FiltersBar from '@/components/shared/filters-bar/FiltersBar';
import Table from '@/components/shared/table/Table';
import Pagination from '@/components/shared/pagination/Pagination';
import TeamLogo from '@/components/shared/logo/TeamLogo';
import Legend from '@/components/shared/legend/Legend';
import ErrorState from '@/components/shared/error-state/ErrorState';
import { getLogoUrl } from '@/utils/logoUrl';
import { SEASONS, LEAGUES, GAME_TYPES, DEFAULT_SEASON_ID, DEFAULT_GAME_TYPE_ID } from '@/constants/filters';
import { useGoalieStats, useGoalieStatsTeams, useGoalieStatsNames } from '@/hooks/queries';

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
        title: 'Goalie Statistics',
        items: [
            { abbreviation: 'SH', fullName: 'Shots Against' },
            { abbreviation: 'xSH', fullName: 'Expected Shots Against' },
            { abbreviation: 'SH Prevented', fullName: 'Shots Prevented' },
            { abbreviation: 'GA', fullName: 'Goals Against' },
            { abbreviation: 'xGA', fullName: 'Expected Goals Against' },
            { abbreviation: 'GSAX', fullName: 'Goals Saved Above Expected' },
            { abbreviation: 'GSAA', fullName: 'Goals Saved Above Average' },
            { abbreviation: 'SO', fullName: 'Shutouts' },
        ]
    },
    {
        title: 'Rating Metrics',
        items: [
            { abbreviation: 'OVR', fullName: 'Overall Rating' },
            { abbreviation: 'TEAMMATES', fullName: 'Teammate Rating' },
            { abbreviation: 'SOS', fullName: 'Strength of Schedule' },
        ]
    }
];

export default function GoalieStatsPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

    // ============================================
    // STATE
    // ============================================
    // Filter state (initialize from dropdown defaults)
    const [seasonId, setSeasonId] = useState(DEFAULT_SEASON_ID);        // Current season (first in SEASONS constant)
    const [leagueId, setLeagueId] = useState(37);        // NHL (first in LEAGUES constant)
    const [gameTypeId, setGameTypeId] = useState(DEFAULT_GAME_TYPE_ID);  // Game type (1 = Regular, 2 = Playoffs)
    const [teamName, setTeamName] = useState<string | undefined>(undefined);  // Team filter
    const [selectedGoalies, setSelectedGoalies] = useState<MultiSelectAutocompleteOption[]>([]);  // Goalie search (multi-select)
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(50);

    // Sorting state
    const [sorting, setSorting] = useState<SortingState>([
        { id: 'overall_rating', desc: true }  // Default sort by overall rating
    ]);

    // Column visibility state (General is always visible, not in the list)
    const [visibleColumnGroups, setVisibleColumnGroups] = useState<(string | number)[]>([
        'goalie_stats', 'ratings'
    ]);

    // Derive sort parameters from sorting state
    const sortBy = sorting.length > 0 ? sorting[0].id : 'overall_rating';
    const sortOrder = sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : 'desc';

    // ============================================
    // DATA FETCHING with React Query
    // ============================================
    // Fetch available teams for the filter
    const { data: teamsData } = useGoalieStatsTeams({
        seasonId,
        leagueId,
    });

    // Fetch goalie names for autocomplete
    const { data: goalieNamesData } = useGoalieStatsNames({
        seasonId,
        leagueId,
        gameTypeId,
    });

    // Fetch goalie stats
    const { data: response, isLoading, error } = useGoalieStats({
        seasonId,
        leagueId,
        gameTypeId,
        playerIds: selectedGoalies.length > 0 ? selectedGoalies.map(g => Number(g.id)) : undefined,
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
    const allColumns = useMemo<ColumnDef<GoalieStats, unknown>[]>(
        () => [
            {
                id: 'general',
                header: 'GENERAL',
                columns: [
                    {
                        accessorKey: 'player_name',
                        header: 'GOALIE',
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
                                            G • {row.win}-{row.loss}-{row.otl}
                                        </div>
                                    </div>
                                </div>
                            );
                        },
                    },
                ],
            },
            {
                id: 'goalie_stats',
                header: 'GOALIE STATS',
                columns: [
                    {
                        accessorKey: 'shots_against',
                        header: 'SH',
                        size: 80,
                    },
                    {
                        id: 'xsh',
                        accessorKey: 'xSH',
                        header: 'xSH',
                        size: 80,
                        cell: (info) => (info.getValue() as number).toFixed(1),
                    },
                    {
                        accessorKey: 'shots_prevented',
                        header: 'SH Prevented',
                        size: 120,
                        cell: (info) => (info.getValue() as number).toFixed(1),
                    },
                    {
                        accessorKey: 'goals_against',
                        header: 'GA',
                        size: 80,
                    },
                    {
                        id: 'xga',
                        accessorKey: 'xGA',
                        header: 'xGA',
                        size: 80,
                        cell: (info) => (info.getValue() as number).toFixed(1),
                    },
                    {
                        id: 'gsax',
                        accessorKey: 'GSAX',
                        header: 'GSAX',
                        size: 80,
                        cell: (info) => (info.getValue() as number).toFixed(1),
                    },
                    {
                        id: 'gsaa',
                        accessorKey: 'GSAA',
                        header: 'GSAA',
                        size: 80,
                        cell: (info) => (info.getValue() as number).toFixed(1),
                    },
                    {
                        accessorKey: 'shutouts',
                        header: 'SO',
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
                        accessorKey: 'teammate_rating',
                        header: 'TEAMMATES',
                        size: 120,
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
                    },
                ],
            },
        ],
        []
    );

    // Filter columns based on visibility
    const columns = useMemo<ColumnDef<GoalieStats, unknown>[]>(() => {
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
        { label: 'Goalie Stats', value: 'goalie_stats' },
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
                    setSelectedGoalies([]); // Reset goalie search when season changes
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
                    setSelectedGoalies([]); // Reset goalie search when league changes
                    setPageNumber(1); // Reset to first page on filter change
                },
            },
            {
                label: 'Game Type',
                type: 'dropdown',
                data: GAME_TYPES,
                selectFirstByDefault: true,
                minWidth: '160px',
                onChange: (option) => {
                    setGameTypeId(option.value as number);
                    setTeamName(undefined); // Reset team filter when game type changes
                    setSelectedGoalies([]); // Reset goalie search when game type changes
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
                // Add key based on filters to force reset when they change
                key: `team-${seasonId}-${leagueId}-${gameTypeId}`,
            } as FiltersBarItem & { key: string },
            {
                label: 'Goalie Comparison',
                type: 'multiselect-autocomplete',
                data: goalieNamesData?.results || [],
                placeholder: 'Search goalies...',
                values: selectedGoalies,
                minWidth: '300px',
                maxSelections: 10,
                onChange: (options) => {
                    setSelectedGoalies(options);
                    setPageNumber(1); // Reset to first page on search
                },
                // Add key based on filters to force reset when filters change
                key: `goalie-search-${seasonId}-${leagueId}-${gameTypeId}`,
            } as FiltersBarItem & { key: string },
            {
                label: 'Columns',
                type: 'multiselect',
                data: COLUMN_OPTIONS,
                defaultValues: ['goalie_stats', 'ratings'],
                placeholder: 'Select columns...',
                minWidth: '180px',
                onChange: (selectedValues) => {
                    setVisibleColumnGroups(selectedValues);
                },
            }
        ],
    ], [seasonId, leagueId, gameTypeId, TEAMS, goalieNamesData, selectedGoalies]);

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
                    { label: 'Cards', href: '/goalies' },
                    { label: 'Stats', href: '/goalies/stats' },
                ]}
            />
            
            {/* Page Header */}
            <PageHeader
                title="GOALIE STATS"
                subtitle={`Last Updated: ${response?.lastUpdated ?? ""} · Refreshes ${user?.has_premium_access ? 'daily' : 'weekly'}`}
            />

            {/* Content */}
            <div className='content-container'>
                {/* Filters Bar */}
                <FiltersBar items={FILTERS_BAR_ITEMS} />

                {/* Loading State */}
                {isLoading && <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>}

                {/* Error State */}
                {error && (
                    <ErrorState error={error instanceof Error ? error : null} />
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
