'use client';

import { useState } from 'react';
import PageHeader from '@/components/shared/header/PageHeader';
import FiltersBar from '@/components/shared/filters-bar/FiltersBar';
import type { FiltersBarItem } from '@/components/shared/filters-bar/FiltersBar';
import type { DropdownOption } from '@/components/shared/dropdown/Dropdown';
import { DEFAULT_LEAGUE_ID, DEFAULT_SEASON_ID } from '@/constants/filters';
import { usePlayoffOdds } from '@/hooks/usePlayoffOdds';
import TeamLogo from '@/components/shared/logo/TeamLogo';
import { getLogoUrl } from '@/utils/logoUrl';
import './playoff-odds.css';

const LEAGUES = [
    { label: 'NHL', value: 37 },
    { label: 'AHL', value: 38 },
    { label: 'ECHL', value: 84 },
    { label: 'CHL', value: 39 },
] as const;

export default function PlayoffOddsPage() {
    // ============================================
    // STATE MANAGEMENT
    // ============================================
    const [selectedLeague, setSelectedLeague] = useState<DropdownOption>({
        value: DEFAULT_LEAGUE_ID,
        label: LEAGUES[0].label,
    });

    // ============================================
    // DATA FETCHING
    // ============================================
    const { data: playoffOdds, isLoading, error } = usePlayoffOdds({
        seasonId: DEFAULT_SEASON_ID,
        leagueId: Number(selectedLeague.value),
    });

    // ============================================
    // FILTERS CONFIGURATION
    // ============================================
    const filters: FiltersBarItem[] = [
        {
            label: 'League',
            type: 'dropdown',
            data: LEAGUES,
            onChange: (option: DropdownOption) => setSelectedLeague(option),
            selectFirstByDefault: true,
            minWidth: '140px',
        },
    ];

    // ============================================
    // RENDER HELPERS
    // ============================================
    const getMostLikelySeed = (team: NonNullable<typeof playoffOdds>[0]) => {
        // Use seed_probabilities if available (for leagues with >8 seeds), otherwise legacy columns
        if (team.seed_probabilities && Object.keys(team.seed_probabilities).length > 0) {
            const seeds = Object.entries(team.seed_probabilities)
                .map(([seed, prob]) => ({ seed: parseInt(seed), prob }))
                .filter(s => s.prob > 0);

            if (seeds.length === 0) return '-';

            const maxSeed = seeds.reduce((max, curr) => curr.prob > max.prob ? curr : max);
            return `${maxSeed.seed} (${maxSeed.prob.toFixed(1)}%)`;
        }

        // Fallback to legacy columns (seeds 1-8)
        const seeds = [
            { seed: 1, prob: team.seed_1_prob },
            { seed: 2, prob: team.seed_2_prob },
            { seed: 3, prob: team.seed_3_prob },
            { seed: 4, prob: team.seed_4_prob },
            { seed: 5, prob: team.seed_5_prob },
            { seed: 6, prob: team.seed_6_prob },
            { seed: 7, prob: team.seed_7_prob },
            { seed: 8, prob: team.seed_8_prob },
        ];
        const maxSeed = seeds.reduce((max, curr) => curr.prob > max.prob ? curr : max);
        return maxSeed.prob > 0 ? `${maxSeed.seed} (${maxSeed.prob.toFixed(1)}%)` : '-';
    };

    const getPlayoffBarColor = (probability: number) => {
        if (probability >= 95) return 'bg-green-500';
        if (probability >= 75) return 'bg-blue-400';
        if (probability >= 50) return 'bg-yellow-400';
        if (probability >= 25) return 'bg-orange-400';
        return 'bg-red-400';
    };

    return (
        <div className='page-container'>
            {/* Page Header */}
            <PageHeader
                title="PLAYOFF ODDS"
            />

            {/* Content */}
            <div className='content-container'>
                {/* Filters */}
                <FiltersBar items={filters} />

                {/* Loading State */}
                {isLoading && (
                    <div className='mt-8 text-center text-gray-400'>
                        Loading playoff odds...
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className='mt-8 p-4 bg-red-900/20 border border-red-500/50 rounded-lg'>
                        <div className='text-red-400 font-semibold mb-2'>Error Loading Playoff Odds</div>
                        <div className='text-red-300 text-sm'>
                            {error instanceof Error ? error.message : 'Failed to load playoff odds. Please try again later.'}
                        </div>
                    </div>
                )}

                {/* Data Tables - Grouped by Conference */}
                {playoffOdds && playoffOdds.length > 0 && (() => {
                    // Group teams by conference dynamically
                    const teamsByConference = new Map<number, typeof playoffOdds>();
                    playoffOdds.forEach(team => {
                        const confId = team.conference_id ?? 0;
                        if (!teamsByConference.has(confId)) {
                            teamsByConference.set(confId, []);
                        }
                        teamsByConference.get(confId)!.push(team);
                    });

                    // Conference names mapping
                    const conferenceNames: { [key: number]: string } = {
                        1: 'Eastern Conference',
                        2: 'Western Conference',
                        3: 'Central Conference',
                        4: 'Pacific Conference',
                        5: 'Atlantic Conference',
                        0: 'Unknown Conference',
                    };

                    const renderTable = (teams: typeof playoffOdds, conferenceTitle: string) => (
                        <div className='flex-1'>
                            <h2 className='text-xl font-semibold text-gray-200 mb-4'>{conferenceTitle}</h2>
                            <div className='overflow-x-auto'>
                                <table className='w-full text-sm'>
                                    <thead>
                                        <tr className='border-b border-gray-700'>
                                            <th className='text-center py-3 px-2 font-semibold text-gray-300 w-8'>#</th>
                                            <th className='text-left py-3 px-3 font-semibold text-gray-300'>Team</th>
                                            <th className='text-center py-3 px-2 font-semibold text-gray-300'>Rec</th>
                                            <th className='text-center py-3 px-2 font-semibold text-gray-300'>Pts</th>
                                            <th className='text-center py-3 px-2 font-semibold text-gray-300'>GP</th>
                                            <th className='text-left py-3 px-3 font-semibold text-gray-300'>Playoff %</th>
                                            <th className='text-center py-3 px-2 font-semibold text-gray-300'>Seed</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {teams.map((team, index) => (
                                            <tr
                                                key={team.team_id}
                                                className={`border-b border-gray-800 hover:bg-gray-800/50 transition-colors ${index < 8 ? 'bg-green-900/10' : ''
                                                    }`}
                                            >
                                                <td className='py-2.5 px-2 text-center text-gray-500 font-mono text-xs'>
                                                    {index + 1}
                                                </td>
                                                <td className='py-2.5 px-3'>
                                                    <div className='flex items-center gap-2'>
                                                        <TeamLogo
                                                            url={getLogoUrl(team.full_team_name)}
                                                            alt={`${team.full_team_name} logo`}
                                                            width={24}
                                                            height={24}
                                                        />
                                                        <div className='font-medium text-gray-100 text-sm'>{team.team_name}</div>
                                                    </div>
                                                </td>
                                                <td className='py-2.5 px-2 text-center text-gray-400 font-mono text-xs'>
                                                    {team.wins}-{team.losses}-{team.ot_losses}
                                                </td>
                                                <td className='py-2.5 px-2 text-center font-semibold text-gray-200'>
                                                    {team.points}
                                                </td>
                                                <td className='py-2.5 px-2 text-center text-gray-400 text-xs'>
                                                    {team.wins + team.losses + team.ot_losses}
                                                </td>
                                                <td className='py-2.5 px-3'>
                                                    <div className='flex items-center gap-2'>
                                                        <div className='flex-1 bg-gray-700/50 rounded-full h-1.5 overflow-hidden'>
                                                            <div
                                                                className={`h-full ${getPlayoffBarColor(team.playoff_odds)} transition-all duration-300`}
                                                                style={{ width: `${team.playoff_odds}%` }}
                                                            />
                                                        </div>
                                                        <span className='font-semibold text-gray-200 min-w-[48px] text-right text-xs'>
                                                            {team.playoff_odds.toFixed(1)}%
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className='py-2.5 px-2 text-center text-gray-300 font-mono text-xs'>
                                                    {getMostLikelySeed(team)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    );

                    return (
                        <div className='mt-8'>
                            {/* 2 columns max on desktop, 1 column on mobile */}
                            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                                {Array.from(teamsByConference.entries())
                                    .sort(([confIdA], [confIdB]) => confIdA - confIdB)
                                    .map(([confId, teams]) => {
                                        // Sort teams by points (desc), then by playoff odds (desc)
                                        const sortedTeams = [...teams].sort((a, b) => {
                                            if (b.points !== a.points) {
                                                return b.points - a.points;
                                            }
                                            return b.playoff_odds - a.playoff_odds;
                                        });
                                        return (
                                            <div key={confId}>
                                                {renderTable(
                                                    sortedTeams,
                                                    conferenceNames[confId] || `Conference ${confId}`
                                                )}
                                            </div>
                                        );
                                    })}
                            </div>

                            {/* Footer Info */}
                            {playoffOdds[0] && (
                                <div className='mt-6 text-xs text-gray-500 text-center'>
                                    Based on {playoffOdds[0].num_simulations.toLocaleString()} simulations •
                                    Last updated: {new Date(playoffOdds[0].last_updated).toLocaleString()}
                                </div>
                            )}
                        </div>
                    );
                })()}
            </div>
        </div>
    );
}
