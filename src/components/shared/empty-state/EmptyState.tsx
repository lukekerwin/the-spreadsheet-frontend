/**
 * EmptyState Component
 * Reusable empty state display for when no data matches filters
 */

'use client';

import { LucideIcon } from 'lucide-react';
import './empty-state.css';

// ============================================
// TYPE DEFINITIONS
// ============================================

interface EmptyStateProps {
    title: string;
    description: string;
    icon?: LucideIcon;
    iconSize?: number;
}

// ============================================
// COMPONENT
// ============================================

export default function EmptyState({
    title,
    description,
    icon: Icon,
    iconSize = 64,
}: EmptyStateProps) {
    return (
        <div className='empty-state-container'>
            {Icon && (
                <div className='empty-state-icon-wrapper'>
                    <Icon className='empty-state-icon' size={iconSize} strokeWidth={1.5} />
                </div>
            )}
            <h3 className='empty-state-title'>{title}</h3>
            <p className='empty-state-description'>{description}</p>
        </div>
    );
}
