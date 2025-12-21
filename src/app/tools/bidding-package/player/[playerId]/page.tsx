'use client';

/**
 * Bidding Package Player Detail Page
 * Shows historical stats and ratings for a specific player
 */

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/shared/header/PageHeader';
import ErrorState from '@/components/shared/error-state/ErrorState';
import { useAuth } from '@/providers/AuthProvider';
import { useBiddingPackagePlayer } from '@/hooks/queries';
import { ArrowLeft, User, MapPin, Monitor, Check, X, Heart, ExternalLink } from 'lucide-react';
import { getFavorites, toggleFavorite } from '@/lib/api/favorites';
import type { PlayerSeasonStats } from '@/types/api';

// ============================================
// HELPERS
// ============================================

const formatContract = (contract: number | null): string => {
    if (contract === null) return '-';
    if (contract >= 1000000) {
        return `$${(contract / 1000000).toFixed(1)}M`;
    }
    return `$${contract.toLocaleString()}`;
};

const formatPercentile = (value: number | null): string => {
    if (value === null) return '-';
    return `${Math.round(value * 100)}`;
};

const formatTOI = (seconds: number | null): string => {
    if (seconds === null) return '-';
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}:${mins.toString().padStart(2, '0')}`;
};

const formatSavePct = (value: number | null): string => {
    if (value === null) return '-';
    return `.${(value * 1000).toFixed(0)}`;
};

const formatGAA = (value: number | null): string => {
    if (value === null) return '-';
    return value.toFixed(2);
};

const getPercentileColor = (value: number | null): string => {
    if (value === null) return 'text-gray-400';
    const pct = value * 100;
    if (pct >= 80) return 'text-green-400';
    if (pct >= 60) return 'text-blue-400';
    if (pct >= 40) return 'text-yellow-400';
    if (pct >= 20) return 'text-orange-400';
    return 'text-red-400';
};

const getPositionColor = (position: string): string => {
    switch (position) {
        case 'C': return 'bg-blue-500/20 text-blue-400';
        case 'LW': return 'bg-green-500/20 text-green-400';
        case 'RW': return 'bg-purple-500/20 text-purple-400';
        case 'LD': return 'bg-orange-500/20 text-orange-400';
        case 'RD': return 'bg-red-500/20 text-red-400';
        case 'G': return 'bg-yellow-500/20 text-yellow-400';
        case 'F': return 'bg-green-500/20 text-green-400';
        case 'D': return 'bg-orange-500/20 text-orange-400';
        default: return 'bg-gray-500/20 text-gray-400';
    }
};

const getLgProfileUrl = (playerId: number): string => {
    return `https://leaguegaming.com/forums/index.php?members/${playerId}/`;
};

// ============================================
// COMPONENTS
// ============================================

interface PlayerInfoCardProps {
    player: NonNullable<ReturnType<typeof useBiddingPackagePlayer>['data']>['player'];
    isFavorite: boolean;
    onToggleFavorite: () => void;
}

function PlayerInfoCard({ player, isFavorite, onToggleFavorite }: PlayerInfoCardProps) {
    return (
        <div className='bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 mb-6'>
            <div className='flex flex-col md:flex-row md:items-center gap-6'>
                {/* Player Avatar */}
                <div className='w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center'>
                    <User size={40} className='text-gray-400' />
                </div>

                {/* Player Info */}
                <div className='flex-1'>
                    <div className='flex items-center gap-3 mb-2'>
                        <h1 className='text-2xl font-bold text-white'>
                            {player.player_name || 'Unknown Player'}
                        </h1>
                        <button
                            onClick={onToggleFavorite}
                            className='p-2 hover:bg-gray-700/50 rounded-lg transition-colors'
                            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                        >
                            <Heart
                                size={22}
                                className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-500 hover:text-red-400'}
                            />
                        </button>
                        <a
                            href={getLgProfileUrl(player.player_id)}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='p-2 hover:bg-gray-700/50 rounded-lg transition-colors text-gray-500 hover:text-blue-400'
                            title='View League Gaming profile'
                        >
                            <ExternalLink size={22} />
                        </a>
                    </div>
                    <div className='flex flex-wrap gap-3'>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPositionColor(player.position)}`}>
                            {player.position}
                        </span>
                        {player.server && (
                            <span className='flex items-center gap-1 text-gray-400 text-sm'>
                                <MapPin size={14} />
                                {player.server}
                            </span>
                        )}
                        {player.console && (
                            <span className='flex items-center gap-1 text-gray-400 text-sm'>
                                <Monitor size={14} />
                                {player.console}
                            </span>
                        )}
                    </div>
                </div>

                {/* Roster Status */}
                <div className='text-right'>
                    <div className='flex items-center gap-2 justify-end mb-1'>
                        {player.is_rostered ? (
                            <>
                                <Check size={16} className='text-green-400' />
                                <span className='text-green-400 text-sm'>Rostered</span>
                            </>
                        ) : (
                            <>
                                <X size={16} className='text-yellow-400' />
                                <span className='text-yellow-400 text-sm'>Free Agent</span>
                            </>
                        )}
                    </div>
                    {player.current_team_name && (
                        <p className='text-gray-300 text-sm'>{player.current_team_name}</p>
                    )}
                </div>
            </div>
        </div>
    );
}

function SeasonRow({ season, isSkater }: { season: PlayerSeasonStats; isSkater: boolean }) {
    return (
        <tr className='border-b border-gray-700/50 hover:bg-gray-800/30'>
            {/* Season Info */}
            <td className='px-4 py-3 text-white font-medium'>S{season.season_id}</td>
            <td className='px-4 py-3 text-gray-300'>{season.league_name || '-'}</td>
            <td className={`px-4 py-3 text-sm font-medium ${getPositionColor(season.pos_group || '')}`}>
                {season.pos_group || '-'}
            </td>
            <td className='px-4 py-3 text-gray-300'>{season.team_name || '-'}</td>
            <td className='px-4 py-3 text-gray-400'>{formatContract(season.contract)}</td>

            {/* Record */}
            <td className='px-4 py-3 text-gray-300'>{season.games_played ?? '-'}</td>
            <td className='px-4 py-3 text-gray-300'>
                {season.wins ?? 0}-{season.losses ?? 0}-{season.ot_losses ?? 0}
            </td>

            {/* Stats */}
            {isSkater ? (
                <>
                    <td className='px-4 py-3 text-white font-medium'>{season.points ?? '-'}</td>
                    <td className='px-4 py-3 text-gray-300'>{season.goals ?? '-'}</td>
                    <td className='px-4 py-3 text-gray-300'>{season.assists ?? '-'}</td>
                    <td className='px-4 py-3 text-gray-300'>{season.plus_minus ?? '-'}</td>
                </>
            ) : (
                <>
                    <td className='px-4 py-3 text-white font-medium'>{formatSavePct(season.save_pct)}</td>
                    <td className='px-4 py-3 text-gray-300'>{formatGAA(season.gaa)}</td>
                    <td className='px-4 py-3 text-gray-300'>{season.saves ?? '-'}</td>
                    <td className='px-4 py-3 text-gray-300'>{season.goals_against ?? '-'}</td>
                    <td className='px-4 py-3 text-gray-300'>{season.shutouts ?? '-'}</td>
                </>
            )}

            {/* Ratings */}
            {isSkater ? (
                <>
                    <td className={`px-4 py-3 font-medium ${getPercentileColor(season.war_percentile)}`}>
                        {formatPercentile(season.war_percentile)}
                    </td>
                    <td className={`px-4 py-3 ${getPercentileColor(season.offense_percentile)}`}>
                        {formatPercentile(season.offense_percentile)}
                    </td>
                    <td className={`px-4 py-3 ${getPercentileColor(season.defense_percentile)}`}>
                        {formatPercentile(season.defense_percentile)}
                    </td>
                    <td className={`px-4 py-3 ${getPercentileColor(season.teammate_rating)}`}>
                        {formatPercentile(season.teammate_rating)}
                    </td>
                    <td className={`px-4 py-3 ${getPercentileColor(season.opponent_rating)}`}>
                        {formatPercentile(season.opponent_rating)}
                    </td>
                </>
            ) : (
                <>
                    <td className={`px-4 py-3 font-medium ${getPercentileColor(season.gsax_percentile)}`}>
                        {formatPercentile(season.gsax_percentile)}
                    </td>
                    <td className={`px-4 py-3 ${getPercentileColor(season.save_pct_percentile)}`}>
                        {formatPercentile(season.save_pct_percentile)}
                    </td>
                    <td className={`px-4 py-3 ${getPercentileColor(season.gaa_percentile)}`}>
                        {formatPercentile(season.gaa_percentile)}
                    </td>
                    <td className={`px-4 py-3 ${getPercentileColor(season.teammate_rating)}`}>
                        {formatPercentile(season.teammate_rating)}
                    </td>
                    <td className={`px-4 py-3 ${getPercentileColor(season.opponent_rating)}`}>
                        {formatPercentile(season.opponent_rating)}
                    </td>
                </>
            )}
        </tr>
    );
}

function SeasonsTable({ seasons, isSkater }: { seasons: PlayerSeasonStats[]; isSkater: boolean }) {
    if (seasons.length === 0) {
        return (
            <div className='bg-gray-800/50 border border-gray-700/50 rounded-xl p-8 text-center'>
                <p className='text-gray-400'>No historical data available for this player.</p>
            </div>
        );
    }

    return (
        <div className='bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden'>
            <div className='overflow-x-auto'>
                <table className='w-full'>
                    <thead>
                        <tr className='bg-gray-900/50 border-b border-gray-700'>
                            <th colSpan={5} className='px-4 py-2 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider'>
                                Season Info
                            </th>
                            <th colSpan={2} className='px-4 py-2 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider border-l border-gray-700'>
                                Record
                            </th>
                            <th colSpan={isSkater ? 4 : 5} className='px-4 py-2 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider border-l border-gray-700'>
                                Stats
                            </th>
                            <th colSpan={5} className='px-4 py-2 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider border-l border-gray-700'>
                                Ratings
                            </th>
                        </tr>
                        <tr className='bg-gray-900/30 border-b border-gray-700'>
                            <th className='px-4 py-2 text-left text-xs font-medium text-gray-300'>Season</th>
                            <th className='px-4 py-2 text-left text-xs font-medium text-gray-300'>League</th>
                            <th className='px-4 py-2 text-left text-xs font-medium text-gray-300'>Pos</th>
                            <th className='px-4 py-2 text-left text-xs font-medium text-gray-300'>Team</th>
                            <th className='px-4 py-2 text-left text-xs font-medium text-gray-300'>Contract</th>
                            <th className='px-4 py-2 text-left text-xs font-medium text-gray-300 border-l border-gray-700'>GP</th>
                            <th className='px-4 py-2 text-left text-xs font-medium text-gray-300'>W-L-OTL</th>
                            {isSkater ? (
                                <>
                                    <th className='px-4 py-2 text-left text-xs font-medium text-gray-300 border-l border-gray-700'>P</th>
                                    <th className='px-4 py-2 text-left text-xs font-medium text-gray-300'>G</th>
                                    <th className='px-4 py-2 text-left text-xs font-medium text-gray-300'>A</th>
                                    <th className='px-4 py-2 text-left text-xs font-medium text-gray-300'>+/-</th>
                                </>
                            ) : (
                                <>
                                    <th className='px-4 py-2 text-left text-xs font-medium text-gray-300 border-l border-gray-700'>SV%</th>
                                    <th className='px-4 py-2 text-left text-xs font-medium text-gray-300'>GAA</th>
                                    <th className='px-4 py-2 text-left text-xs font-medium text-gray-300'>SV</th>
                                    <th className='px-4 py-2 text-left text-xs font-medium text-gray-300'>GA</th>
                                    <th className='px-4 py-2 text-left text-xs font-medium text-gray-300'>SO</th>
                                </>
                            )}
                            {isSkater ? (
                                <>
                                    <th className='px-4 py-2 text-left text-xs font-medium text-gray-300 border-l border-gray-700'>WAR</th>
                                    <th className='px-4 py-2 text-left text-xs font-medium text-gray-300'>OFF</th>
                                    <th className='px-4 py-2 text-left text-xs font-medium text-gray-300'>DEF</th>
                                    <th className='px-4 py-2 text-left text-xs font-medium text-gray-300'>TEAM</th>
                                    <th className='px-4 py-2 text-left text-xs font-medium text-gray-300'>SOS</th>
                                </>
                            ) : (
                                <>
                                    <th className='px-4 py-2 text-left text-xs font-medium text-gray-300 border-l border-gray-700'>GSAX</th>
                                    <th className='px-4 py-2 text-left text-xs font-medium text-gray-300'>SV%</th>
                                    <th className='px-4 py-2 text-left text-xs font-medium text-gray-300'>GAA</th>
                                    <th className='px-4 py-2 text-left text-xs font-medium text-gray-300'>TEAM</th>
                                    <th className='px-4 py-2 text-left text-xs font-medium text-gray-300'>SOS</th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {seasons.map((season, idx) => (
                            <SeasonRow
                                key={`${season.season_id}-${season.league_id}-${idx}`}
                                season={season}
                                isSkater={isSkater}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ============================================
// PAGE COMPONENT
// ============================================

export default function BiddingPackagePlayerPage({
    params,
}: {
    params: Promise<{ playerId: string }>;
}) {
    const { playerId } = use(params);
    const router = useRouter();
    const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

    const hasBiddingPackage = user?.has_bidding_package ?? false;
    const playerIdNum = parseInt(playerId, 10);

    // Favorites state
    const [isFavorite, setIsFavorite] = useState(false);

    const { data, isLoading, error } = useBiddingPackagePlayer({
        playerId: playerIdNum,
        enabled: hasBiddingPackage && !isNaN(playerIdNum),
    });

    // Fetch favorites on mount to check if this player is favorited
    useEffect(() => {
        if (hasBiddingPackage && isAuthenticated && data?.player.signup_id) {
            getFavorites()
                .then((favs) => {
                    setIsFavorite(favs.includes(data.player.signup_id));
                })
                .catch(console.error);
        }
    }, [hasBiddingPackage, isAuthenticated, data?.player.signup_id]);

    const handleBack = () => {
        router.push('/tools/bidding-package');
    };

    const handleToggleFavorite = async () => {
        if (!data?.player.signup_id) return;

        const signupId = data.player.signup_id;
        const currentlyFavorite = isFavorite;

        // Optimistic update
        setIsFavorite(!currentlyFavorite);

        try {
            await toggleFavorite(signupId, currentlyFavorite);
        } catch (error) {
            // Revert on error
            setIsFavorite(currentlyFavorite);
            console.error('Failed to toggle favorite:', error);
        }
    };

    // Auth loading state
    if (isAuthLoading) {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
            </div>
        );
    }

    // Not authenticated or no access
    if (!isAuthenticated || !hasBiddingPackage) {
        return (
            <div className='page-container'>
                <PageHeader title='PLAYER DETAIL' />
                <div className='content-container'>
                    <div className='bg-gray-800/50 border border-gray-700/50 rounded-xl p-8 text-center'>
                        <p className='text-gray-400'>
                            You need to purchase the Bidding Package to view player details.
                        </p>
                        <button
                            onClick={handleBack}
                            className='mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors'
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Loading state
    if (isLoading) {
        return (
            <div className='page-container'>
                <PageHeader title='PLAYER DETAIL' />
                <div className='content-container'>
                    <div className='flex items-center justify-center py-12'>
                        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !data) {
        return (
            <div className='page-container'>
                <PageHeader title='PLAYER DETAIL' />
                <div className='content-container'>
                    <button
                        onClick={handleBack}
                        className='flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors'
                    >
                        <ArrowLeft size={20} />
                        Back to Bidding Package
                    </button>
                    <ErrorState error={error instanceof Error ? error : new Error('Failed to load player')} />
                </div>
            </div>
        );
    }

    const isSkater = data.player.pos_group !== 'G';

    return (
        <div className='page-container'>
            <PageHeader title='PLAYER DETAIL' />
            <div className='content-container'>
                {/* Back Button */}
                <button
                    onClick={handleBack}
                    className='inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 rounded-lg mb-6 transition-colors'
                >
                    <ArrowLeft size={16} />
                    Back to Bidding Package
                </button>

                {/* Player Info Card */}
                <PlayerInfoCard
                    player={data.player}
                    isFavorite={isFavorite}
                    onToggleFavorite={handleToggleFavorite}
                />

                {/* Section Title */}
                <h2 className='text-xl font-semibold text-white mb-4'>Season History</h2>

                {/* Seasons Table */}
                <SeasonsTable seasons={data.seasons} isSkater={isSkater} />
            </div>
        </div>
    );
}
