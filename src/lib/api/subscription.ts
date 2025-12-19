/**
 * Subscription API endpoints
 * Handles subscription management, checkout, and portal access
 */

import { getAuthToken } from '@/lib/auth/tokens';
import { API_BASE_URL } from './config';
import { ApiError, handleResponseError } from './errors';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface SubscriptionStatus {
    tier: 'free' | 'subscriber';
    status: 'none' | 'active' | 'canceled' | 'past_due' | 'trialing';
    current_period_end: string | null;
    cancel_at_period_end: boolean;
    has_premium_access: boolean;
}

export interface CheckoutResponse {
    checkout_url: string;
}

export interface PortalResponse {
    portal_url: string;
}

// ============================================
// SUBSCRIPTION API FUNCTIONS
// ============================================

/**
 * Get current subscription status
 */
export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
    const token = getAuthToken();

    if (!token) {
        throw new ApiError(401, 'No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/subscriptions/status`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        await handleResponseError(response, 'Failed to fetch subscription status');
    }

    return await response.json();
}

/**
 * Create a Stripe Checkout session for subscribing to premium
 * Returns a URL to redirect the user to for payment
 */
export async function createCheckoutSession(): Promise<string> {
    const token = getAuthToken();

    if (!token) {
        throw new ApiError(401, 'No authentication token found');
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/subscriptions/create-checkout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            await handleResponseError(response, 'Failed to create checkout session');
        }

        const data: CheckoutResponse = await response.json();
        return data.checkout_url;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(0, 'Failed to create checkout session');
    }
}

/**
 * Create a Stripe Customer Portal session for managing subscription
 * Returns a URL to redirect the user to for subscription management
 */
export async function createPortalSession(): Promise<string> {
    const token = getAuthToken();

    if (!token) {
        throw new ApiError(401, 'No authentication token found');
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/subscriptions/create-portal`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            await handleResponseError(response, 'Failed to create portal session');
        }

        const data: PortalResponse = await response.json();
        return data.portal_url;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(0, 'Failed to create portal session');
    }
}

/**
 * Create a Stripe Checkout session for purchasing the Bidding Package
 * Returns a URL to redirect the user to for payment (one-time purchase)
 */
export async function purchaseBiddingPackage(): Promise<string> {
    const token = getAuthToken();

    if (!token) {
        throw new ApiError(401, 'No authentication token found');
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/subscriptions/purchase-bidding-package`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            await handleResponseError(response, 'Failed to create checkout session');
        }

        const data: CheckoutResponse = await response.json();
        return data.checkout_url;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(0, 'Failed to create checkout session');
    }
}

/**
 * Cancel the current subscription at the end of the billing period
 */
export async function cancelSubscription(): Promise<void> {
    const token = getAuthToken();

    if (!token) {
        throw new ApiError(401, 'No authentication token found');
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/subscriptions/cancel`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            await handleResponseError(response, 'Failed to cancel subscription');
        }
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(0, 'Failed to cancel subscription');
    }
}
