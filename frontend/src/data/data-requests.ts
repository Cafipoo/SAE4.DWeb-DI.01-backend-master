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
    location: string | null;
    siteWeb: string | null;
    banned: boolean;
    is_banned_by_current_user: boolean;
    followers_count: number;
    following_count: number;
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
    media: string[];
    censored: boolean;
    author: {
        id: number;
        name: string;
        username: string;
        avatar: string;
        banned: boolean;
        lecture: boolean;
    };
    likes_count: number;
    liked_by: number[];
    isFollowed?: boolean;
    reposts?: number;
    replies?: number;
    comments?: PostInteraction[];
}

export interface PostsResponse {
    posts: Post[];
    hasMore: boolean;
    pinned_post?: Post | null;
}

export interface PostInteraction {
    id: number;
    comments: string | null;
    created_at: string | null;
    user: {
        id: number;
        name: string;
        username: string;
        avatar: string;
    };
}

interface BannedUser {
    id: number;
    username: string;
    name: string;
    avatar: string;
}

export interface AdminPost extends Post {
    censored: boolean;
}

export interface AdminPostsResponse {
    posts: AdminPost[];
    previous_page: number | null;
    next_page: number | null;
    total_posts: number;
    current_page: number;
    max_pages: number;
}

export interface SearchFilters {
    dateRange: string;
    contentType: string;
    userId?: number;
}

export const DataRequests = {
    // Requêtes pour le profil utilisateur
    async getUserProfile(username: string): Promise<User> {
        try {
            const response = await AuthService.authenticatedFetch(`/profile/${username}`);
            const responseText = await response.text();

            // Extraire la partie JSON valide
            const jsonMatch = responseText.match(/^\{.*\}/);
            if (!jsonMatch) {
                throw new Error('Aucun JSON valide trouvé dans la réponse');
            }
            const jsonText = jsonMatch[0];

            if (!response.ok) {
                let errorData;
                try {
                    errorData = JSON.parse(jsonText);
                    throw new Error(errorData.error || 'Erreur lors de la récupération des données utilisateur');
                } catch (e) {
                    throw new Error('Réponse invalide du serveur: ' + jsonText);
                }
            }

            try {
                return JSON.parse(jsonText);
            } catch (e) {
                throw new Error('Réponse invalide du serveur: ' + jsonText);
            }
        } catch (error) {
            throw error;
        }
    },

    // Requêtes pour les posts
    async getUserPosts(userId: number, page: number): Promise<PostsResponse> {
        try {
            const response = await AuthService.authenticatedFetch(`/user/${userId}/posts?page=${page}`);
            const responseText = await response.text();

            // Extraire la partie JSON valide
            const jsonMatch = responseText.match(/^\{.*\}/);
            if (!jsonMatch) {
                throw new Error('Aucun JSON valide trouvé dans la réponse');
            }
            const jsonText = jsonMatch[0];

            if (!response.ok) {
                let errorData;
                try {
                    errorData = JSON.parse(jsonText);
                    throw new Error(errorData.error || 'Erreur lors de la récupération des posts');
                } catch (e) {
                    throw new Error('Réponse invalide du serveur: ' + jsonText);
                }
            }

            try {
                const data = JSON.parse(jsonText);
                return {
                    posts: data.posts,
                    hasMore: data.posts.length > 0 && data.next_page !== null,
                    pinned_post: data.pinned_post || null
                };
            } catch (e) {
                throw new Error('Réponse invalide du serveur: ' + jsonText);
            }
        } catch (error) {
            throw error;
        }
    },

    async getAllPosts(page: number): Promise<PostsResponse> {
        try {
            const userId = AuthService.getUserId();
            const response = await AuthService.authenticatedFetch(`/posts?page=${page}&userId=${userId}`);
            const responseText = await response.text();

            // Extraire la partie JSON valide
            const jsonMatch = responseText.match(/^\{.*\}/);
            if (!jsonMatch) {
                throw new Error('Aucun JSON valide trouvé dans la réponse');
            }
            const jsonText = jsonMatch[0];

            if (!response.ok) {
                let errorData;
                try {
                    errorData = JSON.parse(jsonText);
                    throw new Error(errorData.error || 'Erreur lors de la récupération des posts');
                } catch (e) {
                    throw new Error('Réponse invalide du serveur: ' + jsonText);
                }
            }

            try {
                const data = JSON.parse(jsonText);
                return {
                    posts: data.posts,
                    hasMore: data.posts.length > 0 && data.next_page !== null
                };
            } catch (e) {
                throw new Error('Réponse invalide du serveur: ' + jsonText);
            }
        } catch (error) {
            throw error;
        }
    },

    async getCurrentUserProfile(): Promise<User> {
        const username = AuthService.getUsername();
        if (!username) {
            throw new Error('Utilisateur non connecté');
        }
        return this.getUserProfile(username);
    },

    async likePost(postId: number, userId: number, isLiked: boolean): Promise<void> {
        const response = await AuthService.authenticatedFetch(`/posts/${postId}/like`, {
            method: 'POST',
            body: JSON.stringify({ userId, isLiked })
        });
        if (response.status === 403) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Vous ne pouvez pas liker ce post car vous êtes banni');
        }
        else if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erreur lors de l\'ajout de like');
        }
    },

    async followUser(userId: number, followedUserId: number, isFollowed: boolean): Promise<void> {
        const response = await AuthService.authenticatedFetch(`/users/${followedUserId}/follow`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId, isFollowed })
        });
        if (response.status === 403) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Vous ne pouvez pas suivre cet utilisateur car vous êtes banni');
        }
        else if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erreur lors du suivi');
        }
    },

    async isUserFollowed(userId: number, followedUserId: number): Promise<boolean> {
        try {
            const response = await AuthService.authenticatedFetch(`/users/${followedUserId}/follow-status/${userId}`);
            const responseText = await response.text();

            // Extraire la partie JSON valide
            const jsonMatch = responseText.match(/^\{.*\}/);
            if (!jsonMatch) {
                throw new Error('Aucun JSON valide trouvé dans la réponse');
            }
            const jsonText = jsonMatch[0];

            if (!response.ok) {
                let errorData;
                try {
                    errorData = JSON.parse(jsonText);
                    throw new Error(errorData.error || 'Erreur lors de la vérification du statut de suivi');
                } catch (e) {
                    throw new Error('Réponse invalide du serveur: ' + jsonText);
                }
            }

            try {
                const data = JSON.parse(jsonText);
                return data.is_followed;
            } catch (e) {
                throw new Error('Réponse invalide du serveur: ' + jsonText);
            }
        } catch (error) {
            console.error('Erreur lors de la vérification du statut de suivi:', error);
            return false;
        }
    },

    /**
     * Upload d'une image de couverture pour un profil
     * @param username Nom d'utilisateur du profil à modifier
     * @param imageFile Fichier image à uploader
     * @returns Les données de réponse qui contiennent soit l'image en base64 avec son type MIME, soit le chemin de l'image
     */
    // async uploadCover(username: string, imageFile: File): Promise<any> {
    //     const formData = new FormData();
    //     formData.append('cover', imageFile);
        
    //     // Utiliser fetch directement au lieu de authenticatedFetch pour ne pas forcer le Content-Type à application/json
    //     const token = AuthService.getToken();
    //     const headers = new Headers();
    //     if (token) {
    //         headers.set('Authorization', `Bearer ${token}`);
    //     }
    //     // Ne pas définir de Content-Type pour laisser le navigateur gérer le boundary avec FormData
        
    //     const response = await fetch(`http://localhost:8080/profile/${username}/cover`, {
    //         method: 'POST',
    //         headers,
    //         body: formData,
    //         credentials: 'include',
    //         mode: 'cors',
    //     });
        
    //     const data = await response.json();
        
    //     if (!response.ok) {
    //         throw new Error(data.error || 'Erreur lors de l\'upload de l\'image de couverture');
    //     }
        
    //     return data;
    // },

    async createPost(content: string, images: File[] = []): Promise<Post> {
        const userId = AuthService.getUserId();
        if (!userId) {
            throw new Error('Utilisateur non connecté');
        }

        // Convertir les images en base64
        const imagePromises = images.map(file => {
            return new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        });

        const imageData = await Promise.all(imagePromises);

        const response = await AuthService.authenticatedFetch(`/posts/${userId}`, {
            method: 'POST',
            body: JSON.stringify({ 
                content,
                images: imageData
            })
        });
        if (response.status === 403) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Vous ne pouvez pas publier de message car vous êtes banni');
        }
        else if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erreur lors de la création du post');
        }
        const data = await response.json();
        return data;
    },

    async getAdminUsers(page: number): Promise<AdminApiResponse> {
        try {
            const response = await AuthService.authenticatedFetch(`/users?page=${page}`);
            const responseText = await response.text();

            // Extraire la partie JSON valide
            const jsonMatch = responseText.match(/^\{.*\}/);
            if (!jsonMatch) {
                throw new Error('Aucun JSON valide trouvé dans la réponse');
            }
            const jsonText = jsonMatch[0];

            if (!response.ok) {
                let errorData;
                try {
                    errorData = JSON.parse(jsonText);
                    throw new Error(errorData.error || 'Erreur lors de la récupération des utilisateurs');
                } catch (e) {
                    throw new Error('Réponse invalide du serveur: ' + jsonText);
                }
            }

            try {
                return JSON.parse(jsonText);
            } catch (e) {
                throw new Error('Réponse invalide du serveur: ' + jsonText);
            }
        } catch (error) {
            throw error;
        }
    },


    async getUserProfileByUsername(username: string): Promise<User> {
        try {
            const response = await AuthService.authenticatedFetch(`/profile/${username}`);
            const responseText = await response.text();

            // Extraire la partie JSON valide
            const jsonMatch = responseText.match(/^\{.*\}/);
            if (!jsonMatch) {
                throw new Error('Aucun JSON valide trouvé dans la réponse');
            }
            const jsonText = jsonMatch[0];

            if (!response.ok) {
                let errorData;
                try {
                    errorData = JSON.parse(jsonText);
                    throw new Error(errorData.error || 'Erreur lors de la récupération des utilisateurs');
                } catch (e) {
                    throw new Error('Réponse invalide du serveur: ' + jsonText);
                }
            }

            try {
                return JSON.parse(jsonText);
            } catch (e) {
                throw new Error('Réponse invalide du serveur: ' + jsonText);
            }
        } catch (error) {
            throw error;
        }
    },

    async updateUser(userId: number, userData: { username: string; name: string; bio: string | null, banned: boolean }): Promise<User> {
        try {
            const response = await AuthService.authenticatedFetch(`/update/user/${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const responseText = await response.text();

            // Extraire la partie JSON valide
            const jsonMatch = responseText.match(/^\{.*\}/);
            if (!jsonMatch) {
                throw new Error('Aucun JSON valide trouvé dans la réponse');
            }
            const jsonText = jsonMatch[0];

            if (!response.ok) {
                let errorData;
                try {
                    errorData = JSON.parse(jsonText);
                    throw new Error(errorData.error || 'Erreur lors de la mise à jour de l\'utilisateur');
                } catch (e) {
                    throw new Error('Réponse invalide du serveur: ' + jsonText);
                }
            }

            try {
                const data = JSON.parse(jsonText);
                if (!data.user) {
                    throw new Error('Format de réponse invalide: user manquant');
                }
                return data.user;
            } catch (e) {
                throw new Error('Réponse invalide du serveur: ' + jsonText);
            }
        } catch (error) {
            throw error;
        }
    },
    async updateSetting(userId: number, reloading: string, lecture: boolean): Promise<User> {
        try {
            const response = await AuthService.authenticatedFetch(`/update/settings/${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ reloading, lecture })
            });

            const responseText = await response.text();

            // Extraire la partie JSON valide
            const jsonMatch = responseText.match(/^\{.*\}/);
            if (!jsonMatch) {
                throw new Error('Aucun JSON valide trouvé dans la réponse');
            }
            const jsonText = jsonMatch[0];

            if (!response.ok) {
                let errorData;
                try {
                    errorData = JSON.parse(jsonText);
                    throw new Error(errorData.error || 'Erreur lors de la mise à jour des paramètres');
                } catch (e) {
                    throw new Error('Réponse invalide du serveur: ' + jsonText);
                }
            }

            try {
                const data = JSON.parse(jsonText);
                if (!data.user) {
                    throw new Error('Format de réponse invalide: user manquant');
                }
                return data.user;
            } catch (e) {
                throw new Error('Réponse invalide du serveur: ' + jsonText);
            }
        } catch (error) {
            throw error;
        }
    },

    async deletePost(postId: number): Promise<void> {
        try {
            const response = await AuthService.authenticatedFetch(`/posts/${postId}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json'
                }
            });

            const responseText = await response.text();

            if (!response.ok) {
                if (responseText) {
                    const jsonMatch = responseText.match(/^\{.*\}/);
                    if (jsonMatch) {
                        try {
                            const errorData = JSON.parse(jsonMatch[0]);
                            throw new Error(errorData.error || 'Erreur lors de la suppression du post');
                        } catch (e) {
                            // Si le parsing échoue, on utilise le message par défaut
                        }
                    }
                }
                throw new Error('Erreur lors de la suppression du post');
            }
        } catch (error) {
            throw error;
        }
    },

    async updatePost(postId: number, content: string, keepMediaIndices: number[] = [], newMedia: File[] = []): Promise<Post> {
        const userId = AuthService.getUserId();
        if (!userId) {
            throw new Error('Utilisateur non connecté');
        }

        // Convertir les nouvelles images en base64
        const mediaPromises = newMedia.map(file => {
            return new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        });

        const mediaData = await Promise.all(mediaPromises);

        const response = await AuthService.authenticatedFetch(`/posts/${postId}/edit`, {
            method: 'POST',
            body: JSON.stringify({ 
                userId,
                content,
                keepMedia: keepMediaIndices,
                media: mediaData
            })
        });

        if (response.status === 403) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Vous n\'êtes pas autorisé à modifier ce post');
        }
        else if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erreur lors de la modification du post');
        }
        
        const data = await response.json();
        return data;
    },

    async updateUserProfile(username: string, formData: FormData): Promise<User> {
        try {
            const response = await AuthService.authenticatedFetch(`/profile/${username}/update`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erreur lors de la mise à jour du profil');
            }

            const data = await response.json();
            
            // Mettre à jour les données de l'utilisateur dans le localStorage
            const currentUser = localStorage.getItem('user');
            if (currentUser) {
                const parsedUser = JSON.parse(currentUser);
                const updatedUser = {
                    ...parsedUser,
                    ...data.user
                };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                
                if (data.user.username !== username) {
                    localStorage.setItem('username', data.user.username);
                }
            }

            return data.user;
        } catch (error) {
            console.error('Erreur dans updateUserProfile:', error);
            throw error;
        }
    },

    async getSubscribedPosts(userId: number, page: number): Promise<PostsResponse> {
        try {
            const response = await AuthService.authenticatedFetch(`/posts/subscribed/${userId}?page=${page}`);
            const responseText = await response.text();

            // Extraire la partie JSON valide
            const jsonMatch = responseText.match(/^\{.*\}/);
            if (!jsonMatch) {
                throw new Error('Aucun JSON valide trouvé dans la réponse');
            }
            const jsonText = jsonMatch[0];

            if (!response.ok) {
                let errorData;
                try {
                    errorData = JSON.parse(jsonText);
                    throw new Error(errorData.error || 'Erreur lors de la récupération des posts');
                } catch (e) {
                    throw new Error('Réponse invalide du serveur: ' + jsonText);
                }
            }

            try {
                const data = JSON.parse(jsonText);
                return {
                    posts: data.posts,
                    hasMore: data.posts.length > 0 && data.next_page !== null
                };
            } catch (e) {
                throw new Error('Réponse invalide du serveur: ' + jsonText);
            }
        } catch (error) {
            throw error;
        }
    },

    async getPostComments(postId: number): Promise<PostInteraction[]> {
        try {
            const response = await AuthService.authenticatedFetch(`/posts/${postId}/comments`);
            const responseText = await response.text();

            // Extraire la partie JSON valide
            const jsonMatch = responseText.match(/^\{.*\}/);
            if (!jsonMatch) {
                throw new Error('Aucun JSON valide trouvé dans la réponse');
            }
            const jsonText = jsonMatch[0];

            if (!response.ok) {
                let errorData;
                try {
                    errorData = JSON.parse(jsonText);
                    throw new Error(errorData.error || 'Erreur lors de la récupération des commentaires');
                } catch (e) {
                    throw new Error('Réponse invalide du serveur: ' + jsonText);
                }
            }

            try {
                const data = JSON.parse(jsonText);
                return data.comments || [];
            } catch (e) {
                throw new Error('Réponse invalide du serveur: ' + jsonText);
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des commentaires:', error);
            return [];
        }
    },

    async addComment(postId: number, userId: number, comment: string): Promise<PostInteraction> {
        try {
            const response = await AuthService.authenticatedFetch(`/posts/${postId}/comment`, {
                method: 'POST',
                body: JSON.stringify({ userId, comment })
            });
            if (response.status === 403) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Vous ne pouvez pas commenter car vous êtes banni');
            }
            else if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erreur lors de l\'ajout du commentaire');
            }
            return await response.json();
        } catch (error) {
            console.error('Erreur lors de l\'ajout du commentaire:', error);
            throw error;
        }
    },

    async bannedUser(userId: number, bannedUserId: number, isBanned: boolean): Promise<void> {
        const response = await AuthService.authenticatedFetch(`/users/${bannedUserId}/ban`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId, isBanned })
        });
        if (response.status === 403) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Vous n\'avez pas les permissions pour bannir cet utilisateur');
        }
        else if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erreur lors du bannissement');
        }
    },

    getBannedUsers: async (userId: number): Promise<BannedUser[]> => {
        try {
            const response = await AuthService.authenticatedFetch(`/users/${userId}/banned`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs bannis:', error);
            throw error;
        }
    },

    async getAdminPosts(page: number = 1): Promise<AdminPostsResponse> {
        const response = await AuthService.authenticatedFetch(`/admin/posts?page=${page}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erreur lors de la récupération des posts');
        }
        return response.json();
    },

    async updatePostCensored(postId: number, censored: boolean): Promise<AdminPost> {
        const response = await AuthService.authenticatedFetch(`/admin/posts/${postId}/censored`, {
            method: 'POST',
            body: JSON.stringify({ censored })
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erreur lors de la mise à jour du post');
        }
        return response.json();
    },

    async pinPost(postId: number): Promise<{ success: boolean }> {
        const userId = AuthService.getUserId();
        if (!userId) {
            throw new Error('Utilisateur non connecté');
        }

        const response = await AuthService.authenticatedFetch(`/pin/post/${postId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId }),
        });

        if (!response.ok) {
            throw new Error('Erreur lors de l\'épinglage du post');
        }

        const data = await response.json();
        return { success: data.success };
    },

    async getAllUsers(): Promise<User[]> {
        const response = await AuthService.authenticatedFetch('/users/all', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des utilisateurs');
        }

        const data = await response.json();
        return data.users;
    },

    searchPosts: async (query: string, filters: SearchFilters): Promise<{ posts: Post[] }> => {
        const params = new URLSearchParams({
            query,
            dateRange: filters.dateRange,
            contentType: filters.contentType,
            ...(filters.userId && { userId: filters.userId.toString() })
        });

        const response = await AuthService.authenticatedFetch(`/posts/search?${params}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la recherche des posts');
        }

        return response.json();
    },
}; 
