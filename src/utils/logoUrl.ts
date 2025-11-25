/**
 * Utility for generating team logo URLs from S3
 * Handles URL encoding and provides fallback support
 */

const S3_BUCKET_BASE = 'https://spreadsheet-hockey-logos.s3.us-east-1.amazonaws.com';

/**
 * Generate S3 URL for a team logo
 * Automatically encodes the team name for URL compatibility
 *
 * @param teamName - The team name (e.g., "Philadelphia Flyers")
 * @returns The S3 URL for the team logo, or a default logo if team name is missing
 *
 * @example
 * getLogoUrl("Philadelphia Flyers")
 * // Returns: https://spreadsheet-hockey-logos.s3.us-east-1.amazonaws.com/Philadelphia%20Flyers.png
 *
 * @example
 * getLogoUrl(null)
 * // Returns: /icon_full.svg
 */
export function getLogoUrl(teamName: string | null | undefined): string {
    // Return default logo if team name is missing
    if (!teamName) {
        return '/icon_full.svg';
    }

    // Encode the team name and append .png extension
    const encodedTeamName = encodeURIComponent(teamName);
    return `${S3_BUCKET_BASE}/${encodedTeamName}.png`;
}

/**
 * Validate if a logo URL is accessible
 * Makes a HEAD request to check without loading the full image
 *
 * @param url - The URL to validate
 * @returns Promise resolving to true if accessible, false otherwise
 */
export async function validateLogoUrl(url: string): Promise<boolean> {
    if (!url) return false;

    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch {
        return false;
    }
}
