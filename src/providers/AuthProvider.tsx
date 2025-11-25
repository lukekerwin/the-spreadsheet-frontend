'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { setAuthToken, removeAuthToken, hasAuthToken } from '@/lib/auth/tokens';
import { login as loginApi, register as registerApi, logout as logoutApi, getCurrentUser, type User, type LoginRequest, type RegisterRequest } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/errors';
import AuthModal from '@/components/auth/AuthModal';
import { useNotification } from './NotificationProvider';

// ============================================
// TYPE DEFINITIONS
// ============================================

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (data: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    openAuthModal: (action?: () => void) => void;
    closeAuthModal: () => void;
}

// ============================================
// CONTEXT CREATION
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// PROVIDER COMPONENT
// ============================================

interface AuthProviderProps {
    children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
    const { addNotification } = useNotification();

    /**
     * Open auth modal and optionally store a pending action to execute after login
     */
    const openAuthModal = useCallback((action?: () => void) => {
        setIsAuthModalOpen(true);
        if (action) {
            setPendingAction(() => action);
        }
    }, []);

    /**
     * Close auth modal and execute pending action if user is authenticated
     */
    const closeAuthModal = useCallback(() => {
        setIsAuthModalOpen(false);

        // Execute pending action if user is now authenticated
        if (user && pendingAction) {
            pendingAction();
            setPendingAction(null);
        }
    }, [user, pendingAction]);

    /**
     * Fetch current user information
     */
    const refreshUser = useCallback(async () => {
        if (!hasAuthToken()) {
            setUser(null);
            setIsLoading(false);
            return;
        }

        try {
            const userData = await getCurrentUser();
            setUser(userData);
        } catch (error) {
            console.error('Failed to fetch user:', error);
            removeAuthToken();
            setUser(null);

            // Notify user about session expiration/logout
            if (error instanceof ApiError && error.isAuthError()) {
                addNotification('Your session has expired. Please log in again.', 'warning');
            } else {
                addNotification('Failed to verify your session.', 'error');
            }
        } finally {
            setIsLoading(false);
        }
    }, [addNotification]);

    /**
     * Login user
     */
    const login = useCallback(async (data: LoginRequest) => {
        try {
            const response = await loginApi(data);
            setAuthToken(response.access_token);

            // Fetch user data after successful login
            const userData = await getCurrentUser();
            setUser(userData);
        } catch (error) {
            removeAuthToken();
            setUser(null);
            throw error;
        }
    }, []);

    /**
     * Register new user
     */
    const register = useCallback(async (data: RegisterRequest) => {
        try {
            // Register the user
            await registerApi(data);

            // Auto-login after successful registration
            await login({
                email: data.email,
                password: data.password,
            });
        } catch (error) {
            removeAuthToken();
            setUser(null);
            throw error;
        }
    }, [login]);

    /**
     * Logout user
     */
    const logout = useCallback(async () => {
        try {
            await logoutApi();
            addNotification('You have been logged out.', 'info');
        } catch (error) {
            console.error('Logout error:', error);
            addNotification('You have been logged out.', 'info');
        } finally {
            removeAuthToken();
            setUser(null);
        }
    }, [addNotification]);

    // Initialize auth state on mount
    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        openAuthModal,
        closeAuthModal,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={closeAuthModal}
            />
        </AuthContext.Provider>
    );
}

// ============================================
// CUSTOM HOOK
// ============================================

/**
 * Hook to access auth context
 * Must be used within AuthProvider
 */
export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }

    return context;
}
