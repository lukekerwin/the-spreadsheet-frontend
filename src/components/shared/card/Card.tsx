'use client';

import { ReactNode } from 'react';
import './card.css';

// ============================================
// TYPES
// ============================================

interface CardProps {
    children: ReactNode;
    onClick?: () => void;
    className?: string;
}

// ============================================
// COMPONENT
// ============================================

export default function Card({ children, onClick, className = '' }: CardProps) {
    const isClickable = !!onClick;

    const handleClick = () => {
        if (onClick) {
            onClick();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onClick();
        }
    };

    return (
        <div
            className={`card ${isClickable ? 'card-clickable' : ''} ${className}`}
            onClick={isClickable ? handleClick : undefined}
            onKeyDown={isClickable ? handleKeyDown : undefined}
            role={isClickable ? 'button' : undefined}
            tabIndex={isClickable ? 0 : undefined}
        >
            {children}
        </div>
    );
}
