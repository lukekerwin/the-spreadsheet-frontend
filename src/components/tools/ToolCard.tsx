'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

// ============================================
// TYPES
// ============================================

interface ToolCardProps {
    title: string;
    description: string;
    href: string;
    icon?: ReactNode;
}

// ============================================
// COMPONENT
// ============================================

export default function ToolCard({ title, description, href, icon }: ToolCardProps) {
    return (
        <Link
            href={href}
            className='flex flex-col gap-4 p-6 bg-gray-800/50 border border-gray-600/50 rounded-xl transition-all duration-200 hover:bg-gray-800/80 hover:border-blue-400 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(96,165,250,0.15),0_2px_6px_rgba(0,0,0,0.3)] active:translate-y-0 focus:outline-none focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(96,165,250,0.3),0_4px_12px_rgba(96,165,250,0.15)]'
        >
            {icon && (
                <div className='flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-lg text-blue-400'>
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
