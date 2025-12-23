'use client';

/**
 * Player Profile Page - Development
 * Building out the UI for individual player pages
 */

import TeamLogo from '@/components/shared/logo/TeamLogo';
import { getLogoUrl } from '@/utils/logoUrl';
import { Star } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MOCK_TEAM_NAME = 'Vancouver Canucks';
const MOCK_PLAYER_NAME = 'Marco Rossi';
const MOCK_POSITION = 'C';
const MOCK_RECORD = '12-12-1';
const MOCK_STATUS = 'Veteran';
const MOCK_OVERALL = 88;

const MOCK_RATINGS = {
    overall: { value: 4.3, percentile: 73 },
    offense: { value: 2.8, percentile: 65 },
    defense: { value: 1.5, percentile: 58 },
};

// Tier thresholds (percentages)
const TIERS = [
    { label: '3L', position: 25 },
    { label: '2L', position: 50 },
    { label: '1L', position: 75 },
    { label: 'star', position: 95 },
];

// Mock offense sub-stats
const MOCK_OFFENSE_STATS = [
    { label: 'P', value: 52, percentile: 69 },
    { label: 'xG', value: 18, percentile: 72 },
    { label: 'G', value: 21, percentile: 66 },
    { label: 'xA', value: 32, percentile: 74 },
    { label: 'A', value: 31, percentile: 70 },
];

// Mock defense sub-stats
const MOCK_DEFENSE_STATS = [
    { label: 'xGA', value: 38, percentile: 62 },
    { label: 'GA', value: 42, percentile: 55 },
    { label: 'TAKE', value: 28, percentile: 71 },
    { label: 'INT', value: 15, percentile: 48 },
    { label: 'BLK', value: 22, percentile: 58 },
];

// Mock chart data - weekly performance
const MOCK_CHART_DATA = [
    { week: 'W1', overall: 65, offense: 70, defense: 55 },
    { week: 'W2', overall: 68, offense: 72, defense: 58 },
    { week: 'W3', overall: 72, offense: 68, defense: 62 },
    { week: 'W4', overall: 70, offense: 65, defense: 68 },
    { week: 'W5', overall: 75, offense: 78, defense: 65 },
    { week: 'W6', overall: 73, offense: 75, defense: 70 },
    { week: 'W7', overall: 78, offense: 80, defense: 72 },
    { week: 'W8', overall: 80, offense: 82, defense: 75 },
    { week: 'W9', overall: 73, offense: 65, defense: 58 },
];

function MiniStatBar({ label, value, percentile, color = 'blue' }: { label: string; value: number | null; percentile: number; color?: 'blue' | 'green' | 'purple' }) {
    const colorClasses = {
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        purple: 'bg-purple-500',
    };

    return (
        <div className='flex items-center gap-2 pl-6'>
            {/* Label + Value */}
            <div className='w-14 flex items-center justify-end gap-1'>
                <span className='text-xs text-gray-400 font-medium'>{label}</span>
                <span className='text-sm text-white font-semibold'>{value ?? '-'}</span>
            </div>

            {/* Progress bar */}
            <div className='flex-1 h-3 bg-gray-600 rounded overflow-hidden'>
                <div
                    className={`h-full ${colorClasses[color]}`}
                    style={{ width: `${percentile}%` }}
                />
            </div>

            {/* Percentile - same width as RatingBar (w-10) */}
            <span className='text-xs text-gray-400 w-10'>
                {percentile}%
            </span>
        </div>
    );
}

function RatingBar({ label, value, percentile, showTiers = true, color = 'gray' }: { label: string; value: number; percentile: number; showTiers?: boolean; color?: 'gray' | 'green' | 'purple' }) {
    const isPositive = value >= 0;
    const colorClasses = {
        gray: 'bg-gray-400',
        green: 'bg-green-500',
        purple: 'bg-purple-500',
    };
    const textColorClasses = {
        gray: 'text-gray-300',
        green: 'text-green-400',
        purple: 'text-purple-400',
    };

    return (
        <div>
            {/* Label */}
            <p className='text-sm text-gray-300 mb-1'>{label}</p>

            <div className='flex items-center gap-2'>
                {/* Value */}
                <span className={`text-lg font-bold w-12 ${textColorClasses[color]}`}>
                    {isPositive ? '+' : ''}{value.toFixed(1)}
                </span>

                {/* Progress bar */}
                <div className='flex-1 h-5 bg-gray-600 rounded overflow-hidden'>
                    <div
                        className={`h-full ${colorClasses[color]}`}
                        style={{ width: `${percentile}%` }}
                    />
                </div>

                {/* Percentile */}
                <span className='text-sm text-gray-300 w-10'>
                    {percentile}%
                </span>
            </div>

            {/* Tier markers */}
            {showTiers && (
                <div className='relative h-4 mt-1 ml-14 mr-12'>
                    {TIERS.map((tier) => (
                        <div
                            key={tier.label}
                            className='absolute flex flex-col items-center'
                            style={{ left: `${tier.position}%`, transform: 'translateX(-50%)' }}
                        >
                            <div className='h-2 w-px bg-gray-500'></div>
                            {tier.label === 'star' ? (
                                <Star size={12} className='text-yellow-500 fill-yellow-500 mt-0.5' />
                            ) : (
                                <span className='text-xs text-gray-500'>{tier.label}</span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function PlayerDevPage() {
    return (
        <div className='page-container'>
            <div className='content-container pt-12'>
                {/* Dashboard Container */}
                <div className='bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 max-w-5xl mx-auto'>
                    {/* Header */}
                    <div className='flex items-center gap-4'>
                        <TeamLogo
                            url={getLogoUrl(MOCK_TEAM_NAME)}
                            width={64}
                            height={64}
                            alt={`${MOCK_TEAM_NAME} logo`}
                        />
                        <div className='flex-1'>
                            <div className='flex items-center gap-4'></div>
                            <h1 className='text-3xl font-bold text-white'>{MOCK_PLAYER_NAME}</h1>
                            <div className='flex items-center gap-4 mt-1'>
                                <div className='flex-1 h-px bg-gray-700'></div>
                                <div className='flex flex-col items-center'>
                                </div>
                            </div>
                            <p className='text-gray-400 text-sm mt-2'>
                                {MOCK_POSITION} <span className='mx-2'>·</span> {MOCK_RECORD} <span className='mx-2'>·</span> {MOCK_STATUS}
                            </p>
                        </div>
                    </div>
                    <div className='mt-6 flex'>
                        {/* Rating Bars - Left Third */}
                        <div className='w-1/3 space-y-4'>
                            <RatingBar label='Overall' value={MOCK_RATINGS.overall.value} percentile={MOCK_RATINGS.overall.percentile} />
                            <RatingBar label='Offense' value={MOCK_RATINGS.offense.value} percentile={MOCK_RATINGS.offense.percentile} showTiers={false} color='green' />
                            {/* Offense Sub-stats */}
                            <div className='space-y-2'>
                                {MOCK_OFFENSE_STATS.map((stat) => (
                                    <MiniStatBar key={stat.label} label={stat.label} value={stat.value} percentile={stat.percentile} color='green' />
                                ))}
                            </div>
                            <RatingBar label='Defense' value={MOCK_RATINGS.defense.value} percentile={MOCK_RATINGS.defense.percentile} showTiers={false} color='purple' />
                            {/* Defense Sub-stats */}
                            <div className='space-y-2'>
                                {MOCK_DEFENSE_STATS.map((stat) => (
                                    <MiniStatBar key={stat.label} label={stat.label} value={stat.value} percentile={stat.percentile} color='purple' />
                                ))}
                            </div>
                        </div>
                        {/* Right Two Thirds - Chart */}
                        <div className='w-2/3 pl-6'>
                            <div className='bg-gray-700/50 border border-gray-600/50 rounded-lg p-4'>
                                <p className='text-sm text-gray-300 mb-2'>Weekly Performance</p>
                                <ResponsiveContainer width='100%' height={450}>
                                    <LineChart data={MOCK_CHART_DATA} margin={{ top: 0, right: 0, left: -30, bottom: -10 }}>
                                        <CartesianGrid strokeDasharray='3 3' stroke='#374151' />
                                        <XAxis dataKey='week' stroke='#9CA3AF' fontSize={12} />
                                        <YAxis stroke='#9CA3AF' fontSize={12} domain={[0, 100]} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#1F2937',
                                                border: '1px solid #374151',
                                                borderRadius: '8px',
                                            }}
                                            labelStyle={{ color: '#F3F4F6' }}
                                        />
                                        <Line type='monotone' dataKey='overall' stroke='#9CA3AF' strokeWidth={2} dot={true} />
                                        <Line type='monotone' dataKey='offense' stroke='#22C55E' strokeWidth={2} dot={true} />
                                        <Line type='monotone' dataKey='defense' stroke='#A855F7' strokeWidth={2} dot={true} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Body */}
            </div>
        </div>
    );
}
