'use client';

import { ReactNode, useRef, useState, useEffect, CSSProperties } from 'react';
import './card.css';
import '@/styles/cards/card-holographic.css';
import '@/styles/cards/card-holographic-gold.css';

// ============================================
// TYPES
// ============================================

export type CardVariant = 'default' | 'gold';

interface HolographicCardProps {
    children: ReactNode;
    onClick?: () => void;
    className?: string;
    enableHolographic?: boolean;
    variant?: CardVariant;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

const clamp = (value: number, min = 0, max = 100): number => {
    return Math.min(Math.max(value, min), max);
};

const round = (value: number, decimals = 2): number => {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

// ============================================
// COMPONENT
// ============================================

export default function HolographicCard({
    children,
    onClick,
    className = '',
    enableHolographic = true,
    variant = 'default',
}: HolographicCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isInteracting, setIsInteracting] = useState(false);
    const [cardStyles, setCardStyles] = useState<CSSProperties>({});

    const isClickable = !!onClick;

    // ============================================
    // INTERACTION HANDLERS
    // ============================================

    const interact = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        if (!enableHolographic || !cardRef.current) return;

        setIsInteracting(true);

        let clientX: number;
        let clientY: number;

        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        const rect = cardRef.current.getBoundingClientRect();

        // Get mouse position relative to card
        const absolute = {
            x: clientX - rect.left,
            y: clientY - rect.top,
        };

        // Convert to percentage
        const percent = {
            x: clamp(round((100 / rect.width) * absolute.x)),
            y: clamp(round((100 / rect.height) * absolute.y)),
        };

        // Get position from center
        const center = {
            x: percent.x - 50,
            y: percent.y - 50,
        };

        // Calculate distance from center (0-1)
        const distanceFromCenter = clamp(
            Math.sqrt(center.x * center.x + center.y * center.y) / 50,
            0,
            1
        );

        // Update CSS variables for holographic effect
        setCardStyles({
            '--pointer-x': `${percent.x}%`,
            '--pointer-y': `${percent.y}%`,
            '--pointer-from-center': distanceFromCenter,
            '--pointer-from-top': percent.y / 100,
            '--pointer-from-left': percent.x / 100,
            '--card-opacity': 1,
            '--rotate-x': `${round(-(center.x / 3.5))}deg`,
            '--rotate-y': `${round(center.y / 2)}deg`,
            '--background-x': `${clamp(round((percent.x * 0.26) + 37))}%`,
            '--background-y': `${clamp(round((percent.y * 0.34) + 33))}%`,
        } as CSSProperties);
    };

    const interactEnd = () => {
        if (!enableHolographic) return;

        setIsInteracting(false);

        // Reset to default values with transition
        setCardStyles({
            '--pointer-x': '50%',
            '--pointer-y': '50%',
            '--pointer-from-center': 0,
            '--pointer-from-top': 0.5,
            '--pointer-from-left': 0.5,
            '--card-opacity': 0,
            '--rotate-x': '0deg',
            '--rotate-y': '0deg',
            '--background-x': '50%',
            '--background-y': '50%',
        } as CSSProperties);
    };

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

    // ============================================
    // RENDER
    // ============================================

    const cardClasses = [
        'card',
        enableHolographic ? 'card-interactive' : '',
        isClickable ? 'card-clickable' : '',
        isInteracting ? 'interacting' : '',
        variant === 'gold' ? 'card-gold' : '',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    if (!enableHolographic) {
        // Render simple card without holographic effects
        return (
            <div
                ref={cardRef}
                className={cardClasses}
                onClick={isClickable ? handleClick : undefined}
                onKeyDown={isClickable ? handleKeyDown : undefined}
                role={isClickable ? 'button' : undefined}
                tabIndex={isClickable ? 0 : undefined}
            >
                {children}
            </div>
        );
    }

    return (
        <div
            ref={cardRef}
            className={cardClasses}
            style={cardStyles}
            onClick={isClickable ? handleClick : undefined}
            onKeyDown={isClickable ? handleKeyDown : undefined}
            onMouseMove={interact}
            onTouchMove={interact}
            onMouseLeave={interactEnd}
            onTouchEnd={interactEnd}
            role={isClickable ? 'button' : undefined}
            tabIndex={isClickable ? 0 : undefined}
        >
            <div className='card__translater'>
                <div className='card__rotator'>
                    {/* Card Content */}
                    <div className='card__content'>{children}</div>

                    {/* Holographic Shine Layer */}
                    <div className='card__shine' aria-hidden='true' />

                    {/* Glare Layer */}
                    <div className='card__glare' aria-hidden='true' />
                </div>
            </div>
        </div>
    );
}
