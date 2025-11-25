const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiClient = {
    async get<T>(endpoint: string): Promise<T> {
        // Get JWT token from localStorage
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        // Add Authorization header if token exists
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/api/v1${endpoint}`, {
            credentials: 'include', // Include cookies for auth
            headers,
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        return response.json();
    },
};
