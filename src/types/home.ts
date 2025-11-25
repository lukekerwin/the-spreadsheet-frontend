// ============================================
// HOME PAGE TYPES
// Type definitions specific to the home page
// ============================================

/**
 * Feature card structure for the features section
 */
export interface FeatureCard {
    icon: React.ReactNode;
    title: string;
    description: string;
}

/**
 * Statistic display structure
 */
export interface Stat {
    value: string;
    label: string;
}
