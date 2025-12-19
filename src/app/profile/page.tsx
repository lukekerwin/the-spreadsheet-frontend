'use client';

/**
 * Profile Page
 * Displays authenticated user's profile information and account settings
 * Includes subscription management and logout functionality
 */

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { User as UserIcon, Mail, Shield, CheckCircle, XCircle, LogOut, Crown, CreditCard, Zap } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { createCheckoutSession, createPortalSession } from '@/lib/api/subscription';
import './profile.css';

// Wrap the main content in a separate component to use Suspense for useSearchParams
function ProfileContent() {
    // ============================================
    // AUTH & ROUTING
    // ============================================
    const { user, isLoading, logout, refreshUser } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    // ============================================
    // STATE
    // ============================================
    const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(false);
    const [subscriptionMessage, setSubscriptionMessage] = useState<string | null>(null);

    // ============================================
    // EFFECTS
    // ============================================

    // Handle subscription success/cancel from Stripe redirect
    useEffect(() => {
        const subscription = searchParams.get('subscription');
        if (subscription === 'success') {
            setSubscriptionMessage('Subscription activated successfully! Welcome, Subscriber.');
            // Refresh user data to get updated subscription status
            refreshUser();
            // Clear the URL parameter
            router.replace('/profile');
        } else if (subscription === 'canceled') {
            setSubscriptionMessage('Subscription checkout was canceled.');
            router.replace('/profile');
        }
    }, [searchParams, refreshUser, router]);

    // Clear message after 5 seconds
    useEffect(() => {
        if (subscriptionMessage) {
            const timer = setTimeout(() => setSubscriptionMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [subscriptionMessage]);

    // ============================================
    // EVENT HANDLERS
    // ============================================
    const handleLogout = async () => {
        try {
            await logout();
            router.push('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const handleUpgrade = async () => {
        setIsSubscriptionLoading(true);
        try {
            const checkoutUrl = await createCheckoutSession();
            window.location.href = checkoutUrl;
        } catch (error) {
            console.error('Failed to create checkout session:', error);
            setSubscriptionMessage('Failed to start checkout. Please try again.');
        } finally {
            setIsSubscriptionLoading(false);
        }
    };

    const handleManageSubscription = async () => {
        setIsSubscriptionLoading(true);
        try {
            const portalUrl = await createPortalSession();
            window.location.href = portalUrl;
        } catch (error) {
            console.error('Failed to create portal session:', error);
            setSubscriptionMessage('Failed to open subscription management. Please try again.');
        } finally {
            setIsSubscriptionLoading(false);
        }
    };

    // ============================================
    // LOADING & ERROR STATES
    // ============================================

    if (isLoading) {
        return (
            <div className='profile-container'>
                <div className='profile-loading'>Loading...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className='profile-container'>
                <div className='profile-error'>
                    <p>Please sign in to view your profile</p>
                </div>
            </div>
        );
    }

    // ============================================
    // RENDER
    // ============================================
    return (
        <div className='profile-container'>
            <div className='profile-card'>
                {/* Header */}
                <div className='profile-header'>
                    <div className='profile-header-left'>
                        <div className='profile-avatar'>
                            <UserIcon size={32} />
                        </div>
                        <div className='profile-header-text'>
                            <h1 className='profile-title'>YOUR PROFILE</h1>
                            <p className='profile-subtitle'>Account information and settings</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className='profile-logout-button'
                        aria-label='Logout'
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>

                {/* User Information */}
                <div className='profile-content'>
                    {/* Name Section */}
                    {(user.first_name || user.last_name) && (
                        <div className='profile-section'>
                            <h2 className='profile-section-title'>Full Name</h2>
                            <p className='profile-section-value'>
                                {user.first_name} {user.last_name}
                            </p>
                        </div>
                    )}

                    {/* Email Section */}
                    <div className='profile-section'>
                        <h2 className='profile-section-title'>
                            <Mail size={18} />
                            Email Address
                        </h2>
                        <p className='profile-section-value'>{user.email}</p>
                    </div>

                    {/* Account Status */}
                    <div className='profile-section'>
                        <h2 className='profile-section-title'>
                            <Shield size={18} />
                            Account Status
                        </h2>
                        <div className='profile-badges'>
                            <div className={`profile-badge ${user.is_active ? 'active' : 'inactive'}`}>
                                {user.is_active ? <CheckCircle size={16} /> : <XCircle size={16} />}
                                {user.is_active ? 'Active' : 'Inactive'}
                            </div>
                            <div className={`profile-badge ${user.is_verified ? 'verified' : 'unverified'}`}>
                                {user.is_verified ? <CheckCircle size={16} /> : <XCircle size={16} />}
                                {user.is_verified ? 'Verified' : 'Unverified'}
                            </div>
                            {user.is_superuser && (
                                <div className='profile-badge superuser'>
                                    <Shield size={16} />
                                    Admin
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Subscription Section */}
                    <div className='profile-section subscription-section'>
                        <h2 className='profile-section-title'>
                            <Crown size={18} />
                            Subscription
                        </h2>

                        {subscriptionMessage && (
                            <div className={`subscription-message ${subscriptionMessage.includes('success') ? 'success' : 'info'}`}>
                                {subscriptionMessage}
                            </div>
                        )}

                        <div className='subscription-status'>
                            <div className={`subscription-tier ${user.has_premium_access ? 'premium' : 'free'}`}>
                                {user.has_premium_access ? (
                                    <>
                                        <Crown size={20} />
                                        <span>Subscriber</span>
                                    </>
                                ) : (
                                    <>
                                        <Zap size={20} />
                                        <span>Free</span>
                                    </>
                                )}
                            </div>

                            {user.subscription_status === 'active' && user.subscription_current_period_end && !user.subscription_cancel_at_period_end && (
                                <p className='subscription-renewal'>
                                    Renews on {new Date(user.subscription_current_period_end).toLocaleDateString()}
                                </p>
                            )}

                            {user.subscription_status === 'active' && user.subscription_current_period_end && user.subscription_cancel_at_period_end && (
                                <p className='subscription-renewal canceled'>
                                    Cancels on {new Date(user.subscription_current_period_end).toLocaleDateString()}
                                </p>
                            )}

                            {user.subscription_status === 'canceled' && user.subscription_current_period_end && (
                                <p className='subscription-renewal canceled'>
                                    Access until {new Date(user.subscription_current_period_end).toLocaleDateString()}
                                </p>
                            )}
                        </div>

                        <div className='subscription-benefits'>
                            <h3>Subscriber Benefits:</h3>
                            <ul>
                                <li>
                                    <CheckCircle size={14} />
                                    Access to subscriber tools
                                </li>
                                <li>
                                    <CheckCircle size={14} />
                                    Priority support
                                </li>
                            </ul>
                        </div>

                        {/* Subscribe/Manage buttons - hidden while subscription price is inactive */}
                        {user.has_premium_access && (
                            <div className='subscription-actions'>
                                <button
                                    onClick={handleManageSubscription}
                                    className='subscription-button manage'
                                    disabled={isSubscriptionLoading}
                                >
                                    <CreditCard size={18} />
                                    {isSubscriptionLoading ? 'Loading...' : 'Manage Subscription'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Account ID */}
                    <div className='profile-section'>
                        <h2 className='profile-section-title'>Account ID</h2>
                        <p className='profile-section-value profile-id'>{user.id}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Default export wraps ProfileContent in Suspense for useSearchParams
export default function ProfilePage() {
    return (
        <Suspense fallback={
            <div className='profile-container'>
                <div className='profile-loading'>Loading...</div>
            </div>
        }>
            <ProfileContent />
        </Suspense>
    );
}
