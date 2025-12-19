'use client';

import PageHeader from '@/components/shared/header/PageHeader';
import ToolCard from '@/components/tools/ToolCard';
import { TrendingUp, Gavel } from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface Tool {
    title: string;
    description: string;
    href: string;
    icon: React.ReactNode;
    isPremium?: boolean;
}

// ============================================
// CONSTANTS
// ============================================

const TOOLS: Tool[] = [
    {
        title: 'Playoff Odds',
        description: 'See playoff odds calculated by running 10,000 simulations of the regular season',
        href: '/tools/playoff-odds',
        icon: <TrendingUp size={24} />,
    },
    {
        title: 'Bidding Package',
        description: 'Generate comprehensive bidding packages with player analytics, contract projections, and team fit analysis',
        href: '/tools/bidding-package',
        icon: <Gavel size={24} />,
        isPremium: false,
    },
] as const;

// ============================================
// COMPONENT
// ============================================

export default function ToolsPage() {
    return (
        <div className='page-container'>
            {/* Page Header */}
            <PageHeader
                title="TOOLS"
            />

            {/* Content */}
            <div className='content-container'>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 mt-8'>
                    {TOOLS.map((tool) => (
                        <ToolCard
                            key={tool.href}
                            title={tool.title}
                            description={tool.description}
                            href={tool.href}
                            icon={tool.icon}
                            isPremium={tool.isPremium}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
