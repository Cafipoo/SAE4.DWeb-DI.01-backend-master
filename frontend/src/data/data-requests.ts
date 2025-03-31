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
        id: number;
        name: string;
        username: string;
        avatar: string;
        banned: boolean;
    };
    likes_count: number;
    liked_by: number[];
}

export interface PostsResponse {
    posts: Post[];
    hasMore: boolean;
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
                    hasMore: data.posts.length > 0 && data.next_page !== null
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
            const response = await AuthService.authenticatedFetch(`/posts?page=${page}`);
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

    async createPost(content: string): Promise<Post> {
        const userId = AuthService.getUserId();
        if (!userId) {
            throw new Error('Utilisateur non connecté');
        }
        const response = await AuthService.authenticatedFetch(`/posts/${userId}`, {
            method: 'POST',
            body: JSON.stringify({ content })
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
    async updateSetting(userId: number, reloading: string): Promise<User> {
        try {
            const response = await AuthService.authenticatedFetch(`/update/reloading/${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ reloading })
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

    async updateUserProfile(username: string, formData: FormData): Promise<User> {

        const response = await AuthService.authenticatedFetch(`/profile/${username}/update`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Erreur lors de la mise à jour du profil');
            
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
    }
}; 
