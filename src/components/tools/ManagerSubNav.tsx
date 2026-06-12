'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import '@/components/shared/subnav/subnav.css';

// ============================================
// TYPES
// ============================================

interface ManagerNavItem {
    label: string;
    href: string;
    comingSoon?: boolean;
}

// ============================================
// CONSTANTS
// ============================================

const MANAGER_NAV_ITEMS: ManagerNavItem[] = [
    { label: 'Contract Values', href: '/tools/manager/contract-values' },
    { label: 'Trade Analyzer', href: '/tools/manager/trade-analyzer', comingSoon: true },
    { label: 'Depth Chart', href: '/tools/manager/depth-chart', comingSoon: true },
    { label: 'Scouting Report', href: '/tools/manager/scouting', comingSoon: true },
];

// ============================================
// COMPONENT
// ============================================

export default function ManagerSubNav() {
    const pathname = usePathname();

    return (
        <div className='subnav-container'>
            <div className='subnav-content'>
                <nav className='subnav-nav'>
                    {MANAGER_NAV_ITEMS.map((item) => {
                        if (item.comingSoon) {
                            return (
                                <span
                                    key={item.href}
                                    className='subnav-link opacity-40 cursor-default'
                                    title='Coming soon'
                                >
                                    {item.label}
                                </span>
                            );
                        }
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
