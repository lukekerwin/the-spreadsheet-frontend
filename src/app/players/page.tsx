'use client';

/**
 * Players Page - Card View
 * Displays player cards with filtering, search, and pagination
 * Supports both authenticated (full access) and public (limited preview) modes
 */

import { useState } from 'react';
import { Info } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuth } from '@/providers/AuthProvider';
import type { FiltersBarItem } from '@/components/shared/filters-bar/FiltersBar';
import type { DropdownOption } from '@/components/shared/dropdown/Dropdown';
import type { MultiSelectAutocompleteOption } from '@/components/shared/multiselect-autocomplete/MultiSelectAutocomplete';
import FiltersBar from '@/components/shared/filters-bar/FiltersBar';
import PageHeader from '@/components/shared/header/PageHeader';
import SubNav from '@/components/shared/subnav/SubNav';
import Pagination from '@/components/shared/pagination/Pagination';
import Card, { PLAYER_TIER_GRADIENTS } from '@/components/cards/Card';
import CardSkeleton from '@/components/cards/CardSkeleton';
import EmptyState from '@/components/shared/empty-state/EmptyState';
import ErrorState from '@/components/shared/error-state/ErrorState';
import StatsExplanationModal from '@/components/cards/StatsExplanationModal';
import { SEASONS, LEAGUES, POSITIONS, GAME_TYPES, DEFAULT_SEASON_ID, DEFAULT_LEAGUE_ID, DEFAULT_GAME_TYPE_ID, DEFAULT_CARD_PAGE_SIZE } from '@/constants/filters';
import { usePlayerCards, usePlayerCardNames, usePublicPlayerCards } from '@/hooks/queries';

export default function PlayersPage() {
    // ============================================
    // AUTH STATE
    // ============================================
    const { isAuthenticated, openAuthModal } = useAuth();

    // ============================================
    // STATE MANAGEMENT
    // ============================================
    const [selectedSeason, setSelectedSeason] = useState<DropdownOption>({
        value: DEFAULT_SEASON_ID,
        label: SEASONS[0].label,
    });
    const [selectedLeague, setSelectedLeague] = useState<DropdownOption>({
        value: DEFAULT_LEAGUE_ID,
        label: LEAGUES[0].label,
    });
    const [selectedGameType, setSelectedGameType] = useState<DropdownOption>({
        value: DEFAULT_GAME_TYPE_ID,
        label: GAME_TYPES[0].label,
    });
    const [selectedPosition, setSelectedPosition] = useState<DropdownOption>({
        value: 'C',
        label: 'Centers',
    });
    const [selectedPlayers, setSelectedPlayers] = useState<MultiSelectAutocompleteOption[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

    // ============================================
    // DEBOUNCE FILTER CHANGES
    // ============================================
    const debouncedSeason = useDebounce(selectedSeason, 300);
    const debouncedLeague = useDebounce(selectedLeague, 300);
    const debouncedGameType = useDebounce(selectedGameType, 300);
    const debouncedPosition = useDebounce(selectedPosition, 300);

    // ============================================
    // REACT QUERY - DATA FETCHING
    // ============================================
    // Fetch authenticated player data (only when authenticated)
    const { data: authenticatedPlayersData, isLoading: isLoadingAuth, error: errorAuth, isFetching: isFetchingAuth } = usePlayerCards({
        seasonId: Number(debouncedSeason.value),
        leagueId: Number(debouncedLeague.value),
        gameTypeId: Number(debouncedGameType.value),
        posGroup: debouncedPosition?.value as string | undefined,
        playerIds: selectedPlayers.length > 0 ? selectedPlayers.map(p => Number(p.id)) : undefined,
        pageNumber: currentPage,
        pageSize: DEFAULT_CARD_PAGE_SIZE,
        enabled: isAuthenticated,
    });

    // Fetch public data when not authenticated
    const { data: publicPlayersData, isLoading: isLoadingPublic, error: errorPublic, isFetching: isFetchingPublic } = usePublicPlayerCards();

    // Use the appropriate data based on authentication status
    const playersData = isAuthenticated ? authenticatedPlayersData : publicPlayersData;
    const isLoading = isAuthenticated ? isLoadingAuth : isLoadingPublic;
    const error = isAuthenticated ? errorAuth : errorPublic;
    const isFetching = isAuthenticated ? isFetchingAuth : isFetchingPublic;

    // Fetch player names for autocomplete dropdown (public endpoint)
    const { data: playerNamesData } = usePlayerCardNames({
        seasonId: Number(debouncedSeason.value),
        leagueId: Number(debouncedLeague.value),
        gameTypeId: Number(debouncedGameType.value),
        posGroup: debouncedPosition?.value as string | undefined,
    });

    // ============================================
    // PAGINATION LOGIC
    // ============================================
    const totalPages = playersData?.totalPages || 1;
    const players = playersData?.data || [];

    const goToPage = (page: number) => {
        if (!isAuthenticated) {
            openAuthModal(() => {
                const pageNumber = Math.max(1, Math.min(page, totalPages));
                setCurrentPage(pageNumber);
            });
            return;
        }
        const pageNumber = Math.max(1, Math.min(page, totalPages));
        setCurrentPage(pageNumber);
    };

    // ============================================
    // FILTER HANDLERS
    // ============================================
    const handleSeasonChange = (option: DropdownOption) => {
        // Only require auth if value is actually changing (ignore initialization)
        if (option.value === selectedSeason.value) return;

        if (!isAuthenticated) {
            openAuthModal(() => {
                setSelectedSeason(option);
                setSelectedPlayers([]);
                setCurrentPage(1);
            });
            return;
        }
        setSelectedSeason(option);
        setSelectedPlayers([]);
        setCurrentPage(1);
    };

    const handleLeagueChange = (option: DropdownOption) => {
        // Only require auth if value is actually changing (ignore initialization)
        if (option.value === selectedLeague.value) return;

        if (!isAuthenticated) {
            openAuthModal(() => {
                setSelectedLeague(option);
                setSelectedPlayers([]);
                setCurrentPage(1);
            });
            return;
        }
        setSelectedLeague(option);
        setSelectedPlayers([]);
        setCurrentPage(1);
    };

    const handleGameTypeChange = (option: DropdownOption) => {
        // Only require auth if value is actually changing (ignore initialization)
        if (option.value === selectedGameType.value) return;

        if (!isAuthenticated) {
            openAuthModal(() => {
                setSelectedGameType(option);
                setSelectedPlayers([]);
                setCurrentPage(1);
            });
            return;
        }
        setSelectedGameType(option);
        setSelectedPlayers([]);
        setCurrentPage(1);
    };

    const handlePositionChange = (option: DropdownOption) => {
        // Only require auth if value is actually changing (ignore initialization)
        if (option.value === selectedPosition.value) return;

        if (!isAuthenticated) {
            openAuthModal(() => {
                setSelectedPosition(option);
                setSelectedPlayers([]);
                setCurrentPage(1);
            });
            return;
        }
        setSelectedPosition(option);
        setSelectedPlayers([]);
        setCurrentPage(1);
    };

    const handlePlayerChange = (options: MultiSelectAutocompleteOption[]) => {
        if (!isAuthenticated) {
            openAuthModal(() => {
                setSelectedPlayers(options);
                setCurrentPage(1);
            });
            return;
        }
        setSelectedPlayers(options);
        setCurrentPage(1);
    };

    // ============================================
    // FILTERS BAR CONFIGURATION
    // ============================================
    const FILTERS_BAR_ITEMS: FiltersBarItem[] = [
        {
            label: 'Season',
            type: 'dropdown',
            data: SEASONS,
            onChange: handleSeasonChange,
            defaultValue: DEFAULT_SEASON_ID,
        },
        {
            label: 'League',
            type: 'dropdown',
            data: LEAGUES,
            onChange: handleLeagueChange,
            defaultValue: DEFAULT_LEAGUE_ID,
        },
        {
            label: 'Game Type',
            type: 'dropdown',
            data: GAME_TYPES,
            onChange: handleGameTypeChange,
            defaultValue: DEFAULT_GAME_TYPE_ID,
        },
        {
            label: 'Position',
            type: 'dropdown',
            data: POSITIONS,
            onChange: handlePositionChange,
        },
        {
            label: 'Player Comparison',
            type: 'multiselect-autocomplete',
            data: playerNamesData?.results || [],
            placeholder: 'Search players...',
            values: selectedPlayers,
            maxSelections: 10,
            onChange: handlePlayerChange,
        },
    ];

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
                    title="PLAYER CARDS"
                    subtitle={`Last Updated: ${playersData?.lastUpdated ?? ""}`}
                    action={
                        <button
                            className="stats-info-button"
                            onClick={() => setIsStatsModalOpen(true)}
                        >
                            <Info size={16} />
                            Stats Guide
                        </button>
                    }
                />

                {/* Disclaimer - Position Group Explanation */}
                <p className='position-disclaimer'>
                    Cards are grouped by position (C/W/D). Stats are calculated using only games played at that position.
                    <span className='position-disclaimer-separator'> · </span>
                    <span className='position-disclaimer-mobile-break'><br /></span>
                    Minimum games played = 1.5 × weeks completed (e.g., Week 8 = 12 GP minimum).
                </p>

                {/* Content */}
                <div className='content-container'>
                    {/* Filters Bar */}
                    <FiltersBar items={FILTERS_BAR_ITEMS} />

                    {/* Loading State */}
                    {isLoading && (
                        <div className='cards-grid'>
                            {Array.from({ length: 12 }).map((_, index) => (
                                <CardSkeleton key={`skeleton-${index}`} />
                            ))}
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <ErrorState error={error instanceof Error ? error : null} />
                    )}

                    {/* Player Cards Grid */}
                    {!isLoading && !error && players.length > 0 && (
                        <>
                            <div className='cards-grid' style={{ opacity: isFetching ? 0.6 : 1 }}>
                                {players.map((player, index) => (
                                    <Card
                                        key={`player-${index}`}
                                        card={player}
                                        tierGradients={PLAYER_TIER_GRADIENTS}
                                    />
                                ))}
                            </div>

                            {/* Pagination Controls */}
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={goToPage}
                            />
                        </>
                    )}

                    {/* Empty State */}
                    {!isLoading && !error && players.length === 0 && (
                        <EmptyState
                            title='No Players Found'
                            description="We couldn't find any players matching your current filter selection."
                        />
                    )}
                </div>

                {/* Stats Explanation Modal */}
                <StatsExplanationModal
                    isOpen={isStatsModalOpen}
                    onClose={() => setIsStatsModalOpen(false)}
                    type="player"
                />
        </div>
    );
}
