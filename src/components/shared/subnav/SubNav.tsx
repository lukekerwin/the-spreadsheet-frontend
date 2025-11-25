'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './subnav.css';

// ============================================
// TYPES
// ============================================
export interface SubNavItem {
    label: string;
    href: string;
}

interface SubNavProps {
    items: SubNavItem[];
}

// ============================================
// COMPONENT
// ============================================
export default function SubNav({ items }: SubNavProps) {
    const pathname = usePathname();

    return (
        <div className='subnav-container'>
            <div className='subnav-content'>
                <nav className='subnav-nav'>
                    {items.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`subnav-link ${isActive ? 'subnav-link-active' : ''}`}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}
