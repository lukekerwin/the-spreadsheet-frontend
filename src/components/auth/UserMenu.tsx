'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User as UserIcon, LogOut, UserCircle } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';

import './user-menu.css';

export default function UserMenu() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const toggleMenu = () => setIsOpen(!isOpen);
    const closeMenu = () => setIsOpen(false);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                isOpen &&
                menuRef.current &&
                !menuRef.current.contains(e.target as Node) &&
                !buttonRef.current?.contains(e.target as Node)
            ) {
                closeMenu();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Close menu on Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                closeMenu();
                buttonRef.current?.focus();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen]);

    const handleLogout = async () => {
        closeMenu();
        await logout();
        router.push('/login');
    };

    // Get user display name or email
    const displayName = user?.first_name
        ? `${user.first_name}${user.last_name ? ' ' + user.last_name : ''}`
        : user?.email.split('@')[0] || 'User';

    return (
        <div className='user-menu-container'>
            {/* Menu Button */}
            <button
                ref={buttonRef}
                className='user-menu-button'
                onClick={toggleMenu}
                aria-label='User menu'
                aria-expanded={isOpen}
            >
                <UserIcon size={20} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div
                    ref={menuRef}
                    className='user-menu-dropdown'
                    role='menu'
                >
                    {/* User Info */}
                    <div className='user-menu-header'>
                        <p className='user-menu-email'>{user?.email}</p>
                        {user?.first_name && (
                            <p className='user-menu-display-name'>
                                {user.first_name} {user.last_name}
                            </p>
                        )}
                    </div>

                    {/* Menu Items */}
                    <Link
                        href='/profile'
                        className='user-menu-item'
                        onClick={closeMenu}
                        role='menuitem'
                    >
                        <UserCircle size={18} />
                        <span>Profile</span>
                    </Link>

                    <button
                        className='user-menu-item user-menu-logout'
                        onClick={handleLogout}
                        role='menuitem'
                    >
                        <LogOut size={18} />
                        <span>Sign Out</span>
                    </button>
                </div>
            )}
        </div>
    );
}
