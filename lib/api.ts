import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
    withCredentials: true, // Crucial for httpOnly cookies
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to inject CSRF token from cookies
api.interceptors.request.use((config) => {
    if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
        // In a real browser env with withCredentials: true, 
        // we can try to get the token from a meta tag or a specific endpoint if not already in headers
        // For now, we rely on the backend setting it in a cookie that the browser sends, 
        // but the double-csrf library usually expects it in a header too.
    }
    return config;
});

// Interceptor to handle token refresh and CSRF errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Handle CSRF errors (status 403 with specific message)
        if (error.response?.status === 403 && error.response?.data?.message === 'Invalid CSRF token' && !originalRequest._csrfRetry) {
            originalRequest._csrfRetry = true;
            try {
                const { data } = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/csrf-token`,
                    { withCredentials: true }
                );
                api.defaults.headers.common['x-csrf-token'] = data.csrfToken;
                originalRequest.headers['x-csrf-token'] = data.csrfToken;
                return api(originalRequest);
            } catch (csrfError) {
                return Promise.reject(csrfError);
            }
        }

        // If 401 and not already retrying
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/login')) {
            originalRequest._retry = true;

            try {
                await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/auth/refresh`,
                    {},
                    { withCredentials: true }
                );
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh token failed
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
