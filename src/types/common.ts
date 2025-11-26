// ============================================
// COMMON TYPES
// Shared type definitions used across the application
// ============================================

/**
 * Navigation link structure
 */
export interface NavLink {
    href: string;
    label: string;
}

/**
 * Page header structure
 */
export interface PageHeaderProps {
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
}

/**
 * Footer section with navigation links
 */
export interface FooterSection {
    title: string;
    links: Array<{
        href: string;
        label: string;
    }>;
}

/**
 * Generic link structure
 */
export interface Link {
    href: string;
    label: string;
}