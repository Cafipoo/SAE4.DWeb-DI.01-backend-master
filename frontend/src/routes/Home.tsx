import { useState, useEffect, useRef, useCallback } from 'react';
import Tweet from '../components/Tweet';
import Sidebar from '../components/Sidebar';
import { DataRequests, Post } from '../data/data-requests';

const Home = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);

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

  const lastPostElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setCurrentPage(prevPage => prevPage + 1);
      }
    }, { threshold: 0.5 });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await DataRequests.getAllPosts(currentPage);
        
        setPosts(prevPosts => {
          const newPosts = response.posts.filter(newPost => 
            !prevPosts.some(existingPost => existingPost.id === newPost.id)
          );
          return [...prevPosts, ...newPosts];
        });
        
        setHasMore(response.hasMore);
      } catch (error) {
        console.error('Erreur lors de la récupération des posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [currentPage]);

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <main className="flex-1 border-l border-r border-gray-700 md:ml-72 max-w-[600px]">
        <header className="sticky top-0 z-10 border-b border-gray-700 bg-black backdrop-blur">
          <h1 className="text-xl font-bold text-white p-4">Accueil</h1>
        </header>

        <div className="divide-y divide-gray-700">
          {posts.map((post, index) => (
            <div
              key={post.id}
              ref={index === posts.length - 1 ? lastPostElementRef : undefined}
            >
              <Tweet post={post} />
            </div>
          ))}
        </div>

        {loading && (
          <div className="p-4 text-center text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            <p className="mt-2">Chargement des tweets...</p>
          </div>
        )}

        {!hasMore && posts.length > 0 && (
          <div className="p-4 text-center text-gray-500">
            Vous avez vu tous les tweets disponibles
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;