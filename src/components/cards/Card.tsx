'use client';

/**
 * Card Component
 * Universal card component for displaying player, goalie, and team information
 * Supports configurable tier gradients and dynamic stat display
 */

import Image from 'next/image';
import TeamLogo from '@/components/shared/logo/TeamLogo';
import type { CardProps, CardItem } from '@/types/api/cards';
import styles from './Card.module.css';

// ============================================
// HELPER FUNCTIONS
// ============================================

const getRatingColor = (rating: number | string): string => {
    if (typeof rating !== 'number') rating = parseInt(rating);
    if (rating >= 67) return 'green';
    if (rating >= 34) return 'yellow';
    return 'red';
};

// ============================================
// TYPES
// ============================================

interface CardComponentProps {
    card: CardProps;
    tierGradients: TierConfig;
}

export interface TierConfig {
    [tierName: string]: string;
}

// ============================================
// TIER GRADIENT CONFIGURATIONS
// ============================================

export const PLAYER_TIER_GRADIENTS: TierConfig = {
    'GAME 7': 'linear-gradient(to right, #f59e0b, #ea580c)',
    'LINE 1': 'linear-gradient(to right, #a855f7, #ec4899)',
    'LINE 2': 'linear-gradient(to right, #3b82f6, #06b6d4)',
    'LINE 3': 'linear-gradient(to right, #10b981, #34d399)',
    'DEPTH': 'linear-gradient(to right, #6b7280, #64748b)',
};

export const GOALIE_TIER_GRADIENTS: TierConfig = {
    'ELITE': 'linear-gradient(to right, #f59e0b, #ea580c)',
    'STARTER': 'linear-gradient(to right, #a855f7, #ec4899)',
    'BACKUP': 'linear-gradient(to right, #3b82f6, #06b6d4)',
    'DEPTH': 'linear-gradient(to right, #6b7280, #64748b)',
};

export const TEAM_TIER_GRADIENTS: TierConfig = {
    'ELITE': 'linear-gradient(to right, #f59e0b, #ea580c)',
    'GREAT': 'linear-gradient(to right, #a855f7, #ec4899)',
    'AVERAGE': 'linear-gradient(to right, #3b82f6, #06b6d4)',
    'POOR': 'linear-gradient(to right, #10b981, #34d399)',
    'BAD': 'linear-gradient(to right, #ef4444, #b91c1c)',
};

// ============================================
// COMPONENT
// ============================================

export default function Card({ card, tierGradients }: CardComponentProps) {
    const getTierGradient = (tier: string, tierGradients: TierConfig): string => {
        return tierGradients[tier] || 'linear-gradient(to right, #6b7280, #64748b)';
    };

    return (
        <div className={styles.card} style={{ backgroundColor: card.teamColor }}>

            {/* Banner OVR Badge */}
            <div className={styles.banner}>
                <div className={styles.bannerOvrValue}>{card.banner.overallPercentile}</div>
                <div className={styles.bannerOvrLabel}>OVR</div>
                <div className={styles.bannerTier} style={{ background: getTierGradient(card.banner.tier, tierGradients) }}>{card.banner.tier}</div>
                <div className={styles.bannerLogo}>
                    <TeamLogo
                        url={card.banner.logoPath}
                        width={40}
                        height={40}
                        priority
                    />
                </div>
            </div>

            {/* Inset Layer 1 */}
            <div className={styles.insetLayer} style={{ backgroundColor: card.teamColor, borderColor: card.teamColor }}>

                {/* Inset Layer 2 */}
                <div className={styles.insetLayer2}>

                    {/* Header Info Section */}
                    <div className={styles.infoSection}>
                        <div className={styles.infoSectionHeader}>
                            <div className={styles.infoSectionHeaderTitle}>
                                <div className={styles.headerTitle}>{card.header.title}</div>
                                    <div className={styles.headerSubtitle}>
                                        {card.header.subtitle.map((item: CardItem, idx: number) => (
                                            <span key={item.label} className={styles.subtitleItem}>
                                                {item.value}
                                                {idx < card.header.subtitle.length - 1 && (
                                                    <span className={styles.metaSeparator}>•</span>
                                                )}
                                            </span>
                                        ))}
                                    </div>
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className={styles.statsRow}>
                            {card.headerStats.map((stat: CardItem) => (
                                <div className={styles.statsRowCard} key={stat.label}>
                                    <div className={styles.statsRowCardLabel}>{stat.label}</div>
                                    <div className={styles.statsRowCardValue}>{stat.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Player Stats Section */}
                    <div className={styles.ratingsSection}>
                        <div className={styles.ratingsSectionTable}>
                            {card.ratings.map((rating: CardItem) => (
                                <div className={styles.ratingsRow} key={rating.label}>
                                    <div className={styles.ratingsRowTitle}>{rating.label}</div>
                                    <div className={styles.ratingsRowValue}>{rating.value}</div>
                                    <div className={styles.progressBarContainer}>
                                        <div className={`${styles.progressBar} ${styles[getRatingColor(rating.value)]}`} style={{ width: `${rating.value}%` }}/>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Boxscore Stats Grid */}
                    <div className={styles.boxscoreStatsSection}>
                        <div className={styles.boxscoreStatsGrid}>
                            {card.stats.map((stat: CardItem) => (
                                <div className={styles.boxscoreStatCard} key={stat.label}>
                                    <div className={styles.boxscoreStatLabel}>{stat.label}</div>
                                    <div className={styles.boxscoreStatValue}>{stat.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                {/* Footer Banner */}
                <div className={styles.footerBanner}>
                    <Image
                        src="/icon_full.svg"
                        alt="The Spreadsheet"
                        width={24}
                        height={24}
                        className={styles.footerIcon}
                    />
                    <span className={styles.footerText}> THE SPREADSHEET </span>
                </div>
            </div>
        </div>
    );
}
