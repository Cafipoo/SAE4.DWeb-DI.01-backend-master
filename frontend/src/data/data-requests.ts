import AuthService from '../services/auth.service';

export interface User {
    id: number;
    username: string;
    name: string;
    email: string;
    joined_date: string;
    avatar: string | null;
    cover: string | null;
    bio: string | null;
}

export interface AdminApiResponse {
    users: User[];
    total_users: number;
    current_page: number;
    max_pages: number;
    users_per_page: number;
    previous_page: number | null;
    next_page: number | null;
}

export interface Post {
    id: number;
    content: string;
    created_at: string;
    author?: {
        name: string;
        username: string;
        avatar: string;
    };
}

export interface PostsResponse {
    posts: Post[];
    hasMore: boolean;
}


export const DataRequests = {
    // Requêtes pour le profil utilisateur
    async getUserProfile(userId: number): Promise<User> {
        const response = await AuthService.authenticatedFetch(`/user/${userId}`);
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des données utilisateur');
        }
        const data = await response.json();
        return data;
    },

    // Requêtes pour les posts
    async getUserPosts(userId: number, page: number): Promise<PostsResponse> {
        const response = await AuthService.authenticatedFetch(`/user/${userId}/posts?page=${page}`);
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des posts');
        }
        const data = await response.json();
        return {
            posts: data.posts,
            hasMore: data.posts.length > 0
        };
    },

    async getAllPosts(page: number): Promise<PostsResponse> {
        const response = await AuthService.authenticatedFetch(`/posts?page=${page}`);
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des posts');
        }
        const data = await response.json();
        return {
            posts: data.posts,
            hasMore: data.posts.length > 0
        };
    },

    async getCurrentUserProfile(): Promise<User> {
        const userId = AuthService.getUserId();
        if (!userId) {
            throw new Error('Utilisateur non connecté');
        }
        return this.getUserProfile(userId);
    },

    async createPost(content: string): Promise<Post> {
        const userId = AuthService.getUserId();
        if (!userId) {
            throw new Error('Utilisateur non connecté');
        }
        const response = await AuthService.authenticatedFetch(`/posts/${userId}`, {
            method: 'POST',
            body: JSON.stringify({ content })
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erreur lors de la création du post');
        }
        const data = await response.json();
        return data;
    },

    async getAdminUsers(page: number): Promise<AdminApiResponse> {
        const response = await AuthService.authenticatedFetch(`/users?page=${page}`);
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des utilisateurs');
        }
        const data = await response.json();
        return data;
    },

    async updateUser(userId: number, userData: { username: string; name: string; bio: string | null }): Promise<User> {
        const response = await AuthService.authenticatedFetch(`/update/user/${userId}`, {
            method: 'POST',
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erreur lors de la mise à jour de l\'utilisateur');
        }

        const data = await response.json();
        return data.user;
    }
}; 