'use client';

import { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import type { TeamSOSData } from '@/hooks/queries/getTeamSOSData';
import { getLogoUrl } from '@/utils/logoUrl';
import './barchart.css';

interface SOSBarChartProps {
    data: TeamSOSData[];
    title?: string;
}

export default function SOSBarChart({ data, title = 'Opponent Win Percentage' }: SOSBarChartProps) {
    // Detect mobile screen size
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Custom label component to render team logos (defined inside to access chartData)
    const CustomBarLabel = (props: { x?: number; y?: number; width?: number; index?: number }) => {
        const { x = 0, y = 0, width = 0, index = 0 } = props;

        // Get team name from sorted chartData
        const teamName = chartData[index]?.teamName;

        // Find the matching team data by name
        const teamData = data.find(t => t.team_name === teamName);
        const logoUrl = getLogoUrl(teamName);

        // Scale logo size based on bar width (responsive)
        const logoSize = Math.max(Math.min(width * 0.8, 40), 20);
        const fontSize = Math.max(logoSize * 0.25, 8);

        // Format record
        const record = `${teamData?.win ?? 0}-${teamData?.loss ?? 0}-${teamData?.otl ?? 0}`;

        return (
            <g>
                <image
                    x={x + width / 2 - logoSize / 2}
                    y={y - logoSize - fontSize - 8}
                    width={logoSize}
                    height={logoSize}
                    href={logoUrl}
                    style={{ cursor: 'pointer' }}
                />
                <text
                    x={x + width / 2}
                    y={y - 4}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize={fontSize}
                    fontFamily="var(--font-jetbrains-mono), monospace"
                >
                    {record}
                </text>
            </g>
        );
    };
    // Prepare chart data and calculate color range
    const { chartData, minRating, maxRating } = useMemo(() => {
        const ratings = data
            .map(d => d.opponent_win_pct)
            .filter((r): r is number => r !== null);

        const min = ratings.length > 0 ? Math.min(...ratings) : 0;
        const max = ratings.length > 0 ? Math.max(...ratings) : 1;

        const formattedData = data
            .map(team => ({
                teamName: team.team_name,
                rating: team.opponent_win_pct ?? 0,
                teamId: team.team_id,
            }))
            .sort((a, b) => a.rating - b.rating); // Sort ascending (easiest to hardest)

        return {
            chartData: formattedData,
            minRating: min,
            maxRating: max,
        };
    }, [data]);

    // Get color based on rating (blue = easy, purple = hard)
    const getBarColor = (rating: number): string => {
        const normalized = (rating - minRating) / (maxRating - minRating);

        // Blue to Purple gradient
        const r = Math.round(96 + (167 - 96) * normalized);
        const g = Math.round(165 + (139 - 165) * normalized);
        const b = Math.round(250 + (250 - 250) * normalized);

        return `rgb(${r}, ${g}, ${b})`;
    };

    if (data.length === 0) {
        return (
            <div className='sos-barchart-empty'>
                <p>No data available for the selected filters.</p>
            </div>
        );
    }

    // Mobile table view
    if (isMobile) {
        return (
            <div className='sos-barchart-container'>
                {/* Chart Title */}
                {title && <h3 className='sos-barchart-title'>{title}</h3>}

                {/* Mobile Table */}
                <div className='sos-mobile-table'>
                    {chartData.map((team, index) => {
                        // Find the matching team data by name
                        const teamData = data.find(t => t.team_name === team.teamName);
                        const logoUrl = getLogoUrl(team.teamName);
                        const barColor = getBarColor(team.rating);

                        return (
                            <div key={`${team.teamId}-mobile`} className='sos-mobile-row'>
                                <div className='sos-mobile-rank' style={{ color: barColor }}>
                                    {chartData.length - index}
                                </div>
                                <div className='sos-mobile-logo'>
                                    <Image
                                        src={logoUrl}
                                        alt={team.teamName}
                                        width={32}
                                        height={32}
                                    />
                                </div>
                                <div className='sos-mobile-info'>
                                    <div className='sos-mobile-team-name'>{team.teamName}</div>
                                    <div className='sos-mobile-record'>
                                        {teamData?.win ?? 0}-{teamData?.loss ?? 0}-{teamData?.otl ?? 0}
                                    </div>
                                </div>
                                <div className='sos-mobile-rating' style={{ color: barColor }}>
                                    {team.rating.toFixed(2)}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Legend */}
                <div className='sos-barchart-header'>
                    <div className='sos-barchart-legend'>
                        <div className='sos-barchart-legend-label'>
                            <span className='sos-barchart-legend-arrow'>←</span>
                            <span>Weak Competition</span>
                        </div>
                        <div className='sos-barchart-legend-gradient' />
                        <div className='sos-barchart-legend-label'>
                            <span>Strong Competition</span>
                            <span className='sos-barchart-legend-arrow'>→</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Desktop chart view
    return (
        <div className='sos-barchart-container'>
            {/* Chart Title */}
            {title && <h3 className='sos-barchart-title'>{title}</h3>}

            {/* Recharts Bar Chart */}
            <ResponsiveContainer width="100%" height={500}>
                <BarChart
                    data={chartData}
                    margin={{ top: 60, right: 30, left: 30, bottom: 80 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis
                        dataKey="teamName"
                        stroke="#9ca3af"
                        tick={false}
                        height={20}
                    />
                    <YAxis
                        stroke="#9ca3af"
                        style={{ fontFamily: 'var(--font-jetbrains-mono)' }}
                        domain={[minRating, maxRating]}
                        tickFormatter={(value) => value.toFixed(2)}
                    />
                    <Tooltip
                        content={({ active, payload }) => {
                            if (!active || !payload || !payload.length) return null;

                            const teamName = payload[0].payload?.teamName;
                            if (!teamName) return null;

                            // Find the team data by matching team name
                            const teamData = data.find(t => t.team_name === teamName);
                            if (!teamData) return null;

                            const barColor = getBarColor(teamData.opponent_rating ?? 0);

                            return (
                                <div className='sos-tooltip'>
                                    <div className='sos-tooltip-team'>{teamData.team_name}</div>
                                    <div className='sos-tooltip-record'>
                                        Record: {teamData.win}-{teamData.loss}-{teamData.otl}
                                    </div>
                                    <div className='sos-tooltip-divider' />
                                    <div className='sos-tooltip-stat'>
                                        <span className='sos-tooltip-label'>Opponent Rating:</span>
                                        <span className='sos-tooltip-value' style={{ color: barColor }}>
                                            {teamData.opponent_rating?.toFixed(3) ?? 'N/A'}
                                        </span>
                                    </div>
                                    <div className='sos-tooltip-stat'>
                                        <span className='sos-tooltip-label'>Opponent Win %:</span>
                                        <span className='sos-tooltip-value'>
                                            {teamData.opponent_win_pct !== null
                                                ? `${(teamData.opponent_win_pct * 100).toFixed(1)}%`
                                                : 'N/A'}
                                        </span>
                                    </div>
                                    <div className='sos-tooltip-stat'>
                                        <span className='sos-tooltip-label'>Teammate Rating:</span>
                                        <span className='sos-tooltip-value'>
                                            {teamData.teammate_rating?.toFixed(3) ?? 'N/A'}
                                        </span>
                                    </div>
                                    <div className='sos-tooltip-stat'>
                                        <span className='sos-tooltip-label'>Teammate Win %:</span>
                                        <span className='sos-tooltip-value'>
                                            {teamData.teammate_win_pct !== null
                                                ? `${(teamData.teammate_win_pct * 100).toFixed(1)}%`
                                                : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            );
                        }}
                    />
                    <Bar dataKey="rating" radius={[4, 4, 0, 0]} fillOpacity={0} strokeOpacity={0}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} />
                        ))}
                        <LabelList content={<CustomBarLabel />} />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className='sos-barchart-header'>
                <div className='sos-barchart-legend'>
                    <div className='sos-barchart-legend-label'>
                        <span className='sos-barchart-legend-arrow'>←</span>
                        <span>Weak Competition</span>
                    </div>
                    <div className='sos-barchart-legend-gradient' />
                    <div className='sos-barchart-legend-label'>
                        <span>Strong Competition</span>
                        <span className='sos-barchart-legend-arrow'>→</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
