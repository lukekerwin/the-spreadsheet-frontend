'use client';

/**
 * Auth Modal Component
 * Modal dialog for authentication prompts with keyboard and click-outside handling
 * Redirects users to login/signup pages
 */

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import './auth-modal.css';

// ============================================
// TYPES
// ============================================

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// ============================================
// COMPONENT
// ============================================

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const [isNavigating, setIsNavigating] = useState(false);

    // ============================================
    // CLOSE MODAL ON ESCAPE KEY
    // ============================================
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // ============================================
    // PREVENT BODY SCROLL WHEN MODAL IS OPEN
    // ============================================
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

    // ============================================
    // FOCUS TRAP FOR ACCESSIBILITY
    // ============================================
    useEffect(() => {
        if (!isOpen || !modalRef.current) return;

        const focusableElements = modalRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        const handleTab = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement?.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement?.focus();
                }
            }
        };

        document.addEventListener('keydown', handleTab);
        firstElement?.focus();

        return () => document.removeEventListener('keydown', handleTab);
    }, [isOpen]);

    // ============================================
    // CLICK OUTSIDE TO CLOSE
    // ============================================
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // ============================================
    // NAVIGATION HANDLERS
    // ============================================
    const handleSignIn = async () => {
        setIsNavigating(true);
        router.push('/login');
    };

    const handleSignUp = async () => {
        setIsNavigating(true);
        router.push('/signup');
    };

    if (!isOpen) return null;

    return (
        <div className='auth-modal-backdrop' onClick={handleBackdropClick}>
            <div className='auth-modal-simple' ref={modalRef} role='dialog' aria-modal='true' aria-labelledby='auth-modal-title'>
                {/* Close Button */}
                <button
                    className='auth-modal-close'
                    onClick={onClose}
                    aria-label='Close authentication modal'
                >
                    <X size={24} />
                </button>

                {/* Content */}
                <div className='auth-modal-simple-content'>
                    <h2 id='auth-modal-title' className='auth-modal-simple-title'>
                        Sign In Required!
                    </h2>
                    <p className='auth-modal-simple-description'>
                        Sign in to unlock all features, including custom filters, advanced search tools, and complete player statistics
                    </p>

                    {/* Action Buttons */}
                    <div className='auth-modal-simple-buttons'>
                        <button
                            className='auth-modal-button auth-modal-button-primary'
                            onClick={handleSignIn}
                            disabled={isNavigating}
                            aria-busy={isNavigating}
                        >
                            {isNavigating ? 'Loading...' : 'SIGN IN'}
                        </button>
                        <button
                            className='auth-modal-button auth-modal-button-secondary'
                            onClick={handleSignUp}
                            disabled={isNavigating}
                            aria-busy={isNavigating}
                        >
                            {isNavigating ? 'Loading...' : 'CREATE ACCOUNT'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
