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
    banned: boolean;
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
        banned: boolean;
    };
}

export interface PostsResponse {
    posts: Post[];
    hasMore: boolean;
}


export const DataRequests = {
    // Requêtes pour le profil utilisateur
    async getUserProfile(username: string): Promise<User> {
        const response = await AuthService.authenticatedFetch(`/profile/${username}`);
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
        const username = AuthService.getUsername();
        console.log(username);
        if (!username) {
            throw new Error('Utilisateur non connecté');
        }
        return this.getUserProfile(username);
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


    async getUserProfileByUsername(username: string): Promise<User> {
        const response = await AuthService.authenticatedFetch(`/profile/${username}`);
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des utilisateurs');
        }
        const data = await response.json();
        return data;
    },

    async updateUser(userId: number, userData: { username: string; name: string; bio: string | null, banned: boolean }): Promise<User> {
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
    },
    async updateSetting (userId: number, reloading: string): Promise<User> {
        const response = await AuthService.authenticatedFetch(`/update/reload/${userId}`, {
            method: 'POST',
            body: JSON.stringify({ reloading })
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erreur lors de la mise à jour des paramètres');
        }
        const data = await response.json();
        return data.user;
    },

    async deletePost(postId: number): Promise<void> {
        const response = await AuthService.authenticatedFetch(`/posts/${postId}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error('Erreur lors de la suppression du post');
        }
    }
}; 
