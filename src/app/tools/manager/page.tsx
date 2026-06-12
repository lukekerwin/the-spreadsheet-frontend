'use client';

/**
 * Manager Tools Hub
 * Subscription tier ($10/mo) with GM-focused tools: contract values,
 * trade analyzer, depth charts, and opponent scouting.
 * Subscribers are redirected to the first tool; tools are navigated
 * via the ManagerSubNav tabs.
 */

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PageHeader from '@/components/shared/header/PageHeader';
import { useAuth } from '@/providers/AuthProvider';
import { subscribeManagerTools } from '@/lib/api/subscription';
import { ClipboardList, CheckCircle, Crown } from 'lucide-react';

// ============================================
// CONSTANTS
// ============================================

const FEATURES = [
    'Contract value analysis: production vs salary for every player',
    'Trade analyzer with GAR and SOS-adjusted comparisons',
    'Positional depth charts with league-wide percentiles',
    'Opponent scouting reports for upcoming games',
    'Includes full Subscriber premium access (live data)',
    'New manager tools added throughout the season',
] as const;

// ============================================
// COMPONENTS
// ============================================

function ManagerToolsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, isAuthenticated, isLoading: isAuthLoading, openAuthModal, refreshUser } = useAuth();
    const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
    const [subscribeMessage, setSubscribeMessage] = useState<string | null>(null);

    // Superusers always have access; backend will expose has_manager_tools for subscribers
    const hasManagerTools = (user?.has_manager_tools ?? false) || (user?.is_superuser ?? false);

    // Handle subscribe success/cancel from Stripe redirect
    useEffect(() => {
        const subscribe = searchParams.get('subscribe');
        if (subscribe === 'success') {
            setSubscribeMessage('Subscription successful! You now have access to Manager Tools.');
            refreshUser();
            router.replace('/tools/manager');
        } else if (subscribe === 'canceled') {
            setSubscribeMessage('Checkout was canceled.');
            router.replace('/tools/manager');
        }
    }, [searchParams, refreshUser, router]);

    // Clear message after 5 seconds
    useEffect(() => {
        if (subscribeMessage) {
            const timer = setTimeout(() => setSubscribeMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [subscribeMessage]);

    // Subscribers land on the first tool; tools are tabs, not cards
    useEffect(() => {
        if (!isAuthLoading && hasManagerTools && !searchParams.get('subscribe')) {
            router.replace('/tools/manager/contract-values');
        }
    }, [isAuthLoading, hasManagerTools, searchParams, router]);

    // ============================================
    // HANDLERS
    // ============================================
    const handleSubscribe = async () => {
        if (!isAuthenticated) {
            openAuthModal(() => handleSubscribe());
            return;
        }

        setIsCheckoutLoading(true);
        try {
            const checkoutUrl = await subscribeManagerTools();
            window.location.href = checkoutUrl;
        } catch (error) {
            console.error('Failed to create checkout session:', error);
            setSubscribeMessage('Failed to start checkout. Please try again.');
        } finally {
            setIsCheckoutLoading(false);
        }
    };

    // ============================================
    // LOADING STATE
    // ============================================
    if (isAuthLoading) {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <div className='text-center'>
                    <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4'></div>
                    <p className='text-gray-400'>Loading...</p>
                </div>
            </div>
        );
    }

    // ============================================
    // RENDER - PAYWALL (Users without Manager Tools)
    // ============================================
    if (!hasManagerTools) {
        return (
            <div className='page-container'>
                <PageHeader title="MANAGER TOOLS" subtitle="" />
                <div className='content-container'>
                    {/* Subscribe Message */}
                    {subscribeMessage && (
                        <div className={`max-w-2xl mx-auto mb-6 p-4 rounded-lg ${subscribeMessage.includes('successful') ? 'bg-green-500/20 text-green-300' : 'bg-gray-700/50 text-gray-300'}`}>
                            {subscribeMessage}
                        </div>
                    )}

                    {/* Paywall Content */}
                    <div className='max-w-2xl mx-auto'>
                        {/* Header */}
                        <div className='flex flex-col items-center text-center mb-8'>
                            <div className='flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400/20 to-yellow-400/20 rounded-2xl mb-6'>
                                <ClipboardList size={40} className='text-amber-400' />
                            </div>
                            <h2 className='text-3xl font-bold text-gray-100 font-rajdhani mb-3'>
                                Manager Tools
                            </h2>
                            <div className='flex items-center gap-2 mb-4'>
                                <Crown size={16} className='text-amber-400' />
                                <span className='text-amber-400 font-semibold'>$10 / month</span>
                            </div>
                            <p className='text-gray-400 max-w-lg'>
                                The GM toolkit. Contract values, trade analysis, depth charts,
                                and opponent scouting — everything you need to build a winner.
                            </p>
                        </div>

                        {/* Features List */}
                        <div className='bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 mb-8'>
                            <h3 className='text-lg font-semibold text-gray-100 mb-4'>What&apos;s Included</h3>
                            <ul className='space-y-3'>
                                {FEATURES.map((feature, index) => (
                                    <li key={index} className='flex items-start gap-3'>
                                        <CheckCircle size={18} className='text-green-400 mt-0.5 flex-shrink-0' />
                                        <span className='text-gray-300'>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* CTA */}
                        <div className='flex flex-col items-center'>
                            <button
                                onClick={handleSubscribe}
                                disabled={isCheckoutLoading}
                                className='flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-gray-900 font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
                            >
                                <Crown size={20} />
                                <span>{isCheckoutLoading ? 'Loading...' : 'Subscribe Now'}</span>
                            </button>
                            <p className='text-sm text-gray-500 mt-4'>
                                {isAuthenticated
                                    ? 'Cancel anytime'
                                    : 'Sign in to subscribe'
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ============================================
    // RENDER - SUBSCRIBER (redirecting to first tool)
    // ============================================
    return (
        <div className='page-container'>
            <PageHeader title="MANAGER TOOLS" />
            <div className='content-container'>
                {/* Subscribe Message (shown briefly after Stripe redirect) */}
                {subscribeMessage && (
                    <div className={`max-w-2xl mx-auto mb-6 p-4 rounded-lg ${subscribeMessage.includes('successful') ? 'bg-green-500/20 text-green-300' : 'bg-gray-700/50 text-gray-300'}`}>
                        {subscribeMessage}
                    </div>
                )}

                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2'></div>
                    <p className='text-gray-400'>Loading Manager Tools...</p>
                </div>
            </div>
        </div>
    );
}

// Default export wraps ManagerToolsContent in Suspense for useSearchParams
export default function ManagerToolsPage() {
    return (
        <Suspense fallback={
            <div className='min-h-screen flex items-center justify-center'>
                <div className='text-center'>
                    <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4'></div>
                    <p className='text-gray-400'>Loading...</p>
                </div>
            </div>
        }>
            <ManagerToolsContent />
        </Suspense>
    );
}
