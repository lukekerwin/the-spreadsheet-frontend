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

/**
 * Plan information from the API
 */
export interface Plan {
    id: string;
    name: string;
    description: string | null;
    plan_type: 'subscription' | 'one_time';
    billing_interval: 'month' | 'year' | null;
    price_cents: number;
    currency: string;
    features: Record<string, boolean> | null;
}

/**
 * Subscription information from the API
 */
export interface SubscriptionInfo {
    id: string;
    plan: Plan;
    status: 'pending' | 'active' | 'trialing' | 'past_due' | 'canceled' | 'expired';
    current_period_start: string | null;
    current_period_end: string | null;
    cancel_at_period_end: boolean;
    canceled_at: string | null;
    created_at: string;
}

/**
 * Purchase information from the API
 */
export interface PurchaseInfo {
    id: string;
    plan: Plan;
    status: 'pending' | 'completed' | 'refunded' | 'failed';
    amount_cents: number;
    currency: string;
    purchased_at: string | null;
    created_at: string;
}

/**
 * Payment history entry from the API
 */
export interface PaymentHistoryEntry {
    id: string;
    event_type: 'payment_succeeded' | 'payment_failed' | 'refund' | 'dispute';
    amount_cents: number;
    currency: string;
    status: 'succeeded' | 'failed' | 'pending' | 'refunded';
    invoice_url: string | null;
    receipt_url: string | null;
    event_at: string;
}

/**
 * Full subscription status including legacy fields and new detailed data
 */
export interface SubscriptionStatus {
    // Legacy fields for backward compatibility
    tier: 'free' | 'subscriber';
    status: 'none' | 'active' | 'canceled' | 'past_due' | 'trialing';
    current_period_end: string | null;
    cancel_at_period_end: boolean;
    has_premium_access: boolean;
    has_bidding_package: boolean;

    // New detailed fields
    subscriptions: SubscriptionInfo[];
    purchases: PurchaseInfo[];
}

export interface CheckoutResponse {
    checkout_url: string;
}

export interface PortalResponse {
    portal_url: string;
}

export interface CheckoutRequest {
    plan_id?: string;
    success_url?: string;
    cancel_url?: string;
}

// ============================================
// SUBSCRIPTION API FUNCTIONS
// ============================================

/**
 * Get available subscription plans
 * @param planType - Optional filter by plan type ('subscription' or 'one_time')
 */
export async function getPlans(planType?: 'subscription' | 'one_time'): Promise<Plan[]> {
    const params = new URLSearchParams();
    if (planType) {
        params.append('plan_type', planType);
    }

    const url = `${API_BASE_URL}/api/v1/subscriptions/plans${params.toString() ? `?${params}` : ''}`;
    const response = await fetch(url);

    if (!response.ok) {
        await handleResponseError(response, 'Failed to fetch plans');
    }

    return await response.json();
}

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

/**
 * Get payment history for the current user
 * @param limit - Maximum number of entries to return (default 50, max 100)
 * @param offset - Number of entries to skip (for pagination)
 */
export async function getPaymentHistory(
    limit: number = 50,
    offset: number = 0
): Promise<PaymentHistoryEntry[]> {
    const token = getAuthToken();

    if (!token) {
        throw new ApiError(401, 'No authentication token found');
    }

    const params = new URLSearchParams({
        limit: String(limit),
        offset: String(offset),
    });

    const response = await fetch(
        `${API_BASE_URL}/api/v1/subscriptions/history?${params}`,
        {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        await handleResponseError(response, 'Failed to fetch payment history');
    }

    return await response.json();
}
