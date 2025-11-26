'use client';

/**
 * Navigation Bar Component
 * Global navigation with mobile menu support, auth integration, and accessibility features
 * Includes keyboard navigation, focus management, and responsive design
 */

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import UserMenu from '@/components/auth/UserMenu';
import './navbar.css';

// ============================================
// CONSTANTS
// ============================================

// Navigation links configuration
const NAV_LINKS = [
    { href: '/players', label: 'PLAYERS' },
    { href: '/goalies', label: 'GOALIES' },
    { href: '/teams', label: 'TEAMS' },
    { href: '/tools', label: 'TOOLS' },
] as const;

// ============================================
// COMPONENT
// ============================================

export default function NavigationBar() {
    // ============================================
    // STATE & REFS
    // ============================================
    const pathname = usePathname();
    const { isAuthenticated } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const mobileMenuRef = useRef<HTMLDivElement>(null);
    const menuButtonRef = useRef<HTMLButtonElement>(null);

    // ============================================
    // EVENT HANDLERS
    // ============================================
    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    // Track isMenuOpen in a ref so event handlers always have the current value
    const isMenuOpenRef = useRef(isMenuOpen);
    useEffect(() => {
        isMenuOpenRef.current = isMenuOpen;
    }, [isMenuOpen]);

    // ============================================
    // EFFECTS
    // ============================================

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMenuOpen]);

    // Close menu on Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isMenuOpenRef.current) {
                closeMenu();
                menuButtonRef.current?.focus();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                isMenuOpenRef.current &&
                mobileMenuRef.current &&
                !mobileMenuRef.current.contains(e.target as Node) &&
                !menuButtonRef.current?.contains(e.target as Node)
            ) {
                closeMenu();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Trap focus inside mobile menu for keyboard navigation
    useEffect(() => {
        if (!isMenuOpen || !mobileMenuRef.current) return;

        const focusableElements = mobileMenuRef.current.querySelectorAll(
            'a[href], button:not([disabled])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        const handleTab = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        };

        document.addEventListener('keydown', handleTab);
        firstElement?.focus();

        return () => document.removeEventListener('keydown', handleTab);
    }, [isMenuOpen]);

    return (
        <>
            {/* Backdrop blur overlay */}
            <div
                className={`mobile-menu-backdrop ${isMenuOpen ? 'active' : ''}`}
                onClick={closeMenu}
                aria-hidden={!isMenuOpen}
            />

            <nav className='navbar-container'>
                <div className='navbar'>

                    {/* Brand */}
                    <div className='navbar-brand'>
                        <Link href='/'>
                            <Image src='/icon_full.svg' alt='The Spreadsheet' width={32} height={32} className='navbar-logo' />
                            <span className='navbar-brand-text'>THE SPREADSHEET</span>
                        </Link>
                    </div>

                    {/* Right Section - Links & Auth */}
                    <div className='navbar-right'>
                        {/* Desktop Links */}
                        <div className='navbar-links navbar-links-desktop'>
                            {NAV_LINKS.map(({ href, label }) => {
                                // Check if pathname matches exactly OR starts with href + '/'
                                const isActive = pathname === href || pathname.startsWith(href + '/');
                                return (
                                    <Link
                                        key={href}
                                        href={href}
                                        className={isActive ? 'active' : ''}
                                    >
                                        {label}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Auth Section - Desktop */}
                        <div className='navbar-auth navbar-auth-desktop'>
                            {isAuthenticated ? (
                                <UserMenu />
                            ) : (
                                <Link href='/login' className='navbar-login-link'>
                                    LOGIN
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        ref={menuButtonRef}
                        className='mobile-menu-button'
                        onClick={toggleMenu}
                        aria-label='Toggle menu'
                        aria-expanded={isMenuOpen}
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                <div
                    ref={mobileMenuRef}
                    className={`mobile-menu ${isMenuOpen ? 'mobile-menu-open' : ''}`}
                    aria-hidden={!isMenuOpen}
                >
                    {NAV_LINKS.map(({ href, label }) => {
                        // Check if pathname matches exactly OR starts with href + '/'
                        const isActive = pathname === href || pathname.startsWith(href + '/');
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={isActive ? 'active' : ''}
                                onClick={closeMenu}
                            >
                                {label}
                            </Link>
                        );
                    })}

                    {/* Auth Section - Mobile */}
                    <div className='mobile-menu-divider' />
                    {isAuthenticated ? (
                        <Link
                            href='/profile'
                            className='mobile-menu-auth-link'
                            onClick={closeMenu}
                        >
                            PROFILE
                        </Link>
                    ) : (
                        <Link
                            href='/login'
                            className='mobile-menu-auth-link'
                            onClick={closeMenu}
                        >
                            LOGIN
                        </Link>
                    )}
                </div>
            </nav>
        </>
    )
}
