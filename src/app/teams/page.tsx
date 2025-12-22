'use client';

/**
 * Teams Page - Card View
 * Displays team cards with filtering, search, and pagination
 * Supports both authenticated (full access) and public (limited preview) modes
 */

import { useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuth } from '@/providers/AuthProvider';
import type { FiltersBarItem } from '@/components/shared/filters-bar/FiltersBar';
import type { DropdownOption } from '@/components/shared/dropdown/Dropdown';
import type { AutocompleteOption } from '@/components/shared/autocomplete/Autocomplete';
import FiltersBar from '@/components/shared/filters-bar/FiltersBar';
import PageHeader from '@/components/shared/header/PageHeader';
import SubNav from '@/components/shared/subnav/SubNav';
import Pagination from '@/components/shared/pagination/Pagination';
import Card, { TEAM_TIER_GRADIENTS } from '@/components/cards/Card';
import CardSkeleton from '@/components/cards/CardSkeleton';
import EmptyState from '@/components/shared/empty-state/EmptyState';
import ErrorState from '@/components/shared/error-state/ErrorState';
import { SEASONS, LEAGUES, GAME_TYPES, DEFAULT_SEASON_ID, DEFAULT_LEAGUE_ID, DEFAULT_GAME_TYPE_ID, DEFAULT_CARD_PAGE_SIZE } from '@/constants/filters';
import { useTeamCards, useTeamCardNames, usePublicTeamCards } from '@/hooks/queries';

export default function TeamsPage() {
    // ============================================
    // AUTH STATE
    // ============================================
    const { user, isAuthenticated, openAuthModal } = useAuth();

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
    const [selectedTeam, setSelectedTeam] = useState<AutocompleteOption | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    // ============================================
    // DEBOUNCE FILTER CHANGES
    // ============================================
    const debouncedSeason = useDebounce(selectedSeason, 300);
    const debouncedLeague = useDebounce(selectedLeague, 300);
    const debouncedGameType = useDebounce(selectedGameType, 300);

    // ============================================
    // REACT QUERY - DATA FETCHING
    // ============================================
    // Fetch authenticated team data (only when authenticated)
    const { data: authenticatedTeamsData, isLoading: isLoadingAuth, error: errorAuth, isFetching: isFetchingAuth } = useTeamCards({
        seasonId: Number(debouncedSeason.value),
        leagueId: Number(debouncedLeague.value),
        gameTypeId: Number(debouncedGameType.value),
        teamId: selectedTeam ? Number(selectedTeam.id) : null,
        pageNumber: currentPage,
        pageSize: DEFAULT_CARD_PAGE_SIZE,
        enabled: isAuthenticated,
    });

    // Fetch public data when not authenticated
    const { data: publicTeamsData, isLoading: isLoadingPublic, error: errorPublic, isFetching: isFetchingPublic } = usePublicTeamCards();

    // Use the appropriate data based on authentication status
    const teamsData = isAuthenticated ? authenticatedTeamsData : publicTeamsData;
    const isLoading = isAuthenticated ? isLoadingAuth : isLoadingPublic;
    const error = isAuthenticated ? errorAuth : errorPublic;
    const isFetching = isAuthenticated ? isFetchingAuth : isFetchingPublic;

    // Fetch team names for autocomplete dropdown (public endpoint)
    const { data: teamNamesData } = useTeamCardNames({
        seasonId: Number(debouncedSeason.value),
        leagueId: Number(debouncedLeague.value),
        gameTypeId: Number(debouncedGameType.value),
    });

    // ============================================
    // PAGINATION LOGIC
    // ============================================
    const totalPages = teamsData?.totalPages || 1;
    const teams = teamsData?.data || [];

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
                setSelectedTeam(null);
                setCurrentPage(1);
            });
            return;
        }
        setSelectedSeason(option);
        setSelectedTeam(null);
        setCurrentPage(1);
    };

    const handleLeagueChange = (option: DropdownOption) => {
        // Only require auth if value is actually changing (ignore initialization)
        if (option.value === selectedLeague.value) return;

        if (!isAuthenticated) {
            openAuthModal(() => {
                setSelectedLeague(option);
                setSelectedTeam(null);
                setCurrentPage(1);
            });
            return;
        }
        setSelectedLeague(option);
        setSelectedTeam(null);
        setCurrentPage(1);
    };

    const handleGameTypeChange = (option: DropdownOption) => {
        // Only require auth if value is actually changing (ignore initialization)
        if (option.value === selectedGameType.value) return;

        if (!isAuthenticated) {
            openAuthModal(() => {
                setSelectedGameType(option);
                setSelectedTeam(null);
                setCurrentPage(1);
            });
            return;
        }
        setSelectedGameType(option);
        setSelectedTeam(null);
        setCurrentPage(1);
    };

    const handleTeamChange = (option: AutocompleteOption | null) => {
        // Only require auth if value is actually changing (ignore initialization)
        if (option?.id === selectedTeam?.id) return;

        if (!isAuthenticated) {
            openAuthModal(() => {
                setSelectedTeam(option);
                setCurrentPage(1);
            });
            return;
        }
        setSelectedTeam(option);
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
            label: 'Team Search',
            type: 'autocomplete',
            data: teamNamesData?.results || [],
            placeholder: 'Search teams...',
            value: selectedTeam,
            onChange: handleTeamChange,
        },
    ];

    return (
        <div className='page-container'>
                {/* Sub Navigation */}
                <SubNav
                        items={[
                            { label: 'Cards', href: '/teams' },
                            { label: 'SOS', href: '/teams/sos' },
                        ]}
                />

                {/* Page Header */}
                <PageHeader
                    title="TEAM CARDS"
                    subtitle={`Last Updated: ${teamsData?.lastUpdated ?? ""} · Refreshes ${user?.has_premium_access ? 'daily' : 'weekly'}`}
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
                        <ErrorState error={error instanceof Error ? error : null} />
                    )}

                    {/* Team Cards Grid */}
                    {!isLoading && !error && teams.length > 0 && (
                        <>
                            <div className='cards-grid' style={{ opacity: isFetching ? 0.6 : 1 }}>
                                {teams.map((team, index) => (
                                    <Card
                                        key={`team-${index}`}
                                        card={team}
                                        tierGradients={TEAM_TIER_GRADIENTS}
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
                    {!isLoading && !error && teams.length === 0 && (
                        <EmptyState
                            title='No Teams Found'
                            description="We couldn't find any teams matching your current filter selection."
                        />
                    )}
                </div>
        </div>
    );
}
