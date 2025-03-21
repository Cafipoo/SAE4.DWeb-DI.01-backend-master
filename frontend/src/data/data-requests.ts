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

const API_URL = 'http://localhost:8080';

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

    // Requête pour le profil connecté
    async getCurrentUserProfile(): Promise<User> {
        const userId = AuthService.getUserId();
        if (!userId) {
            throw new Error('Utilisateur non connecté');
        }
        return this.getUserProfile(userId);
    }
}; 