'use client';

/**
 * Error Boundary Component
 * Catches unhandled errors in child components and displays a fallback UI
 * Prevents entire app from crashing due to a single component error
 */

import { ReactNode, Component, ErrorInfo } from 'react';
import './error-boundary.css';

interface ErrorBoundaryProps {
    children: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);

        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return { hasError: true };
    }

    componentDidCatch(_error: Error, errorInfo: ErrorInfo) {
        // Log error details for debugging
        console.error('Error Boundary caught an error:', _error, errorInfo);

        this.setState({
            error: _error,
            errorInfo,
        });
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className='error-boundary-container'>
                    <div className='error-boundary-content'>
                        <h1 className='error-boundary-title'>Something went wrong</h1>
                        <p className='error-boundary-message'>
                            We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
                        </p>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className='error-boundary-details'>
                                <summary className='error-boundary-summary'>Error details (development only)</summary>
                                <pre className='error-boundary-error'>
                                    {this.state.error.toString()}
                                    {'\n\n'}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}

                        <div className='error-boundary-actions'>
                            <button
                                className='error-boundary-button error-boundary-button-primary'
                                onClick={() => window.location.href = '/'}
                            >
                                Go to Home
                            </button>
                            <button
                                className='error-boundary-button error-boundary-button-secondary'
                                onClick={this.handleReset}
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
