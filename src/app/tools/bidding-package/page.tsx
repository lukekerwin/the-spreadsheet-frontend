'use client';

/**
 * Bidding Package Tool
 * One-time purchase tool displaying player signups with historical stats and analytics
 */

import { useMemo, useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import type { BiddingPackageData } from '@/types/api';
import type { FiltersBarItem } from '@/components/shared/filters-bar/FiltersBar';
import PageHeader from '@/components/shared/header/PageHeader';
import FiltersBar from '@/components/shared/filters-bar/FiltersBar';
import Table from '@/components/shared/table/Table';
import Pagination from '@/components/shared/pagination/Pagination';
import ErrorState from '@/components/shared/error-state/ErrorState';
import { useAuth } from '@/providers/AuthProvider';
import { useBiddingPackage } from '@/hooks/queries';
import { purchaseBiddingPackage } from '@/lib/api/subscription';
import { Gavel, CheckCircle, ExternalLink, Check, X, ShoppingCart, Heart, Search } from 'lucide-react';
import { getFavorites, toggleFavorite } from '@/lib/api/favorites';

// ============================================
// CONSTANTS
// ============================================

const POS_GROUP_OPTIONS = [
    { label: 'All Positions', value: '' },
    { label: 'LW', value: 'LW' },
    { label: 'C', value: 'C' },
    { label: 'RW', value: 'RW' },
    { label: 'LD', value: 'LD' },
    { label: 'RD', value: 'RD' },
    { label: 'G', value: 'G' },
];

const SERVER_OPTIONS = [
    { label: 'All Servers', value: '' },
    { label: 'East', value: 'East' },
    { label: 'Central', value: 'Central' },
    { label: 'West', value: 'West' },
];

const CONSOLE_OPTIONS = [
    { label: 'All Consoles', value: '' },
    { label: 'PlayStation', value: 'PS5' },
    { label: 'Xbox', value: 'Xbox Series X|S' },
];

const ROSTER_OPTIONS = [
    { label: 'All Players', value: 'all' },
    { label: 'Bidding Eligible', value: 'free' },
];

const SEASON_OPTIONS = [
    { label: 'All Seasons', value: '' },
    { label: 'S52', value: '52' },
    { label: 'S51', value: '51' },
    { label: 'S50', value: '50' },
    { label: 'S49', value: '49' },
    { label: 'S48', value: '48' },
];

const LEAGUE_OPTIONS = [
    { label: 'All Leagues', value: '' },
    { label: 'NHL', value: '37' },
    { label: 'AHL', value: '38' },
    { label: 'CHL', value: '39' },
    { label: 'ECHL', value: '84' },
    { label: 'NCAA', value: '112' },
];

const FEATURES = [
    'View all player signups with historical performance data',
    'WAR, TEAM, and SOS percentile ratings for each player',
    'Last season stats including record and points',
    'Filter by position, server, console, and roster status',
    'Sortable columns for easy comparison',
    'External links to League Gaming profiles',
] as const;

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

const getPositionColor = (position: string | null): string => {
    switch (position) {
        case 'LW': return 'bg-green-600/50 text-green-200';
        case 'C': return 'bg-red-600/50 text-red-200';
        case 'RW': return 'bg-blue-600/50 text-blue-200';
        case 'LD': return 'bg-teal-600/50 text-teal-200';
        case 'RD': return 'bg-yellow-600/50 text-yellow-200';
        case 'G': return 'bg-purple-600/50 text-purple-200';
        default: return 'bg-gray-700/50 text-gray-200';
    }
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

const getLgProfileUrl = (playerId: number): string => {
    return `https://leaguegaming.com/forums/index.php?members/${playerId}/`;
};

// ============================================
// COMPONENT
// ============================================

function BiddingPackageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, isAuthenticated, isLoading: isAuthLoading, openAuthModal, refreshUser } = useAuth();
    const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
    const [purchaseMessage, setPurchaseMessage] = useState<string | null>(null);

    // Favorites state
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [isFavoritesLoading, setIsFavoritesLoading] = useState(false);

    // Check if user has purchased the bidding package
    const hasBiddingPackage = user?.has_bidding_package ?? false;

    // Handle purchase success/cancel from Stripe redirect
    useEffect(() => {
        const purchase = searchParams.get('purchase');
        if (purchase === 'success') {
            setPurchaseMessage('Purchase successful! You now have access to the Bidding Package.');
            refreshUser();
            router.replace('/tools/bidding-package');
        } else if (purchase === 'canceled') {
            setPurchaseMessage('Purchase was canceled.');
            router.replace('/tools/bidding-package');
        }
    }, [searchParams, refreshUser, router]);

    // Clear message after 5 seconds
    useEffect(() => {
        if (purchaseMessage) {
            const timer = setTimeout(() => setPurchaseMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [purchaseMessage]);

    // Fetch favorites when user has bidding package
    useEffect(() => {
        if (hasBiddingPackage && isAuthenticated) {
            setIsFavoritesLoading(true);
            getFavorites()
                .then((favs) => setFavorites(new Set(favs)))
                .catch(console.error)
                .finally(() => setIsFavoritesLoading(false));
        }
    }, [hasBiddingPackage, isAuthenticated]);

    // ============================================
    // FILTER STATE
    // ============================================
    const [searchInput, setSearchInput] = useState<string>('');
    const [search, setSearch] = useState<string>('');
    const [position, setPosition] = useState<string>('');
    const [server, setServer] = useState<string>('');
    const [consoleFilter, setConsoleFilter] = useState<string>('');
    const [showRostered, setShowRostered] = useState<boolean>(true);
    const [lastSeasonId, setLastSeasonId] = useState<number | undefined>(undefined);
    const [lastLeagueId, setLastLeagueId] = useState<number | undefined>(undefined);
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
        { id: 'war_percentile', desc: true }
    ]);

    const sortBy = sorting.length > 0 ? sorting[0].id : 'war_percentile';
    const sortOrder = sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : 'desc';

    // ============================================
    // DATA FETCHING
    // ============================================
    const { data: response, isLoading, error } = useBiddingPackage({
        search: search || undefined,
        position: position || undefined,
        server: server || undefined,
        console: consoleFilter || undefined,
        showRostered,
        lastSeasonId,
        lastLeagueId,
        pageNumber,
        pageSize,
        sortBy,
        sortOrder,
        enabled: hasBiddingPackage,
    });

    const data = response?.data || [];
    const totalPages = response?.totalPages || 1;

    // ============================================
    // HANDLERS
    // ============================================
    const handlePurchase = async () => {
        if (!isAuthenticated) {
            openAuthModal(() => handlePurchase());
            return;
        }

        setIsCheckoutLoading(true);
        try {
            const checkoutUrl = await purchaseBiddingPackage();
            window.location.href = checkoutUrl;
        } catch (error) {
            console.error('Failed to create checkout session:', error);
            setPurchaseMessage('Failed to start checkout. Please try again.');
        } finally {
            setIsCheckoutLoading(false);
        }
    };

    const handleBackToTools = () => {
        router.push('/tools');
    };

    const handleToggleFavorite = async (signupId: string) => {
        if (!isAuthenticated) {
            openAuthModal();
            return;
        }

        const isFavorite = favorites.has(signupId);

        // Optimistic update
        setFavorites((prev) => {
            const next = new Set(prev);
            if (isFavorite) {
                next.delete(signupId);
            } else {
                next.add(signupId);
            }
            return next;
        });

        try {
            await toggleFavorite(signupId, isFavorite);
        } catch (error) {
            // Revert on error
            setFavorites((prev) => {
                const next = new Set(prev);
                if (isFavorite) {
                    next.add(signupId);
                } else {
                    next.delete(signupId);
                }
                return next;
            });
            console.error('Failed to toggle favorite:', error);
        }
    };

    const goToPage = (page: number) => {
        const validPage = Math.max(1, Math.min(page, totalPages));
        setPageNumber(validPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ============================================
    // TABLE COLUMNS
    // ============================================
    const columns = useMemo<ColumnDef<BiddingPackageData, unknown>[]>(
        () => [
            {
                id: 'signup_info',
                header: 'SIGN UP INFO',
                columns: [
                    {
                        id: 'favorite',
                        header: '',
                        size: 40,
                        enableSorting: false,
                        cell: (info) => {
                            const signupId = info.row.original.signup_id;
                            const isFavorite = favorites.has(signupId);
                            return (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleFavorite(signupId);
                                    }}
                                    className="p-1 hover:bg-gray-700/50 rounded transition-colors"
                                    title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                                >
                                    <Heart
                                        size={16}
                                        className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-500 hover:text-red-400'}
                                    />
                                </button>
                            );
                        },
                    },
                    {
                        accessorKey: 'player_name',
                        header: 'PLAYER',
                        size: 180,
                        meta: { sticky: true },
                        cell: (info) => {
                            const row = info.row.original;
                            return (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <a
                                        href={getLgProfileUrl(row.player_id)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 hover:text-blue-300"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <ExternalLink size={14} />
                                    </a>
                                    <span>{info.getValue() as string || 'Unknown'}</span>
                                </div>
                            );
                        },
                    },
                    {
                        accessorKey: 'position',
                        header: 'POS',
                        size: 70,
                        cell: (info) => {
                            const position = info.getValue() as string;
                            return (
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPositionColor(position)}`}>
                                    {position}
                                </span>
                            );
                        },
                    },
                    {
                        accessorKey: 'status',
                        header: 'STATUS',
                        size: 100,
                        cell: (info) => {
                            const status = info.getValue() as string | null;
                            return status || '-';
                        },
                    },
                    {
                        accessorKey: 'server',
                        header: 'SERVER',
                        size: 80,
                    },
                    {
                        accessorKey: 'console',
                        header: 'CONSOLE',
                        size: 140,
                        cell: (info) => {
                            const val = info.getValue() as string | null;
                            if (val === 'PS5') return 'PS';
                            if (val === 'Xbox Series X|S') return 'Xbox';
                            return val || '-';
                        },
                    },
                    {
                        accessorKey: 'is_rostered',
                        header: 'ROSTER',
                        size: 80,
                        cell: (info) => {
                            const isRostered = info.getValue() as boolean;
                            return isRostered ? (
                                <Check size={16} className="text-green-400" />
                            ) : (
                                <X size={16} className="text-gray-500" />
                            );
                        },
                    },
                ],
            },
            {
                id: 'last_season',
                header: 'LAST SEASON',
                columns: [
                    {
                        accessorKey: 'last_season_id',
                        header: 'SEASON',
                        size: 80,
                        cell: (info) => {
                            const val = info.getValue() as number | null;
                            return val ? `S${val}` : '-';
                        },
                    },
                    {
                        accessorKey: 'last_league_name',
                        header: 'LEAGUE',
                        size: 100,
                        cell: (info) => {
                            const val = info.getValue() as string | null;
                            if (!val) return '-';
                            // Map LG league names to standard names
                            const leagueMap: Record<string, string> = {
                                'LGHL': 'NHL',
                                'LGAHL': 'AHL',
                                'LGCHL': 'CHL',
                                'LGECHL': 'ECHL',
                                'LGNCAA': 'NCAA',
                            };
                            const short = leagueMap[val] || val;
                            return (
                                <span className="px-2 py-0.5 bg-gray-700/50 rounded text-xs font-medium">
                                    {short}
                                </span>
                            );
                        },
                    },
                    {
                        accessorKey: 'last_pos_group',
                        header: 'POS',
                        size: 60,
                        cell: (info) => {
                            const posGroup = info.getValue() as string | null;
                            if (!posGroup) return '-';
                            return (
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPosGroupColor(posGroup)}`}>
                                    {posGroup}
                                </span>
                            );
                        },
                    },
                    {
                        id: 'record',
                        header: 'REC',
                        size: 90,
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
                        cell: (info) => {
                            const val = info.getValue() as number | null;
                            return val ?? '-';
                        },
                    },
                ],
            },
            {
                id: 'analytics',
                header: 'ANALYTICS',
                columns: [
                    {
                        accessorKey: 'war_percentile',
                        header: 'WAR',
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
                        accessorKey: 'team_percentile',
                        header: 'TEAM',
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
                        accessorKey: 'sos_percentile',
                        header: 'SOS',
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
                ],
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [favorites]
    );

    // ============================================
    // FILTERS BAR CONFIGURATION
    // ============================================
    const FILTERS_BAR_ITEMS: FiltersBarItem[][] = useMemo(() => [
        [
            {
                label: 'Position',
                type: 'dropdown',
                data: POS_GROUP_OPTIONS,
                selectFirstByDefault: true,
                minWidth: '150px',
                onChange: (option) => {
                    setPosition(option.value as string);
                    setPageNumber(1);
                },
            },
            {
                label: 'Server',
                type: 'dropdown',
                data: SERVER_OPTIONS,
                selectFirstByDefault: true,
                minWidth: '130px',
                onChange: (option) => {
                    setServer(option.value as string);
                    setPageNumber(1);
                },
            },
            {
                label: 'Console',
                type: 'dropdown',
                data: CONSOLE_OPTIONS,
                selectFirstByDefault: true,
                minWidth: '140px',
                onChange: (option) => {
                    setConsoleFilter(option.value as string);
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
                    setShowRostered(option.value === 'all');
                    setPageNumber(1);
                },
            },
            {
                label: 'Last Season',
                type: 'dropdown',
                data: SEASON_OPTIONS,
                selectFirstByDefault: true,
                minWidth: '130px',
                onChange: (option) => {
                    const value = option.value as string;
                    setLastSeasonId(value ? parseInt(value, 10) : undefined);
                    setPageNumber(1);
                },
            },
            {
                label: 'Last League',
                type: 'dropdown',
                data: LEAGUE_OPTIONS,
                selectFirstByDefault: true,
                minWidth: '130px',
                onChange: (option) => {
                    const value = option.value as string;
                    setLastLeagueId(value ? parseInt(value, 10) : undefined);
                    setPageNumber(1);
                },
            },
        ],
    ], []);

    // Filter data by favorites if enabled (must be before any early returns)
    const displayData = useMemo(() => {
        if (!showFavoritesOnly) return data;
        return data.filter((row) => favorites.has(row.signup_id));
    }, [data, showFavoritesOnly, favorites]);

    // ============================================
    // LOADING STATE
    // ============================================
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

    // ============================================
    // RENDER - PAYWALL (Users without Bidding Package)
    // ============================================
    if (!hasBiddingPackage) {
        return (
            <div className='page-container'>
                <PageHeader title="BIDDING PACKAGE" />
                <div className='content-container'>
                    {/* Back Button */}
                    <button
                        onClick={handleBackToTools}
                        className='flex items-center gap-2 text-gray-400 hover:text-gray-200 transition-colors mb-6'
                    >
                    </button>

                    {/* Purchase Message */}
                    {purchaseMessage && (
                        <div className={`max-w-2xl mx-auto mb-6 p-4 rounded-lg ${purchaseMessage.includes('successful') ? 'bg-green-500/20 text-green-300' : 'bg-gray-700/50 text-gray-300'}`}>
                            {purchaseMessage}
                        </div>
                    )}

                    {/* Paywall Content */}
                    <div className='max-w-2xl mx-auto'>
                        {/* Header */}
                        <div className='flex flex-col items-center text-center mb-8'>
                            <div className='flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400/20 to-yellow-400/20 rounded-2xl mb-6'>
                                <Gavel size={40} className='text-amber-400' />
                            </div>
                            <h2 className='text-3xl font-bold text-gray-100 font-rajdhani mb-3'>
                                Bidding Package
                            </h2>
                            <div className='flex items-center gap-2 mb-4'>
                                <ShoppingCart size={16} className='text-amber-400' />
                                <span className='text-amber-400 font-semibold'>One-Time Purchase</span>
                            </div>
                            <p className='text-gray-400 max-w-lg'>
                                Access comprehensive player signup data with historical stats,
                                WAR ratings, and team analytics to make informed bidding decisions.
                            </p>
                        </div>

                        {/* Features List */}
                        <div className='bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 mb-8'>
                            <h3 className='text-lg font-semibold text-gray-100 mb-4'>What&apos;s Included</h3>
                            <ul className='space-y-3'>
                                {FEATURES.map((feature, index) => (
                                    <li key={index} className='flex items-start gap-3'>
                                        <CheckCircle size={18} className='text-green-400 mt-0.5 flex-shrink-0' />
                                        <span className='text-gray-300'>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* CTA */}
                        <div className='flex flex-col items-center'>
                            <button
                                onClick={handlePurchase}
                                disabled={isCheckoutLoading}
                                className='flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-gray-900 font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
                            >
                                <ShoppingCart size={20} />
                                <span>{isCheckoutLoading ? 'Loading...' : 'Purchase Now'}</span>
                            </button>
                            <p className='text-sm text-gray-500 mt-4'>
                                {isAuthenticated
                                    ? 'One-time purchase'
                                    : 'Sign in to purchase'
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ============================================
    // RENDER - PREMIUM CONTENT
    // ============================================
    return (
        <div className='page-container'>
            <PageHeader title="BIDDING PACKAGE" />
            <div className='content-container'>
                {/* Filters Bar */}
                <FiltersBar items={FILTERS_BAR_ITEMS} />

                {/* Search and Favorites Row */}
                <div className='flex flex-col sm:flex-row gap-4 mt-4 mb-2'>
                    {/* Search Input */}
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

                    {/* Favorites Toggle */}
                    <button
                        onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                        className={`w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2 px-4 py-2 rounded-lg border transition-colors ${
                            showFavoritesOnly
                                ? 'bg-red-500/20 border-red-500/50 text-red-400'
                                : 'bg-gray-800/50 border-gray-700/50 text-gray-400 hover:text-gray-200 hover:border-gray-600'
                        }`}
                        disabled={isFavoritesLoading}
                    >
                        <Heart size={16} className={showFavoritesOnly ? 'fill-red-500' : ''} />
                        <span>Favorites{favorites.size > 0 ? ` (${favorites.size})` : ''}</span>
                    </button>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2'></div>
                        <p className='text-gray-400'>Loading signups...</p>
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
                            data={displayData}
                            columns={columns}
                            sorting={sorting}
                            onSortingChange={setSorting}
                            enableSorting={true}
                        />

                        {/* Pagination Controls */}
                        {!showFavoritesOnly && (
                            <Pagination
                                currentPage={pageNumber}
                                totalPages={totalPages}
                                onPageChange={goToPage}
                            />
                        )}

                        {/* Results count */}
                        <div className='text-center text-sm text-gray-500 mt-4'>
                            {showFavoritesOnly
                                ? `Showing ${displayData.length} favorited players`
                                : `Showing ${data.length} of ${response?.total || 0} signups`
                            }
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

// Default export wraps BiddingPackageContent in Suspense for useSearchParams
export default function BiddingPackagePage() {
    return (
        <Suspense fallback={
            <div className='min-h-screen flex items-center justify-center'>
                <div className='text-center'>
                    <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4'></div>
                    <p className='text-gray-400'>Loading...</p>
                </div>
            </div>
        }>
            <BiddingPackageContent />
        </Suspense>
    );
}
