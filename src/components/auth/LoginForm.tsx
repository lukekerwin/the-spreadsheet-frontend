'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';

import './auth.css';

interface LoginFormProps {
    onSuccess?: () => void;
    inModal?: boolean;
}

export default function LoginForm({ onSuccess, inModal = false }: LoginFormProps) {
    const router = useRouter();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login({ email, password });

            if (inModal && onSuccess) {
                onSuccess();
            } else {
                router.push('/');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        setIsLoading(true);

        try {
            // Get the authorization URL from the backend
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://the-spreadsheet-v0-production.up.railway.app';
            const response = await fetch(`${API_BASE_URL}/api/v1/auth/google/authorize`);

            if (!response.ok) {
                throw new Error('Failed to get authorization URL');
            }

            const data = await response.json();

            // Redirect to Google's authorization URL
            if (data.authorization_url) {
                window.location.href = data.authorization_url;
                // Reset loading state after a delay in case redirect is blocked
                // (e.g., by browser extensions or security settings)
                setTimeout(() => {
                    setIsLoading(false);
                }, 3000);
            } else {
                throw new Error('No authorization URL received');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to initiate Google sign-in');
            setIsLoading(false);
        }
    };

    return (
        <div className='auth-form-container'>
            <div className='auth-form-card'>
                {/* Logo */}
                {!inModal && (
                    <div className='auth-form-logo'>
                        <svg width='48' height='48' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                            <rect x='3' y='3' width='7' height='7' stroke='url(#login-gradient1)' strokeWidth='2' fill='rgba(96, 165, 250, 0.1)'/>
                            <rect x='3' y='13.5' width='7' height='7' stroke='url(#login-gradient1)' strokeWidth='2' fill='rgba(96, 165, 250, 0.1)'/>
                            <rect x='13.5' y='3' width='7' height='7' stroke='url(#login-gradient2)' strokeWidth='2' fill='rgba(192, 132, 252, 0.1)'/>
                            <rect x='13.5' y='13.5' width='7' height='7' stroke='url(#login-gradient2)' strokeWidth='2' fill='rgba(192, 132, 252, 0.1)'/>
                            <defs>
                                <linearGradient id='login-gradient1' x1='0%' y1='0%' x2='100%' y2='100%'>
                                    <stop offset='0%' style={{stopColor: '#60a5fa'}}/>
                                    <stop offset='100%' style={{stopColor: '#a78bfa'}}/>
                                </linearGradient>
                                <linearGradient id='login-gradient2' x1='0%' y1='0%' x2='100%' y2='100%'>
                                    <stop offset='0%' style={{stopColor: '#c084fc'}}/>
                                    <stop offset='100%' style={{stopColor: '#a78bfa'}}/>
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                )}

                {/* Header */}
                {!inModal && (
                    <div className='auth-form-header'>
                        <h1 className='auth-form-title'>WELCOME BACK</h1>
                        <p className='auth-form-subtitle'>Sign in to access your account</p>
                    </div>
                )}

                {/* OAuth Section */}
                <div className='auth-oauth-section'>
                    <button
                        type='button'
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className='auth-oauth-button'
                    >
                        <svg className='auth-oauth-icon' viewBox='0 0 24 24'>
                            <path fill='currentColor' d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'/>
                            <path fill='currentColor' d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'/>
                            <path fill='currentColor' d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'/>
                            <path fill='currentColor' d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'/>
                        </svg>
                        Continue with Google
                    </button>
                </div>

                {/* Divider */}
                <div className='auth-divider'>
                    <div className='auth-divider-line'></div>
                    <span className='auth-divider-text'>Or continue with email</span>
                    <div className='auth-divider-line'></div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className='auth-form'>
                    {/* Error Message */}
                    {error && (
                        <div className='auth-error' role='alert'>
                            {error}
                        </div>
                    )}

                    {/* Email Field */}
                    <div className='auth-form-group'>
                        <label htmlFor='email' className='auth-form-label'>
                            Email Address
                        </label>
                        <input
                            id='email'
                            type='email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className='auth-form-input'
                            placeholder='your@email.com'
                            required
                            autoComplete='email'
                            disabled={isLoading}
                        />
                    </div>

                    {/* Password Field */}
                    <div className='auth-form-group'>
                        <label htmlFor='password' className='auth-form-label'>
                            Password
                        </label>
                        <input
                            id='password'
                            type='password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className='auth-form-input'
                            placeholder='••••••••'
                            required
                            autoComplete='current-password'
                            disabled={isLoading}
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type='submit'
                        className='auth-form-button'
                        disabled={isLoading}
                    >
                        {isLoading ? 'SIGNING IN...' : 'SIGN IN'}
                    </button>

                    {/* Register Link */}
                    {!inModal && (
                        <p className='auth-form-footer'>
                            Don&apos;t have an account?{' '}
                            <Link href='/signup' className='auth-form-link'>
                                Create one
                            </Link>
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
}
