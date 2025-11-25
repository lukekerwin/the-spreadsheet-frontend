/**
 * Search-related API types
 */

export interface SearchResultItem {
    id: string | number;
    name: string;
}

export interface SearchResult {
    results: SearchResultItem[];
}
