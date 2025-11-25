'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

/**
 * Notification types and context
 * Provides simple toast-like notifications to the app
 */

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
    id: string;
    type: NotificationType;
    message: string;
    duration?: number; // in ms, 0 = indefinite
}

interface NotificationContextType {
    notifications: Notification[];
    addNotification: (message: string, type?: NotificationType, duration?: number) => string;
    removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const addNotification = useCallback(
        (message: string, type: NotificationType = 'info', duration = 5000) => {
            const id = `notification-${Date.now()}-${Math.random()}`;

            setNotifications((prev) => [
                ...prev,
                { id, type, message, duration },
            ]);

            // Auto-remove notification after duration
            if (duration > 0) {
                setTimeout(() => {
                    setNotifications((prev) =>
                        prev.filter((notification) => notification.id !== id),
                    );
                }, duration);
            }

            return id;
        },
        [],
    );

    const removeNotification = useCallback((id: string) => {
        setNotifications((prev) => prev.filter((notification) => notification.id !== id));
    }, []);

    return (
        <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
            {children}
        </NotificationContext.Provider>
    );
}

/**
 * Hook to access notification context
 */
export function useNotification(): NotificationContextType {
    const context = useContext(NotificationContext);

    if (!context) {
        throw new Error('useNotification must be used within NotificationProvider');
    }

    return context;
}
