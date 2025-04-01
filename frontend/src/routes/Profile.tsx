import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import ProfileHeader from '../components/ProfileHeader';
import ProfileInfo from '../components/ProfileInfo';
import ProfileTabs from '../components/ProfileTabs';
import Tweet from '../components/Tweet';
import Sidebar from '../components/Sidebar';
import { DataRequests, User, Post } from '../data/data-requests';
import AuthService from '../services/auth.service';

const Profile = () => {
  const { username } = useParams<{ username: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [bannedUsers, setBannedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [followedUsers, setFollowedUsers] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'banned'>('posts');

  // Fonction pour ajouter un nouveau tweet
  const addNewTweet = useCallback((newTweet: Post) => {
    const currentUser = AuthService.getUsername();
    // N'ajouter le tweet que si on est sur le profil de l'auteur du tweet
    if (currentUser === username) {
      setPosts(prevPosts => [newTweet, ...prevPosts]);
    }
  }, [username]);

  // Fonction pour supprimer un tweet
  const handleDeleteTweet = useCallback((postId: number) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
  }, []);

  const handleFollowUpdate = (userId: number, isFollowed: boolean) => {
    setFollowedUsers(prev => {
      if (isFollowed) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleBannedUpdate = (userId: number, isBanned: boolean) => {
    setBannedUsers(prev => {
      if (isBanned) {
        return prev.filter(user => user.id !== userId);
      } else {
        const userToAdd = user;
        if (userToAdd) {
          return [...prev, userToAdd];
        }
        return prev;
      }
    });
  };

  // Fonction pour gérer l'édition d'un tweet
  const handleEditTweet = useCallback((editedPost: Post) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === editedPost.id ? editedPost : post
      )
    );
  }, []);

  // Écouter l'événement de nouveau tweet
  useEffect(() => {
    const handleNewTweet = (event: CustomEvent<Post>) => {
      addNewTweet(event.detail);
    };

    window.addEventListener('newTweet', handleNewTweet as EventListener);

    return () => {
      window.removeEventListener('newTweet', handleNewTweet as EventListener);
    };
  }, [addNewTweet]);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastPostElementRef = useCallback((node: HTMLDivElement) => {
    if (loading || loadingMore) return;
    
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setCurrentPage(prevPage => prevPage + 1);
      }
    }, { threshold: 0.5 });
    
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore]);

  // Charger les informations de l'utilisateur
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        let userData;
        if (!username) {
          userData = await DataRequests.getCurrentUserProfile();
        } else {
          userData = await DataRequests.getUserProfileByUsername(username);
        }
        setUser(userData);

        // Vérifier si l'utilisateur est déjà suivi
        const currentUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!) : null;
        if (currentUser && userData.id !== currentUser.id) {
          const isFollowed = await DataRequests.isUserFollowed(currentUser.id, userData.id);
          if (isFollowed) {
            setFollowedUsers(prev => [...prev, userData.id]);
          }
        }

        // Vérifier si l'utilisateur est banni
        if (userData.is_banned_by_current_user) {
          setBannedUsers([userData]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [username]);

  // Charger les posts avec pagination
  useEffect(() => {
    const fetchPosts = async () => {
      if (!user) return;
      
      try {
        setLoadingMore(true);
        const response = await DataRequests.getUserPosts(user.id, currentPage);
        
        // Si c'est un nouveau tweet et que ce n'est pas le profil de l'utilisateur actuel,
        // on ne l'ajoute pas
        setPosts(prevPosts => {
          const newPosts = response.posts.filter(newPost => 
            !prevPosts.some(existingPost => existingPost.id === newPost.id)
          );
          return currentPage === 1 ? response.posts : [...prevPosts, ...newPosts];
        });
        
        setHasMore(response.hasMore);
      } catch (err) {
        console.error('Erreur lors du chargement des posts:', err);
      } finally {
        setLoadingMore(false);
      }
    };

    fetchPosts();
  }, [currentPage, user]);

  const handleTabChange = async (tab: 'posts' | 'banned') => {
    setActiveTab(tab);
    if (tab === 'banned' && user) {
      try {
        setLoading(true);
        const bannedUsersData = await DataRequests.getBannedUsers(user.id);
        setBannedUsers(bannedUsersData as User[]);
      } catch (err) {
        console.error('Erreur lors du chargement des utilisateurs bannis:', err);
        setError(err instanceof Error ? err.message : 'Une erreur est survenue lors du chargement des utilisateurs bannis');
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-gray-500">Aucun utilisateur trouvé</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Sidebar />

      <div className="md:ml-72 pb-16 md:pb-0">
        <ProfileHeader
          coverImage={user.cover || ''}
          avatar={user.avatar || ''}
          displayName={user.name}
          username={user.username}
        />
        
        <ProfileInfo
          userId={user.id}
          bio={user.bio || 'Aucune bio'}
          location={user.location || ''}
          website={user.siteWeb || ''}
          joinedDate={user.joined_date}
          stats={{
            following: user.following_count,
            followers: user.followers_count
          }}
          isInitiallyFollowed={followedUsers.includes(user.id)}
          isInitiallyBanned={bannedUsers.some(bannedUser => bannedUser.id === user.id)}
          onFollowUpdate={handleFollowUpdate}
        />

        <ProfileTabs userId={user.id} activeTab={activeTab} onTabChange={handleTabChange} />

        <div className="px-4">
          <div className="space-y-4 py-4">
            {activeTab === 'posts' ? (
              <>
                {posts.length > 0 ? (
                  posts.map((post, index) => (
                    <div
                      key={post.id}
                      ref={index === posts.length - 1 ? lastPostElementRef : undefined}
                    >
                      <Tweet
                        post={{
                          id: post.id,
                          content: post.content,
                          created_at: post.created_at,
                          media: post.media || [],
                          liked_by: post.liked_by || [],
                          author: {
                            id: user.id,
                            name: user.name,
                            username: user.username,
                            avatar: user.avatar || '',
                            banned: user.banned
                          },
                          likes_count: post.likes_count,
                          reposts: 0,
                          replies: 0,
                          isFollowed: followedUsers.includes(user.id)
                        }}
                        onDelete={handleDeleteTweet}
                        onFollowUpdate={handleFollowUpdate}
                        onEdit={handleEditTweet}
                      />
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-center py-8">
                    Aucun post pour le moment
                  </div>
                )}

                {loadingMore && (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                    <p className="text-gray-500 mt-2">Chargement des tweets...</p>
                  </div>
                )}

                {!hasMore && posts.length > 0 && (
                  <div className="text-gray-500 text-center py-4">
                    Vous avez vu tous les tweets
                  </div>
                )}
              </>
            ) : (
              <>
                {bannedUsers.length > 0 ? (
                  bannedUsers.map((bannedUser) => (
                    <div key={bannedUser.id} className="flex items-center p-4 border-b border-gray-800">
                      <img
                        src={bannedUser.avatar || '/default-avatar.png'}
                        alt={bannedUser.name}
                        className="w-12 h-12 rounded-full mr-4"
                      />
                      <div>
                        <div className="font-bold">{bannedUser.name}</div>
                        <div className="text-gray-500">@{bannedUser.username}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-center py-8">
                    Aucun utilisateur banni
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 