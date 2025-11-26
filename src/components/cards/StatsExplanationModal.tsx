'use client';

import { useEffect, useRef } from 'react';
import { X, Info } from 'lucide-react';
import './stats-explanation-modal.css';

interface StatsExplanationModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'player' | 'goalie';
}

const PLAYER_STATS = [
    { name: 'OVR', description: 'Overall rating percentile combining Offensive and Defensive scores, compared against all players at the position.' },
    { name: 'OFFENSE', description: 'Offensive percentile based on goals scored above expected and assists above expected.' },
    { name: 'DEFENSE', description: 'Defensive percentile calculated by assigning individual responsibility for opposing team performance.' },
    { name: 'TEAMMATES', description: 'How your linemates perform in games without you. High = strong teammates, Low = weak teammates.' },
    { name: 'OPPONENTS', description: 'How your opponents perform in games not against you. High = tough competition, Low = weak competition.' },
    { name: 'iOFF', description: 'Individual offensive involvement — percentage of your line\'s goals where you recorded a point.' },
    { name: 'xG', description: 'Expected Goals — predicted goals based on shot quality, location, and game context.' },
    { name: 'xA', description: 'Expected Assists — predicted assists based on pass quality and resulting shot opportunities.' },
    { name: 'iDEF', description: 'Individual defensive involvement — percentage of your line\'s defensive actions (takeaways, interceptions, blocks).' },
];

const GOALIE_STATS = [
    { name: 'OVR', description: 'Overall rating percentile based solely on Goals Saved Above Expected.' },
    { name: 'GSAX', description: 'Goals Saved Above Expected — the difference between expected goals against and actual goals against.' },
    { name: 'SUPPORT', description: 'Shots Prevented by skaters in front of the goalie.' },
    { name: 'TEAMMATES', description: 'How your teammates perform in games without you. High = strong teammates, Low = weak teammates.' },
    { name: 'OPPONENTS', description: 'How your opponents perform in games not against you. High = tough competition, Low = weak competition.' },
    { name: 'xGA', description: 'Expected Goals Against — predicted goals based on shot quality and game context.' },
    { name: 'SH/60', description: 'Shots Faced Per 60 minutes of play.' },
];

export default function StatsExplanationModal({ isOpen, onClose, type }: StatsExplanationModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    const stats = type === 'player' ? PLAYER_STATS : GOALIE_STATS;

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

    if (!isOpen) return null;

    return (
        <div className='stats-modal-backdrop' onClick={handleBackdropClick}>
            <div className='stats-modal' ref={modalRef} role='dialog' aria-modal='true' aria-labelledby='stats-modal-title'>
                {/* Header */}
                <div className='stats-modal-header'>
                    <h2 id='stats-modal-title' className='stats-modal-title'>
                        <Info size={20} />
                        {type === 'player' ? 'Player' : 'Goalie'} Statistics Guide
                    </h2>
                    <button
                        className='stats-modal-close'
                        onClick={onClose}
                        aria-label='Close modal'
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className='stats-modal-content'>
                    <div className='stats-modal-grid'>
                        {stats.map((stat) => (
                            <div key={stat.name} className='stats-modal-item'>
                                <span className='stats-modal-stat-name'>{stat.name}</span>
                                <span className='stats-modal-stat-desc'>{stat.description}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
