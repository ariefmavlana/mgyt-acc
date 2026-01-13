import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
    withCredentials: true, // Crucial for httpOnly cookies
    headers: {
        'Content-Type': 'application/json',
    },
});


let csrfPromise: Promise<string> | null = null;

const getCsrfToken = async () => {
    if (csrfPromise) return csrfPromise;
    csrfPromise = (async () => {
        try {
            const { data } = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/csrf-token`,
                { withCredentials: true }
            );
            return data.csrfToken;
        } catch (e) {
            console.error('Failed to fetch CSRF token', e);
            throw e;
        } finally {
            csrfPromise = null;
        }
    })();
    return csrfPromise;
};

// Interceptor to inject CSRF token
api.interceptors.request.use(async (config) => {
    const method = config.method?.toLowerCase() || 'get';

    // Check if method is unsafe
    if (['post', 'put', 'patch', 'delete'].includes(method)) {
        // If we don't have a token in headers, fetch it
        if (!api.defaults.headers.common['x-csrf-token']) {
            try {
                const token = await getCsrfToken();
                api.defaults.headers.common['x-csrf-token'] = token;
                if (config.headers) {
                    config.headers['x-csrf-token'] = token;
                }
            } catch (_error) {
                // Proceed without token? Likely to fail, but let the error handler catch 403
                console.warn("Proceeding request without CSRF token due to fetch failure");
            }
        } else {
            // Ensure it is attached to this specific request config if strictly needed
            if (config.headers && !config.headers['x-csrf-token']) {
                config.headers['x-csrf-token'] = api.defaults.headers.common['x-csrf-token'];
            }
        }
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
                // Force fresh fetch
                const token = await getCsrfToken();
                api.defaults.headers.common['x-csrf-token'] = token;
                originalRequest.headers['x-csrf-token'] = token;
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
