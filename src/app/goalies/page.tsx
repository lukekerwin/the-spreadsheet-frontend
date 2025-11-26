'use client';

/**
 * Goalies Page - Card View
 * Displays goalie cards with filtering, search, and pagination
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
import Card, { GOALIE_TIER_GRADIENTS } from '@/components/cards/Card';
import CardSkeleton from '@/components/cards/CardSkeleton';
import EmptyState from '@/components/shared/empty-state/EmptyState';
import StatsExplanationModal from '@/components/cards/StatsExplanationModal';
import { SEASONS, LEAGUES, DEFAULT_SEASON_ID, DEFAULT_LEAGUE_ID, DEFAULT_CARD_PAGE_SIZE } from '@/constants/filters';
import { useGoalieCards, useGoalieCardNames, usePublicGoalieCards } from '@/hooks/queries';

export default function GoaliesPage() {
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

    const [selectedGoalies, setSelectedGoalies] = useState<MultiSelectAutocompleteOption[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

    // ============================================
    // DEBOUNCE FILTER CHANGES
    // ============================================
    const debouncedSeason = useDebounce(selectedSeason, 300);
    const debouncedLeague = useDebounce(selectedLeague, 300);

    // ============================================
    // REACT QUERY - DATA FETCHING
    // ============================================
    // Fetch authenticated goalie data (only when authenticated)
    const { data: authenticatedGoaliesData, isLoading: isLoadingAuth, error: errorAuth, isFetching: isFetchingAuth } = useGoalieCards({
        seasonId: Number(debouncedSeason.value),
        leagueId: Number(debouncedLeague.value),
        playerIds: selectedGoalies.length > 0 ? selectedGoalies.map(g => Number(g.id)) : undefined,
        pageNumber: currentPage,
        pageSize: DEFAULT_CARD_PAGE_SIZE,
        enabled: isAuthenticated,
    });

    // Fetch public data when not authenticated
    const { data: publicGoaliesData, isLoading: isLoadingPublic, error: errorPublic, isFetching: isFetchingPublic } = usePublicGoalieCards();

    // Use the appropriate data based on authentication status
    const goaliesData = isAuthenticated ? authenticatedGoaliesData : publicGoaliesData;
    const isLoading = isAuthenticated ? isLoadingAuth : isLoadingPublic;
    const error = isAuthenticated ? errorAuth : errorPublic;
    const isFetching = isAuthenticated ? isFetchingAuth : isFetchingPublic;

    // Fetch goalie names for autocomplete dropdown (public endpoint)
    const { data: goalieNamesData } = useGoalieCardNames({
        seasonId: Number(debouncedSeason.value),
        leagueId: Number(debouncedLeague.value),
    });

    // ============================================
    // PAGINATION LOGIC
    // ============================================
    const totalPages = goaliesData?.totalPages || 1;
    const goalies = goaliesData?.data || [];

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
                setSelectedGoalies([]);
                setCurrentPage(1);
            });
            return;
        }
        setSelectedSeason(option);
        setSelectedGoalies([]);
        setCurrentPage(1);
    };

    const handleLeagueChange = (option: DropdownOption) => {
        // Only require auth if value is actually changing (ignore initialization)
        if (option.value === selectedLeague.value) return;

        if (!isAuthenticated) {
            openAuthModal(() => {
                setSelectedLeague(option);
                setSelectedGoalies([]);
                setCurrentPage(1);
            });
            return;
        }
        setSelectedLeague(option);
        setSelectedGoalies([]);
        setCurrentPage(1);
    };

    const handleGoalieChange = (options: MultiSelectAutocompleteOption[]) => {
        if (!isAuthenticated) {
            openAuthModal(() => {
                setSelectedGoalies(options);
                setCurrentPage(1);
            });
            return;
        }
        setSelectedGoalies(options);
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
            label: 'Goalie Comparison',
            type: 'multiselect-autocomplete',
            data: goalieNamesData?.results || [],
            placeholder: 'Search goalies...',
            values: selectedGoalies,
            maxSelections: 10,
            onChange: handleGoalieChange,
        },
    ];

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
                    title="GOALIE CARDS"
                    subtitle={`Last Updated: ${goaliesData?.lastUpdated ?? ""}`}
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
                        <div className='error-container'>
                            <p>Error loading goalies: {error instanceof Error ? error.message : 'Unknown error'}</p>
                        </div>
                    )}

                    {/* Goalie Cards Grid */}
                    {!isLoading && !error && goalies.length > 0 && (
                        <>
                            <div className='cards-grid' style={{ opacity: isFetching ? 0.6 : 1 }}>
                                {goalies.map((goalie, index) => (
                                    <Card
                                        key={`goalie-${index}`}
                                        card={goalie}
                                        tierGradients={GOALIE_TIER_GRADIENTS}
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
                    {!isLoading && !error && goalies.length === 0 && (
                        <EmptyState
                            title='No Goalies Found'
                            description="We couldn't find any goalies matching your current filter selection."
                        />
                    )}
                </div>

                {/* Stats Explanation Modal */}
                <StatsExplanationModal
                    isOpen={isStatsModalOpen}
                    onClose={() => setIsStatsModalOpen(false)}
                    type="goalie"
                />
        </div>
    );
}
