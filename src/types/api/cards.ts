export interface CardItem {
    label: string;
    value: string | number;
}

export interface CardBanner {
    overallPercentile: number;
    tier: string;
    logoPath: string;
}

export interface CardHeader {
    title: string;
    subtitle: Array<CardItem>;
}

export interface CardProps {
    header: CardHeader;
    banner: CardBanner;
    headerStats: Array<CardItem>;
    ratings: Array<CardItem>;
    stats: Array<CardItem>;
    teamColor: string;
}

/**
 * Card API Response
 * 
 * Paginated response for card data (players, goalies, teams).
 * Uses camelCase following REST API conventions.
 */
export interface CardResponse {
    data: Array<CardProps>;
    pageNumber: number;
    pageSize: number;
    total: number;
    totalPages: number;
    lastUpdated: string;
}