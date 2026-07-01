// Smart CBC Report Analysis and Health Suggestion System
// Compiled API Client Wrapper

const getApiBaseUrl = () => {
    const customUrl = localStorage.getItem('CUSTOM_API_URL');
    if (customUrl) return customUrl;
    
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '') {
        return 'http://127.0.0.1:5000/api';
    }
    return 'https://smart-cbc-backend.onrender.com/api';
};

const API_BASE_URL = getApiBaseUrl();

const API = {
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        const token = localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    },

    async request(endpoint, options) {
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

    async get(endpoint) {
        return this.request(endpoint, {
            method: 'GET',
            headers: this.getHeaders()
        });
    },

    async post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(body)
        });
    },

    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE',
            headers: this.getHeaders()
        });
    }
};

window.API = API;
