"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const api = axios_1.default.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
    withCredentials: true, // Crucial for httpOnly cookies
    headers: {
        'Content-Type': 'application/json',
    },
});
// Interceptor to handle token refresh automatically
api.interceptors.response.use((response) => response, async (error) => {
    var _a, _b;
    const originalRequest = error.config;
    // If 401 and not already retrying
    if (((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 401 && !originalRequest._retry && !((_b = originalRequest.url) === null || _b === void 0 ? void 0 : _b.includes('/auth/login'))) {
        originalRequest._retry = true;
        try {
            await axios_1.default.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/auth/refresh`, {}, { withCredentials: true });
            return api(originalRequest);
        }
        catch (refreshError) {
            // Refresh token failed
            return Promise.reject(refreshError);
        }
    }
    return Promise.reject(error);
});
exports.default = api;
