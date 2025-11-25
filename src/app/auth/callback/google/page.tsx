'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setAuthToken } from '@/lib/auth/tokens';
import { useAuth } from '@/providers/AuthProvider';

function GoogleCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { refreshUser } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(true);

    useEffect(() => {
        const processCallback = async () => {
            try {
                // Get the authorization code from URL params
                const code = searchParams.get('code');
                const state = searchParams.get('state');

                if (!code) {
                    throw new Error('No authorization code received');
                }

                // Exchange code for access token via backend
                const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://the-spreadsheet-v0-production.up.railway.app';
                const response = await fetch(`${API_BASE_URL}/api/v1/auth/google/callback?code=${code}&state=${state || ''}`, {
                    method: 'GET',
                    credentials: 'include',
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ detail: 'OAuth authentication failed' }));
                    throw new Error(errorData.detail || 'Authentication failed');
                }

                const data = await response.json();

                // Store the access token
                if (data.access_token) {
                    setAuthToken(data.access_token);
                    // Refresh user state in AuthProvider
                    await refreshUser();
                    // Redirect to home page
                    router.push('/');
                } else {
                    throw new Error('No access token received');
                }
            } catch (err) {
                console.error('OAuth callback error:', err);
                setError(err instanceof Error ? err.message : 'Authentication failed');
                setIsProcessing(false);
            }
        };

        processCallback();
    }, [searchParams, router, refreshUser]);

    if (error) {
        return (
            <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800'>
                <div className='max-w-md w-full p-8 bg-gray-800 rounded-lg border border-red-900'>
                    <h1 className='text-2xl font-bold text-red-400 mb-4'>Authentication Failed</h1>
                    <p className='text-gray-300 mb-6'>{error}</p>
                    <button
                        onClick={() => router.push('/login')}
                        className='w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
                    >
                        Return to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800'>
            <div className='max-w-md w-full p-8 bg-gray-800 rounded-lg border border-gray-700'>
                <div className='text-center'>
                    <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4'></div>
                    <h1 className='text-2xl font-bold text-white mb-2'>Completing Sign In</h1>
                    <p className='text-gray-400'>Please wait while we log you in...</p>
                </div>
            </div>
        </div>
    );
}

export default function GoogleCallbackPage() {
    return (
        <Suspense fallback={
            <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800'>
                <div className='max-w-md w-full p-8 bg-gray-800 rounded-lg border border-gray-700'>
                    <div className='text-center'>
                        <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4'></div>
                        <h1 className='text-2xl font-bold text-white mb-2'>Loading...</h1>
                        <p className='text-gray-400'>Please wait...</p>
                    </div>
                </div>
            </div>
        }>
            <GoogleCallbackContent />
        </Suspense>
    );
}
