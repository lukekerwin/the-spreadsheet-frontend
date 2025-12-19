'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { Crown } from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface ToolCardProps {
    title: string;
    description: string;
    href: string;
    icon?: ReactNode;
    isPremium?: boolean;
}

// ============================================
// COMPONENT
// ============================================

export default function ToolCard({ title, description, href, icon, isPremium = false }: ToolCardProps) {
    return (
        <Link
            href={href}
            className={`flex flex-col gap-4 p-6 bg-gray-800/50 border rounded-xl transition-all duration-200 hover:bg-gray-800/80 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none relative ${
                isPremium
                    ? 'border-amber-500/30 hover:border-amber-400 hover:shadow-[0_4px_12px_rgba(251,191,36,0.15),0_2px_6px_rgba(0,0,0,0.3)] focus:border-amber-400 focus:shadow-[0_0_0_3px_rgba(251,191,36,0.3),0_4px_12px_rgba(251,191,36,0.15)]'
                    : 'border-gray-600/50 hover:border-blue-400 hover:shadow-[0_4px_12px_rgba(96,165,250,0.15),0_2px_6px_rgba(0,0,0,0.3)] focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(96,165,250,0.3),0_4px_12px_rgba(96,165,250,0.15)]'
            }`}
        >
            {/* Premium Badge */}
            {isPremium && (
                <div className='absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 rounded-full'>
                    <Crown size={12} className='text-amber-400' />
                    <span className='text-xs font-semibold text-amber-400'>SUBSCRIBER</span>
                </div>
            )}

            {icon && (
                <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${
                    isPremium
                        ? 'bg-gradient-to-br from-amber-400/10 to-yellow-400/10 text-amber-400'
                        : 'bg-gradient-to-br from-blue-400/10 to-purple-400/10 text-blue-400'
                }`}>
                    {icon}
                </div>
            )}
            <div className='flex flex-col gap-2'>
                <h3 className='text-xl font-semibold text-gray-100 font-rajdhani'>{title}</h3>
                <p className='text-sm text-gray-400 leading-relaxed'>{description}</p>
            </div>
        </Link>
    );
}
