/**
 * ErrorState Component
 * Reusable error state display for API failures and other errors
 */

'use client';

import { AlertCircle, RefreshCw, WifiOff, ServerCrash, LucideIcon } from 'lucide-react';
import './error-state.css';

// ============================================
// TYPE DEFINITIONS
// ============================================

interface ErrorStateProps {
    title?: string;
    description?: string;
    error?: Error | string | null;
    onRetry?: () => void;
    icon?: LucideIcon;
    iconSize?: number;
}

// ============================================
// HELPER: Parse error message
// ============================================

function getErrorDetails(error: Error | string | null | undefined): {
    title: string;
    description: string;
    icon: LucideIcon;
} {
    const errorMessage = error instanceof Error ? error.message : error || '';

    // Network/connection errors
    if (
        errorMessage.includes('Failed to fetch') ||
        errorMessage.includes('NetworkError') ||
        errorMessage.includes('Network request failed')
    ) {
        return {
            title: 'Connection Error',
            description: 'Unable to connect to the server. Please check your internet connection and try again.',
            icon: WifiOff,
        };
    }

    // Server errors
    if (
        errorMessage.includes('500') ||
        errorMessage.includes('502') ||
        errorMessage.includes('503') ||
        errorMessage.includes('Server Error')
    ) {
        return {
            title: 'Server Error',
            description: 'Something went wrong on our end. Please try again in a few moments.',
            icon: ServerCrash,
        };
    }

    // Authentication errors
    if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        return {
            title: 'Session Expired',
            description: 'Your session has expired. Please log in again to continue.',
            icon: AlertCircle,
        };
    }

    // Default error
    return {
        title: 'Something Went Wrong',
        description: 'We encountered an unexpected error. Please try again.',
        icon: AlertCircle,
    };
}

// ============================================
// COMPONENT
// ============================================

export default function ErrorState({
    title,
    description,
    error,
    onRetry,
    icon: CustomIcon,
    iconSize = 48,
}: ErrorStateProps) {
    const errorDetails = getErrorDetails(error);

    const displayTitle = title || errorDetails.title;
    const displayDescription = description || errorDetails.description;
    const Icon = CustomIcon || errorDetails.icon;

    return (
        <div className='error-state-container'>
            <div className='error-state-icon-wrapper'>
                <Icon className='error-state-icon' size={iconSize} strokeWidth={1.5} />
            </div>
            <h3 className='error-state-title'>{displayTitle}</h3>
            <p className='error-state-description'>{displayDescription}</p>
            {onRetry && (
                <button className='error-state-retry-button' onClick={onRetry}>
                    <RefreshCw size={16} />
                    Try Again
                </button>
            )}
        </div>
    );
}
