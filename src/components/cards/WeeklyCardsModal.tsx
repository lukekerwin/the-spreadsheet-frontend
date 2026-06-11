'use client';

/**
 * WeeklyCardsModal Component
 * Modal displaying one card per week of a season for a player, goalie, or team.
 * Follows the StatsExplanationModal open/close conventions (Escape, backdrop, scroll lock).
 */

import { useEffect } from 'react';
import { X, CalendarDays } from 'lucide-react';
import Card, { PLAYER_TIER_GRADIENTS, GOALIE_TIER_GRADIENTS, TEAM_TIER_GRADIENTS, type TierConfig } from './Card';
import CardSkeleton from './CardSkeleton';
import EmptyState from '@/components/shared/empty-state/EmptyState';
import ErrorState from '@/components/shared/error-state/ErrorState';
import { usePlayerWeeklyCards, useGoalieWeeklyCards, useTeamWeeklyCards } from '@/hooks/queries';
import type { CardProps } from '@/types/api/cards';
import './weekly-cards-modal.css';

// ============================================
// TYPE DEFINITIONS
// ============================================

export type WeeklyCardsModalType = 'player' | 'goalie' | 'team';

interface WeeklyCardsModalProps {
    isOpen: boolean;
    onClose: () => void;
    card: CardProps | null;
    type: WeeklyCardsModalType;
    seasonId: number;
    seasonLabel: string;
    leagueId: number;
    gameTypeId: number;
    posGroup?: string;
}

// ============================================
// HELPERS
// ============================================

const TIER_GRADIENTS_BY_TYPE: Record<WeeklyCardsModalType, TierConfig> = {
    player: PLAYER_TIER_GRADIENTS,
    goalie: GOALIE_TIER_GRADIENTS,
    team: TEAM_TIER_GRADIENTS,
};

const getWeekLabel = (weekId: number | undefined): string => {
    if (weekId === 0) return 'PRESEASON';
    return `WEEK ${weekId ?? '?'}`;
};

// ============================================
// COMPONENT
// ============================================

export default function WeeklyCardsModal({
    isOpen,
    onClose,
    card,
    type,
    seasonId,
    seasonLabel,
    leagueId,
    gameTypeId,
    posGroup,
}: WeeklyCardsModalProps) {
    const entityId = card?.entityId ?? null;

    // ============================================
    // DATA FETCHING (only the matching hook is enabled)
    // ============================================
    const playerQuery = usePlayerWeeklyCards({
        seasonId,
        leagueId,
        gameTypeId,
        posGroup,
        playerId: type === 'player' ? entityId : null,
        enabled: isOpen && type === 'player',
    });

    const goalieQuery = useGoalieWeeklyCards({
        seasonId,
        leagueId,
        gameTypeId,
        playerId: type === 'goalie' ? entityId : null,
        enabled: isOpen && type === 'goalie',
    });

    const teamQuery = useTeamWeeklyCards({
        seasonId,
        leagueId,
        gameTypeId,
        teamId: type === 'team' ? entityId : null,
        enabled: isOpen && type === 'team',
    });

    const activeQuery = type === 'player' ? playerQuery : type === 'goalie' ? goalieQuery : teamQuery;
    const { data, isLoading, error } = activeQuery;

    // Sort ascending by weekId client-side as a safety net
    const weeklyCards = [...(data?.data ?? [])].sort(
        (a, b) => (a.weekId ?? 0) - (b.weekId ?? 0)
    );

    // ============================================
    // MODAL BEHAVIOR (Escape, scroll lock, backdrop)
    // ============================================

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Click outside to close
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen || !card) return null;

    const tierGradients = TIER_GRADIENTS_BY_TYPE[type];

    return (
        <div className='weekly-modal-backdrop' onClick={handleBackdropClick}>
            <div className='weekly-modal' role='dialog' aria-modal='true' aria-labelledby='weekly-modal-title'>
                {/* Header */}
                <div className='weekly-modal-header'>
                    <div className='weekly-modal-header-text'>
                        <h2 id='weekly-modal-title' className='weekly-modal-title'>
                            <CalendarDays size={20} />
                            {card.header.title}
                        </h2>
                        <span className='weekly-modal-subtitle'>{seasonLabel} - Weekly Cards</span>
                    </div>
                    <button
                        className='weekly-modal-close'
                        onClick={onClose}
                        aria-label='Close modal'
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className='weekly-modal-content'>
                    {/* Loading State */}
                    {isLoading && (
                        <div className='weekly-modal-grid'>
                            {Array.from({ length: 6 }).map((_, index) => (
                                <CardSkeleton key={`weekly-skeleton-${index}`} />
                            ))}
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <ErrorState error={error instanceof Error ? error : null} />
                    )}

                    {/* Weekly Cards Grid */}
                    {!isLoading && !error && weeklyCards.length > 0 && (
                        <div className='weekly-modal-grid'>
                            {weeklyCards.map((weekCard, index) => (
                                <div className='weekly-modal-card' key={`week-${weekCard.weekId ?? index}`}>
                                    <span className='weekly-modal-week-chip'>{getWeekLabel(weekCard.weekId)}</span>
                                    <Card
                                        card={weekCard}
                                        tierGradients={tierGradients}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Empty State */}
                    {!isLoading && !error && weeklyCards.length === 0 && (
                        <EmptyState
                            title='No weekly data'
                            description='No weekly cards are available for this selection.'
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
