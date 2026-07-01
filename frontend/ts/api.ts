// Smart CBC Report Analysis and Health Suggestion System
// Client API Wrapper

const getApiBaseUrl = (): string => {
    const customUrl = localStorage.getItem('CUSTOM_API_URL');
    if (customUrl) return customUrl;
    
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '') {
        return 'http://127.0.0.1:5000/api';
    }
    return 'https://smart-cbc-backend.onrender.com/api';
};

const API_BASE_URL = getApiBaseUrl();

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: Record<string, string>;
}

export const API = {
    /**
     * Get headers for requests, attaching JWT token if available.
     */
    getHeaders(): HeadersInit {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };
        const token = localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    },

    /**
     * Perform an HTTP fetch request.
     */
    async request<T = any>(endpoint: string, options: RequestInit): Promise<ApiResponse<T>> {
        const url = `${API_BASE_URL}${endpoint}`;
        try {
            const response = await fetch(url, options);
            const data = await response.json().catch(() => ({}));

            if (response.ok) {
                return {
                    success: true,
                    data: data
                };
            } else {
                return {
                    success: false,
                    message: data.message || 'An error occurred during the request.',
                    errors: data.errors
                };
            }
        } catch (error) {
            console.error('API Request Error:', error);
            return {
                success: false,
                message: 'Unable to connect to the server. Please ensure the backend is running.'
            };
        }
    },

    /**
     * Perform GET request.
     */
    async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'GET',
            headers: this.getHeaders()
        });
    },

    /**
     * Perform POST request.
     */
    async post<T = any>(endpoint: string, body: any): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(body)
        });
    },

    /**
     * Perform DELETE request.
     */
    async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'DELETE',
            headers: this.getHeaders()
        });
    }
};

// Also export to global window for index.html loading scripts directly
(window as any).API = API;
