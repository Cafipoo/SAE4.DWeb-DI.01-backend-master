import { useState, useEffect, useRef, useCallback } from 'react';
import ProfileHeader from '../components/ProfileHeader';
import ProfileInfo from '../components/ProfileInfo';
import Tweet from '../components/Tweet';
import Sidebar from '../components/Sidebar';

interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  joined_date: string;
  avatar: string;
  cover: string;
  bio: string;
}

interface Post {
  id: number;
  content: string;
  created_at: string;
}

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Fonction pour ajouter un nouveau tweet
  const addNewTweet = useCallback((newTweet: Post) => {
    setPosts(prevPosts => [newTweet, ...prevPosts]);
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

  const observer = useRef<IntersectionObserver>();
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
        const response = await fetch('http://localhost:8080/user/2');
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des données utilisateur');
        }
        const data = await response.json();
        setUser(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Charger les posts avec pagination
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoadingMore(true);
        const response = await fetch(`http://localhost:8080/user/1/posts?page=${currentPage}`);
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des posts');
        }
        const data = await response.json();
        
        setPosts(prevPosts => {
          const newPosts = data.posts.filter((newPost: Post) => 
            !prevPosts.some(existingPost => existingPost.id === newPost.id)
          );
          return currentPage === 1 ? data.posts : [...prevPosts, ...newPosts];
        });
        
        setHasMore(data.posts.length > 0);
      } catch (err) {
        console.error('Erreur lors du chargement des posts:', err);
      } finally {
        setLoadingMore(false);
      }
    };

    fetchPosts();
  }, [currentPage]);

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
          coverImage={user.cover || 'https://via.placeholder.com/1500x500'}
          avatar={user.avatar || 'https://via.placeholder.com/400x400'}
          displayName={user.name}
          username={user.username}
        />
        
        <ProfileInfo
          bio={user.bio || 'Aucune bio'}
          joinedDate={user.joined_date}
          stats={{
            following: 0,
            followers: 0
          }}
        />

        <div className="border-b border-gray-800">
          <div className="px-4">
            <div className="text-white font-bold py-4">
              Posts
            </div>
          </div>
        </div>

        <div className="px-4">
          <div className="space-y-4 py-4">
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
                      author: {
                        name: user.name,
                        username: user.username,
                        avatar: user.avatar || 'https://via.placeholder.com/400x400'
                      },
                      likes: 0,
                      reposts: 0,
                      replies: 0
                    }}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 