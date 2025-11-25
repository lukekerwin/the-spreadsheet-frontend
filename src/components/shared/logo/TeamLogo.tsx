'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getLogoUrl } from '@/utils/logoUrl';

interface TeamLogoProps {
    /**
     * Team name (e.g., "Philadelphia Flyers")
     */
    url: string;

    /**
     * Width of the logo in pixels
     * @default 40
     */
    width?: number;

    /**
     * Height of the logo in pixels
     * @default 40
     */
    height?: number;

    /**
     * Alt text for accessibility
     * @default "Team logo"
     */
    alt?: string;

    /**
     * CSS class name for additional styling
     */
    className?: string;

    /**
     * Priority for Next.js Image component
     * Set to true for above-the-fold images
     * @default false
     */
    priority?: boolean;

    /**
     * Fallback element when logo fails to load
     * Can be a component or string
     * @default Team name abbreviation
     */
    fallback?: React.ReactNode;

    /**
     * Callback when logo fails to load
     */
    onError?: () => void;
}

/**
 * TeamLogo Component
 * Displays a team logo fetched from S3 with fallback support
 *
 * @example
 * <TeamLogo teamName="Philadelphia Flyers" width={40} height={40} />
 *
 * @example
 * <TeamLogo
 *   teamName="Toronto Maple Leafs"
 *   width={64}
 *   height={64}
 *   priority
 *   alt="Toronto Maple Leafs logo"
 * />
 */
export default function TeamLogo({
    url = '/icon_full.svg',
    width = 40,
    height = 40,
    alt = 'Team logo',
    className = '',
    priority = false,
    fallback,
    onError,
}: TeamLogoProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [currentUrl, setCurrentUrl] = useState(url);

    useEffect(() => {
        // Reset error state when url changes
        setIsLoading(true);
        setHasError(false);
        setCurrentUrl(url);
    }, [url]);

    const handleImageError = () => {
        setIsLoading(false);
        setHasError(true);
        // Fallback to local icon_full.svg
        setCurrentUrl('/icon_full.svg');
        onError?.();
    };

    const handleImageLoad = () => {
        setIsLoading(false);
    };

    return (
        <div
            className={`team-logo-container ${className}`}
            style={{
                position: 'relative',
                width,
                height,
            }}
        >
            <Image
                src={currentUrl}
                alt={alt}
                width={width}
                height={height}
                priority={priority}
                onError={handleImageError}
                onLoad={handleImageLoad}
                style={{
                    objectFit: 'contain',
                    width: '100%',
                    height: '100%',
                }}
            />
        </div>
    );
}
