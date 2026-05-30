'use client';

/**
 * Games Page — list of games for a (season, league, week).
 * Defaults: league 37, latest season, latest week that has results
 * (all resolved by the backend when season/week are omitted).
 */

import { useState } from 'react';
import type { FiltersBarItem } from '@/components/shared/filters-bar/FiltersBar';
import type { DropdownOption } from '@/components/shared/dropdown/Dropdown';
import FiltersBar from '@/components/shared/filters-bar/FiltersBar';
import PageHeader from '@/components/shared/header/PageHeader';
import EmptyState from '@/components/shared/empty-state/EmptyState';
import ErrorState from '@/components/shared/error-state/ErrorState';
import GameRow from '@/components/games/GameRow';
import { LEAGUES, DEFAULT_LEAGUE_ID, DEFAULT_GAME_TYPE_ID } from '@/constants/filters';
import { useGames } from '@/hooks/queries/getGames';

export default function GamesPage() {
    const [leagueId, setLeagueId] = useState<number>(DEFAULT_LEAGUE_ID);
    const [seasonId, setSeasonId] = useState<number | null>(null); // null -> latest
    const [weekId, setWeekId] = useState<number | null>(null);     // null -> latest with results
    const [gameDate, setGameDate] = useState<string | null>(null); // null -> latest day with results

    const { data, isLoading, isFetching, error } = useGames({
        leagueId, gameTypeId: DEFAULT_GAME_TYPE_ID, seasonId, weekId, gameDate,
    });

    const games = data?.data ?? [];
    const resolvedSeason = data?.seasonId;
    const resolvedWeek = data?.weekId;
    const resolvedDay = data?.gameDate;
    const dayLabel = data?.days?.find((d) => d.date === resolvedDay)?.label ?? '';

    // Build dropdown options from the response
    const seasonOptions: DropdownOption[] = (data?.seasons ?? []).map((s) => ({
        label: `Season ${s}`, value: s,
    }));
    const weekOptions: DropdownOption[] = (data?.weeks ?? []).map((w) => ({
        label: `Week ${w.weekId}${w.played === 0 ? ' (upcoming)' : ''}`, value: w.weekId,
    }));
    const dayOptions: DropdownOption[] = (data?.days ?? []).map((d) => ({
        label: d.label, value: d.date,
    }));

    const handleLeague = (opt: DropdownOption) => {
        if (Number(opt.value) === leagueId) return;
        setLeagueId(Number(opt.value));
        setSeasonId(null); // re-resolve latest season + week + day for the new league
        setWeekId(null);
        setGameDate(null);
    };
    const handleSeason = (opt: DropdownOption) => {
        if (Number(opt.value) === resolvedSeason) return;
        setSeasonId(Number(opt.value));
        setWeekId(null); // re-resolve latest week + day with results for the chosen season
        setGameDate(null);
    };
    const handleWeek = (opt: DropdownOption) => {
        if (Number(opt.value) === resolvedWeek) return;
        setWeekId(Number(opt.value));
        setGameDate(null); // re-resolve latest day with results for the chosen week
    };
    const handleDay = (opt: DropdownOption) => {
        setGameDate(String(opt.value));
    };

    const FILTERS: FiltersBarItem[] = [
        { label: 'Season', type: 'dropdown', data: seasonOptions, onChange: handleSeason, defaultValue: resolvedSeason },
        { label: 'League', type: 'dropdown', data: LEAGUES, onChange: handleLeague, defaultValue: leagueId },
        { label: 'Week', type: 'dropdown', data: weekOptions, onChange: handleWeek, defaultValue: resolvedWeek },
        { label: 'Day', type: 'dropdown', data: dayOptions, onChange: handleDay, defaultValue: resolvedDay },
    ];

    return (
        <div className="page-container">
            <PageHeader
                title="GAMES"
                subtitle={
                    resolvedWeek != null
                        ? `Week ${resolvedWeek}${dayLabel ? ` · ${dayLabel}` : ''} · ${data?.total ?? 0} games · Last Updated: ${data?.lastUpdated ?? ''}`
                        : 'Loading schedule…'
                }
            />

            <div className="content-container">
                {/* Remount when scope resolves so the Week/Day dropdowns reflect new defaults */}
                {data && (
                    <FiltersBar key={`${leagueId}-${resolvedSeason}-${resolvedWeek}`} items={FILTERS} />
                )}

                {error && <ErrorState error={error instanceof Error ? error : null} />}

                {(isLoading) && (
                    <div className="games-grid">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="game-card" style={{ height: 118, opacity: 0.4 }} />
                        ))}
                    </div>
                )}

                {!isLoading && !error && games.length > 0 && (
                    <div className="games-grid" style={{ opacity: isFetching ? 0.6 : 1 }}>
                        {games.map((g) => (
                            <GameRow key={g.gameId} game={g} />
                        ))}
                    </div>
                )}

                {!isLoading && !error && games.length === 0 && (
                    <EmptyState
                        title="No Games Found"
                        description="There are no games for this league, season, and week."
                    />
                )}
            </div>
        </div>
    );
}
