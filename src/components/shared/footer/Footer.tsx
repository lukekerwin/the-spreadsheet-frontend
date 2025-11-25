'use client';

/**
 * Footer Component
 * Global footer with navigation links, branding, and copyright information
 */

import Link from 'next/link';
import Image from 'next/image';
import './footer.css';

// ============================================
// CONSTANTS
// ============================================

// Footer navigation columns
const FOOTER_SECTIONS = [
    {
        title: 'Platform',
        links: [
            { href: '/players', label: 'Players' },
            { href: '/goalies', label: 'Goalies' },
            { href: '/teams', label: 'Teams' },
        ],
    },
    {
        title: 'Resources',
        links: [
            { href: '/about', label: 'About' },
            { href: 'https://discord.gg/quMCyQnAp4', label: 'Discord' },
        ],
    },
    {
        title: 'Legal',
        links: [
            { href: '/privacy', label: 'Privacy' },
            { href: '/terms', label: 'Terms' },
            { href: '/contact', label: 'Contact' },
        ],
    },
] as const;

// ============================================
// COMPONENT
// ============================================

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className='footer-container'>
            {/* Main Footer Content */}
            <div className='footer'>
                {/* Brand Section */}
                <div className='footer-brand-section'>
                    <div className='footer-brand'>
                        <Image
                            src='/icon_full.svg'
                            alt='The Spreadsheet'
                            width={40}
                            height={40}
                            className='footer-logo'
                        />
                        <h3 className='footer-brand-text'>THE SPREADSHEET</h3>
                    </div>
                    <p className='footer-tagline'>
                        Advanced hockey analytics powered by comprehensive stats and real-time tracking
                    </p>
                </div>

                {/* Navigation Columns */}
                {FOOTER_SECTIONS.map(({ title, links }) => (
                    <div key={title} className='footer-section'>
                        <h4 className='footer-section-title'>{title}</h4>
                        <nav className='footer-links'>
                            {links.map(({ href, label }) => (
                                <Link key={href} href={href} className='footer-link'>
                                    {label}
                                </Link>
                            ))}
                        </nav>
                    </div>
                ))}
            </div>

            {/* Bottom Bar */}
            <div className='footer-bottom'>
                <div className='footer-bottom-content'>
                    <p className='footer-copyright'>
                        © {currentYear} The Spreadsheet. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}

