'use client';

/**
 * Team Strength of Schedule (SOS) Page
 * Visual bar chart display of team strength of schedule metrics
 * Requires authentication
 */

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { FiltersBarItem } from '@/components/shared/filters-bar/FiltersBar';
import type { DropdownOption } from '@/components/shared/dropdown/Dropdown';
import { useAuth } from '@/providers/AuthProvider';
import PageHeader from '@/components/shared/header/PageHeader';
import SubNav from '@/components/shared/subnav/SubNav';
import FiltersBar from '@/components/shared/filters-bar/FiltersBar';
import SOSBarChart from '@/components/sos/SOSBarChart';
import { SEASONS, LEAGUES, DEFAULT_SEASON_ID, DEFAULT_LEAGUE_ID } from '@/constants/filters';
import { useTeamSOSFilters, useTeamSOSData } from '@/hooks/queries';

export default function TeamSOSPage() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, authLoading, router]);
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
    const [selectedWeek, setSelectedWeek] = useState<number>(0);
    const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<number>(-1);

    // ============================================
    // FETCH FILTERS DATA
    // ============================================
    const { data: filtersData } = useTeamSOSFilters({
        seasonId: Number(selectedSeason.value),
        leagueId: Number(selectedLeague.value),
    });

    // ============================================
    // FETCH SOS DATA
    // ============================================
    const { data: sosData, isLoading, error } = useTeamSOSData({
        seasonId: Number(selectedSeason.value),
        leagueId: Number(selectedLeague.value),
        weekId: selectedWeek,
        gameDow: selectedDayOfWeek,
    });

    // ============================================
    // FILTER HANDLERS
    // ============================================
    const handleSeasonChange = (option: DropdownOption) => {
        setSelectedSeason(option);
    };

    const handleLeagueChange = (option: DropdownOption) => {
        setSelectedLeague(option);
    };

    const handleWeekChange = (option: DropdownOption) => {
        setSelectedWeek(option.value as number);
    };

    const handleDayOfWeekChange = (option: DropdownOption) => {
        setSelectedDayOfWeek(option.value as number);
    };

    // ============================================
    // FILTERS BAR CONFIGURATION
    // ============================================
    const FILTERS_BAR_ITEMS: FiltersBarItem[] = useMemo(() => [
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
            label: 'Week',
            type: 'dropdown',
            data: filtersData?.weeks || [],
            onChange: handleWeekChange,
            defaultValue: 0,
            key: `week-${selectedSeason.value}-${selectedLeague.value}`,
        } as FiltersBarItem & { key: string },
        {
            label: 'Day of Week',
            type: 'dropdown',
            data: filtersData?.days_of_week || [],
            onChange: handleDayOfWeekChange,
            defaultValue: -1,
            key: `day-${selectedSeason.value}-${selectedLeague.value}`,
        } as FiltersBarItem & { key: string },
    ], [selectedSeason.value, selectedLeague.value, filtersData]);

    // Show loading while checking auth
    if (authLoading) {
        return (
            <div className='page-container'>
                <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#9ca3af' }}>
                    Loading...
                </div>
            </div>
        );
    }

    // Don't render content if not authenticated (will redirect)
    if (!isAuthenticated) {
        return null;
    }

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
                title="STRENGTH OF SCHEDULE"
                subtitle=""
            />

            {/* Content */}
            <div className='content-container'>
                {/* Filters Bar */}
                <FiltersBar items={FILTERS_BAR_ITEMS} />

                {/* Loading State */}
                {isLoading && (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>
                        Loading strength of schedule data...
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#f87171' }}>
                        Error loading data: {error instanceof Error ? error.message : 'Unknown error'}
                    </div>
                )}

                {/* Bar Chart */}
                {!isLoading && !error && sosData && (
                    <SOSBarChart
                        data={sosData}
                        title={`${selectedSeason.label} - ${selectedLeague.label}${selectedWeek !== 0 ? ` - Week ${selectedWeek}` : ''}${selectedDayOfWeek !== -1 ? ` - ${filtersData?.days_of_week.find(d => d.value === selectedDayOfWeek)?.label}` : ''}`}
                    />
                )}
            </div>
        </div>
    );
}
