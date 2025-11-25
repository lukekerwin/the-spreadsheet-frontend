'use client';

/**
 * Notification Container Component
 * Displays all active notifications on screen
 */

import { useNotification } from '@/providers/NotificationProvider';
import './notification-container.css';

export default function NotificationContainer() {
    const { notifications, removeNotification } = useNotification();

    if (notifications.length === 0) {
        return null;
    }

    return (
        <div className='notification-container' role='region' aria-live='polite' aria-label='Notifications'>
            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    className={`notification notification-${notification.type}`}
                    role='alert'
                >
                    <div className='notification-content'>
                        <p className='notification-message'>{notification.message}</p>
                    </div>
                    <button
                        className='notification-close'
                        onClick={() => removeNotification(notification.id)}
                        aria-label='Dismiss notification'
                        type='button'
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
}
