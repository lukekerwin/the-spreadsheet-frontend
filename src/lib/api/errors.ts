/**
 * Centralized API error handling
 * Provides consistent error handling across all API operations
 */

/**
 * Custom error class for API errors
 * Includes HTTP status code and API error details
 */
export class ApiError extends Error {
    constructor(
        public status: number,
        message: string,
        public detail?: unknown,
    ) {
        super(message);
        this.name = 'ApiError';
    }

    /**
     * Check if this is a network error (no connection)
     */
    isNetworkError(): boolean {
        return this.status === 0;
    }

    /**
     * Check if this is an authentication error
     */
    isAuthError(): boolean {
        return this.status === 401;
    }

    /**
     * Check if this is an authorization error
     */
    isAuthorizationError(): boolean {
        return this.status === 403;
    }

    /**
     * Check if this is a not found error
     */
    isNotFoundError(): boolean {
        return this.status === 404;
    }

    /**
     * Check if this is a server error
     */
    isServerError(): boolean {
        return this.status >= 500;
    }
}

/**
 * Handle API response errors consistently
 * Extracts error message from API response or provides fallback
 */
export async function handleResponseError(
    response: Response,
    fallbackMessage: string,
): Promise<never> {
    let errorDetail: unknown;

    try {
        errorDetail = await response.json();
    } catch {
        errorDetail = response.statusText;
    }

    const message = extractErrorMessage(errorDetail, fallbackMessage);

    throw new ApiError(response.status, message, errorDetail);
}

/**
 * Extract human-readable error message from API error response
 */
export function extractErrorMessage(
    errorData: unknown,
    fallbackMessage: string,
): string {
    if (!errorData) {
        return fallbackMessage;
    }

    // Handle various API error response formats
    if (typeof errorData === 'string') {
        return errorData;
    }

    if (typeof errorData === 'object') {
        const obj = errorData as Record<string, unknown>;

        // FastAPI error format: { detail: string | array }
        if (obj.detail) {
            if (typeof obj.detail === 'string') {
                return obj.detail;
            }
            if (Array.isArray(obj.detail)) {
                // Pydantic validation errors
                const messages = obj.detail
                    .map((err: unknown) => {
                        if (typeof err === 'object' && err !== null && 'msg' in err) {
                            return (err as Record<string, unknown>).msg;
                        }
                        return String(err);
                    })
                    .join(', ');
                return messages || fallbackMessage;
            }
        }

        // Generic error message field
        if (obj.message && typeof obj.message === 'string') {
            return obj.message;
        }

        // Error field
        if (obj.error && typeof obj.error === 'string') {
            return obj.error;
        }
    }

    return fallbackMessage;
}
