const API_URL = 'http://localhost:8080';
import { useNavigate } from 'react-router-dom';

export interface User {
    id: number;
    email: string;
    username: string;
    name: string;
    avatar?: string;
    joinedDate: string;
    birthdate: string | null;
    bio: string | null;
}

export interface AuthResponse {
    token: string;
    user: {
        id: number;
        email: string;
        username: string;
        name: string;
        avatar?: string;
    };
}

class AuthService {
    private static TOKEN_KEY = 'auth_token';
    private static USER_ID_KEY = 'user_id';

    public static async authenticatedFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
        const token = this.getToken();
        const headers = new Headers(options.headers || {});
        
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        headers.set('Content-Type', 'application/json');

        return fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers
        });
    }

    static async login(email: string, password: string): Promise<AuthResponse> {
        this.clearAuthData();

        const response = await this.authenticatedFetch('/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            throw new Error('Identifiants invalides');
        }

        const data = await response.json();
        this.setAuthData(data.token, data.user.id);
        localStorage.setItem('user', JSON.stringify(data.user));
        return data;
    }

    static async admin(email: string, password: string): Promise<AuthResponse> {
        this.clearAuthData();

        const response = await this.authenticatedFetch('/admin', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 403) {
                throw new Error(data.error || 'Vous n\'avez pas les permissions nécessaires');
            } else if (response.status === 401) {
                throw new Error('Identifiants invalides');
            } else {
                throw new Error(data.error || 'Une erreur est survenue');
            }
        }

        this.setAuthData(data.token, data.user.id);
        return data;
    }

    static async register(userData: {
        email: string;
        password: string;
        username: string;
        name: string;
    }): Promise<AuthResponse> {
        this.clearAuthData();

        const response = await this.authenticatedFetch('/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Erreur lors de l\'inscription');
        }

        const data = await response.json();
        this.setAuthData(data.token, data.user.id);
        return data;
    }

    static async verifyToken(): Promise<User | null> {
        const token = this.getToken();
        if (!token) {
            this.clearAuthData();
            return null;
        }

        try {
            const response = await this.authenticatedFetch('/verify-token', {
                method: 'POST',
                body: JSON.stringify({ token }),
            });

            if (!response.ok) {
                this.clearAuthData();
                return null;
            }

            const data = await response.json();
            this.setUserId(data.user.id);
            return data.user;
        } catch (error) {
            this.clearAuthData();
            return null;
        }
    }

    static async logout(): Promise<void> {
        const token = this.getToken();
        if (token) {
            try {
                localStorage.removeItem(this.TOKEN_KEY);
                localStorage.removeItem(this.USER_ID_KEY);
                localStorage.removeItem('user');
                window.location.href = 'http://localhost:8090/login';
                alert('Vous êtes déconnecté');
            } catch (error) {
                console.error('Erreur lors de la déconnexion:', error);
            }
        }
        
        this.clearAuthData();
    }

    private static setAuthData(token: string, userId: number): void {
        localStorage.setItem(this.TOKEN_KEY, token);
        localStorage.setItem(this.USER_ID_KEY, userId.toString());
    }

    private static clearAuthData(): void {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_ID_KEY);
    }

    static getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    private static setUserId(userId: number): void {
        localStorage.setItem(this.USER_ID_KEY, userId.toString());
    }

    static getUserId(): number | null {
        const userId = localStorage.getItem(this.USER_ID_KEY);
        return userId ? parseInt(userId) : null;
    }

    static getUsername(): string | null {
        const user = localStorage.getItem('user');
        if (user === null) {
            return null;
        }
        const userData = JSON.parse(user);
        return userData.username;
    }

    static async getUserData(): Promise<User> {
        const userId = this.getUserId();
        if (!userId) {
            throw new Error('Utilisateur non connecté');
        }

        const response = await this.authenticatedFetch(`/user/${userId}`);
        
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des données utilisateur');
        }
        
        const data = await response.json();
        return data.user;
    }

    static isAuthenticated(): boolean {
        return !!this.getToken();
    }

    static getAuthHeaders(): HeadersInit {
        const token = this.getToken();
        return token ? {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        } : {
            'Content-Type': 'application/json',
        };
    }
}

export default AuthService; 