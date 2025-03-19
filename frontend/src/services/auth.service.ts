const API_URL = 'http://localhost:8080';

export interface User {
    id: number;
    email: string;
    username: string;
    name: string;
    avatar?: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

class AuthService {
    private static TOKEN_KEY = 'auth_token';
    private static USER_KEY = 'user';

    static async login(email: string, password: string): Promise<AuthResponse> {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erreur lors de la connexion');
        }

        const data = await response.json();
        this.setToken(data.token);
        this.setUser(data.user);
        return data;
    }

    static async register(userData: {
        name: string;
        username: string;
        email: string;
        password: string;
        birthDate: string;
    }): Promise<AuthResponse> {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erreur lors de l\'inscription');
        }

        const data = await response.json();
        this.setToken(data.token);
        this.setUser(data.user);
        return data;
    }

    static async verifyToken(): Promise<User | null> {
        const token = this.getToken();
        if (!token) return null;

        try {
            const response = await fetch(`${API_URL}/verify-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token }),
            });

            if (!response.ok) {
                this.logout();
                return null;
            }

            const data = await response.json();
            this.setUser(data.user);
            return data.user;
        } catch (error) {
            this.logout();
            return null;
        }
    }

    static async logout(): Promise<void> {
        const token = this.getToken();
        if (token) {
            try {
                await fetch(`${API_URL}/logout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ token }),
                });
            } catch (error) {
                console.error('Erreur lors de la déconnexion:', error);
            }
        }
        
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
    }

    static getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    static setToken(token: string): void {
        localStorage.setItem(this.TOKEN_KEY, token);
    }

    static getUser(): User | null {
        const userStr = localStorage.getItem(this.USER_KEY);
        return userStr ? JSON.parse(userStr) : null;
    }

    static setUser(user: User): void {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }

    static isAuthenticated(): boolean {
        return !!this.getToken() && !!this.getUser();
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