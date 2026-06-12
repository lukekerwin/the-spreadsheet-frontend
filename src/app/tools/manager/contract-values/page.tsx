'use client';

/**
 * Contract Values Tool (Manager Tools)
 * Compares actual contracts against GAR-based fair value.
 * Surplus = fair value - contract: positive means underpaid (good value).
 */

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import type { ContractValueData } from '@/types/api';
import type { FiltersBarItem } from '@/components/shared/filters-bar/FiltersBar';
import PageHeader from '@/components/shared/header/PageHeader';
import FiltersBar from '@/components/shared/filters-bar/FiltersBar';
import SubNav from '@/components/tools/ManagerSubNav';
import Table from '@/components/shared/table/Table';
import Pagination from '@/components/shared/pagination/Pagination';
import ErrorState from '@/components/shared/error-state/ErrorState';
import { useAuth } from '@/providers/AuthProvider';
import { useContractValues } from '@/hooks/queries';
import { Search, X } from 'lucide-react';

// ============================================
// CONSTANTS
// ============================================

const SEASON_OPTIONS = [
    { label: 'S53', value: 53 },
    { label: 'S52', value: 52 },
    { label: 'S51', value: 51 },
    { label: 'S50', value: 50 },
    { label: 'S49', value: 49 },
    { label: 'S48', value: 48 },
];

const LEAGUE_OPTIONS = [
    { label: 'NHL', value: 37 },
    { label: 'AHL', value: 38 },
    { label: 'CHL', value: 39 },
    { label: 'ECHL', value: 84 },
    { label: 'NCAA', value: 112 },
];

const POS_GROUP_OPTIONS = [
    { label: 'All Positions', value: 'all' },
    { label: 'Centers', value: 'C' },
    { label: 'Wingers', value: 'W' },
    { label: 'Defensemen', value: 'D' },
    { label: 'Goalies', value: 'G' },
];

const ROSTER_OPTIONS = [
    { label: 'Rostered Only', value: 'rostered' },
    { label: 'All Players', value: 'all' },
];

// ============================================
// HELPERS
// ============================================

const getRatingTier = (rating: number | null): string => {
    if (rating === null) return 'tier-unranked';
    if (rating >= 80) return 'tier-excellent';
    if (rating >= 60) return 'tier-good';
    if (rating >= 40) return 'tier-average';
    if (rating >= 20) return 'tier-below-average';
    return 'tier-poor';
};

const getPosGroupColor = (posGroup: string | null): string => {
    switch (posGroup) {
        case 'W': return 'bg-blue-600/50 text-blue-200';
        case 'C': return 'bg-red-600/50 text-red-200';
        case 'D': return 'bg-yellow-600/50 text-yellow-200';
        case 'G': return 'bg-purple-600/50 text-purple-200';
        default: return 'bg-gray-700/50 text-gray-200';
    }
};

const getContractTierColor = (tier: string | null): string => {
    switch (tier) {
        case 'Franchise': return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
        case 'Superstar': return 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
        case 'Star': return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
        case 'Starter': return 'bg-green-500/20 text-green-300 border border-green-500/30';
        case 'Solid': return 'bg-teal-500/20 text-teal-300 border border-teal-500/30';
        case 'Depth': return 'bg-gray-600/30 text-gray-300 border border-gray-600/40';
        default: return 'bg-gray-700/30 text-gray-400 border border-gray-700/40';
    }
};

const formatMillions = (value: number | null): string => {
    if (value === null || value === undefined) return '-';
    return `${(value / 1000000).toFixed(2)}M`;
};

const formatSurplus = (value: number | null): string => {
    if (value === null || value === undefined) return '-';
    const millions = (value / 1000000).toFixed(2);
    return value > 0 ? `+${millions}M` : `${millions}M`;
};

// ============================================
// COMPONENT
// ============================================

export default function ContractValuesPage() {
    const router = useRouter();
    const { user, isLoading: isAuthLoading } = useAuth();

    // Superusers always have access; backend exposes has_manager_tools for subscribers
    const hasManagerTools = (user?.has_manager_tools ?? false) || (user?.is_superuser ?? false);

    // ============================================
    // FILTER STATE
    // ============================================
    const [seasonId, setSeasonId] = useState<number>(53);
    const [leagueId, setLeagueId] = useState<number>(37);
    const [posGroup, setPosGroup] = useState<string | undefined>(undefined);
    const [rosteredOnly, setRosteredOnly] = useState<boolean>(true);
    const [searchInput, setSearchInput] = useState<string>('');
    const [search, setSearch] = useState<string>('');
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(50);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput);
            setPageNumber(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    // Sorting state
    const [sorting, setSorting] = useState<SortingState>([
        { id: 'surplus_value', desc: true }
    ]);

    const sortBy = sorting.length > 0 ? sorting[0].id : 'surplus_value';
    const sortOrder = sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : 'desc';

    // ============================================
    // ACCESS GATE
    // ============================================
    // Paywall lives on the hub page; redirect non-subscribers there
    useEffect(() => {
        if (!isAuthLoading && !hasManagerTools) {
            router.replace('/tools/manager');
        }
    }, [isAuthLoading, hasManagerTools, router]);

    // ============================================
    // DATA FETCHING
    // ============================================
    const { data: response, isLoading, error } = useContractValues({
        seasonId,
        leagueId,
        search: search || undefined,
        posGroup,
        rosteredOnly,
        pageNumber,
        pageSize,
        sortBy,
        sortOrder,
        enabled: hasManagerTools,
    });

    const data = response?.data || [];
    const totalPages = response?.totalPages || 1;

    // ============================================
    // HANDLERS
    // ============================================
    const goToPage = (page: number) => {
        const validPage = Math.max(1, Math.min(page, totalPages));
        setPageNumber(validPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ============================================
    // TABLE COLUMNS
    // ============================================
    const columns = useMemo<ColumnDef<ContractValueData, unknown>[]>(
        () => [
            {
                id: 'player_info',
                header: 'PLAYER INFO',
                columns: [
                    {
                        accessorKey: 'player_name',
                        header: 'PLAYER',
                        size: 180,
                        meta: { sticky: true },
                        cell: (info) => (
                            <span className='text-white'>{(info.getValue() as string) || 'Unknown'}</span>
                        ),
                    },
                    {
                        accessorKey: 'pos_group',
                        header: 'POS',
                        size: 60,
                        cell: (info) => {
                            const posGroupValue = info.getValue() as string | null;
                            if (!posGroupValue) return '-';
                            return (
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPosGroupColor(posGroupValue)}`}>
                                    {posGroupValue}
                                </span>
                            );
                        },
                    },
                    {
                        accessorKey: 'team_name',
                        header: 'TEAM',
                        size: 170,
                        cell: (info) => {
                            const row = info.row.original;
                            const teamName = info.getValue() as string | null;
                            if (!teamName) return <span className='text-gray-500'>Free Agent</span>;
                            return (
                                <div className='flex items-center gap-2'>
                                    <span
                                        className='inline-block w-2.5 h-2.5 rounded-full flex-shrink-0'
                                        style={{ backgroundColor: row.team_color || '#6b7280' }}
                                    />
                                    <span>{teamName}</span>
                                </div>
                            );
                        },
                    },
                    {
                        id: 'record',
                        header: 'REC',
                        size: 90,
                        enableSorting: false,
                        cell: (info) => {
                            const row = info.row.original;
                            if (row.wins === null) return '-';
                            return `${row.wins}-${row.losses}-${row.ot_losses}`;
                        },
                    },
                    {
                        accessorKey: 'points',
                        header: 'PTS',
                        size: 70,
                        cell: (info) => (info.getValue() as number | null) ?? '-',
                    },
                ],
            },
            {
                id: 'performance',
                header: 'PERFORMANCE',
                columns: [
                    {
                        accessorKey: 'total_gar',
                        header: 'GAR',
                        size: 80,
                        cell: (info) => {
                            const val = info.getValue() as number | null;
                            return val !== null ? Number(val).toFixed(1) : '-';
                        },
                    },
                    {
                        accessorKey: 'war_percentile',
                        header: 'WAR',
                        size: 80,
                        cell: (info) => {
                            const rawValue = info.getValue() as number | null;
                            if (rawValue === null) {
                                return <div className='rating-bg tier-unranked'>N/A</div>;
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
                        accessorKey: 'contract_tier',
                        header: 'TIER',
                        size: 110,
                        cell: (info) => {
                            const tier = info.getValue() as string | null;
                            if (!tier) return '-';
                            return (
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getContractTierColor(tier)}`}>
                                    {tier}
                                </span>
                            );
                        },
                    },
                ],
            },
            {
                id: 'contract_value',
                header: 'CONTRACT VALUE',
                columns: [
                    {
                        accessorKey: 'contract',
                        header: 'CTR',
                        size: 90,
                        cell: (info) => formatMillions(info.getValue() as number | null),
                    },
                    {
                        accessorKey: 'fair_contract',
                        header: 'FAIR VALUE',
                        size: 110,
                        cell: (info) => formatMillions(info.getValue() as number | null),
                    },
                    {
                        accessorKey: 'surplus_value',
                        header: 'SURPLUS',
                        size: 100,
                        cell: (info) => {
                            const val = info.getValue() as number | null;
                            if (val === null) return <span className='text-gray-500'>-</span>;
                            const colorClass = val > 0
                                ? 'text-green-400'
                                : val < 0
                                    ? 'text-red-400'
                                    : 'text-gray-300';
                            return <span className={`font-medium ${colorClass}`}>{formatSurplus(val)}</span>;
                        },
                    },
                ],
            },
        ],
        []
    );

    // ============================================
    // FILTERS BAR CONFIGURATION
    // ============================================
    const FILTERS_BAR_ITEMS: FiltersBarItem[][] = useMemo(() => [
        [
            {
                label: 'Season',
                type: 'dropdown',
                data: SEASON_OPTIONS,
                selectFirstByDefault: true,
                minWidth: '110px',
                onChange: (option) => {
                    setSeasonId(option.value as number);
                    setPageNumber(1);
                },
            },
            {
                label: 'League',
                type: 'dropdown',
                data: LEAGUE_OPTIONS,
                selectFirstByDefault: true,
                minWidth: '120px',
                onChange: (option) => {
                    setLeagueId(option.value as number);
                    setPageNumber(1);
                },
            },
            {
                label: 'Position',
                type: 'dropdown',
                data: POS_GROUP_OPTIONS,
                selectFirstByDefault: true,
                minWidth: '150px',
                onChange: (option) => {
                    setPosGroup(option.value === 'all' ? undefined : (option.value as string));
                    setPageNumber(1);
                },
            },
            {
                label: 'Roster Status',
                type: 'dropdown',
                data: ROSTER_OPTIONS,
                selectFirstByDefault: true,
                minWidth: '150px',
                onChange: (option) => {
                    setRosteredOnly(option.value === 'rostered');
                    setPageNumber(1);
                },
            },
        ],
    ], []);

    // ============================================
    // LOADING / ACCESS STATES
    // ============================================
    if (isAuthLoading || !hasManagerTools) {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <div className='text-center'>
                    <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4'></div>
                    <p className='text-gray-400'>Loading...</p>
                </div>
            </div>
        );
    }

    // ============================================
    // RENDER
    // ============================================
    return (
        <div className='page-container'>
            {/* Manager Tools Sub Navigation */}
            <SubNav />

            <PageHeader
                title="CONTRACT VALUES"
                subtitle={`Last Updated: ${response?.lastUpdated ? `${response.lastUpdated} EST` : ""}`}
            />
            <div className='content-container'>
                {/* Filters Bar */}
                <FiltersBar items={FILTERS_BAR_ITEMS} />

                {/* Search Row */}
                <div className='flex flex-col sm:flex-row gap-4 mt-4 mb-2'>
                    <div className='relative w-full sm:flex-1 sm:max-w-md'>
                        <Search size={18} className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500' />
                        <input
                            type='text'
                            placeholder='Search player name...'
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className='w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50'
                        />
                        {searchInput && (
                            <button
                                onClick={() => setSearchInput('')}
                                className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300'
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2'></div>
                        <p className='text-gray-400'>Loading contract values...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <ErrorState error={error instanceof Error ? error : null} />
                )}

                {/* Data Table */}
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

                        {/* Results count */}
                        <div className='text-center text-sm text-gray-500 mt-4'>
                            Showing {data.length} of {response?.total || 0} players
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
