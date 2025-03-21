const API_URL = 'http://localhost:8080';

interface ApiRequestConfig extends RequestInit {
    params?: Record<string, string | number>;
}

interface ApiResponse<T = any> {
    data: T;
    error?: string;
}

export class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = 'ApiError';
    }
}

async function apiRequest<T>(endpoint: string, config: ApiRequestConfig = {}): Promise<ApiResponse<T>> {
    try {
        const { params, headers: customHeaders = {}, ...restConfig } = config;
        
        const headers = new Headers(customHeaders);
        
        const token = localStorage.getItem('auth_token');
        console.log(token);
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }

        if (restConfig.method && ['POST', 'PUT', 'PATCH'].includes(restConfig.method)) {
            headers.set('Content-Type', 'application/json');
        }

        let url = `${API_URL}${endpoint}`;
        if (params) {
            const searchParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                searchParams.append(key, value.toString());
            });
            url += `?${searchParams.toString()}`;
        }

        const response = await fetch(url, {
            ...restConfig,
            headers
        });

        const data = await response.json();

        if (!response.ok) {
            throw new ApiError(response.status, data.errors?.content || 'Une erreur est survenue');
        }

        return { data };
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, error instanceof Error ? error.message : 'Une erreur est survenue');
    }
}

// API Posts
export const PostsApi = {
    getAll: (page: number = 1) => 
        apiRequest('/posts', { params: { page } }),

    create: (content: string, userId: number) =>
        apiRequest('/posts', {
            method: 'POST',
            body: JSON.stringify({ content, id: userId })
        }),

    getByUser: (userId: number, page: number = 1) =>
        apiRequest(`/user/${userId}/posts`, { params: { page } })
};

// API Auth
export const AuthApi = {
    login: (email: string, password: string) =>
        apiRequest('/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        }),

    register: (userData: {
        email: string;
        password: string;
        username: string;
        name: string;
    }) =>
        apiRequest('/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        }),

    verifyToken: () =>
        apiRequest('/verify-token', {
            method: 'GET'
        })
};

// API Users
export const UsersApi = {
    getById: (userId: number) =>
        apiRequest(`/user/${userId}`),

    getCurrentUser: () =>
        apiRequest('/user/me')
};

export default {
    posts: PostsApi,
    auth: AuthApi,
    users: UsersApi
}; 