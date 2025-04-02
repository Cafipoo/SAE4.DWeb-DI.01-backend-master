import { useState, useEffect, useRef, useCallback } from 'react';
import Tweet from '../components/Tweet';
import Sidebar from '../components/Sidebar';
import HomeTab from '../components/HomeTab';
import { DataRequests, Post } from '../data/data-requests';
import Icon from '../ui/Icon';
import SearchBar, { SearchFilters } from '../components/SearchBar';

const Home = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentTab, setCurrentTab] = useState<'all' | 'following'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [initialSearchQuery, setInitialSearchQuery] = useState('');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    dateRange: 'all',
    contentType: 'all',
    userId: null
  });
  const [isSearching, setIsSearching] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);

  // Fonction pour ajouter un nouveau tweet
  const addNewTweet = useCallback((newTweet: Post) => {
    setPosts(prevPosts => [newTweet, ...prevPosts]);
  }, []);

  // Fonction pour supprimer un tweet
  const handleDeleteTweet = useCallback((postId: number) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
  }, []);

  // Fonction pour charger les posts
  const fetchPosts = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      const user = localStorage.getItem('user');
      const userId = user ? JSON.parse(user).id : null;

      if (!userId) {
        throw new Error('Utilisateur non connecté');
      }

      const response = currentTab === 'all' 
        ? await DataRequests.getAllPosts(page)
        : await DataRequests.getSubscribedPosts(userId, page);
      
      setPosts(prevPosts => {
        if (page === 1) return response.posts;
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
  }, [currentTab]);

  // Fonction pour effectuer une recherche
  const handleSearch = useCallback(async (query: string, filters: SearchFilters) => {
    setSearchQuery(query);
    setSearchFilters(filters);
    setIsSearching(true);
    setCurrentPage(1);
    setLoading(true);

    try {
      const response = await DataRequests.searchPosts(query, filters);
      setPosts(response.posts);
      setHasMore(false);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fonction pour définir une requête de recherche initiale
  const setInitialQuery = useCallback((query: string) => {
    // Effacer d'abord le contenu précédent
    setSearchQuery('');
    setInitialSearchQuery('');
    
    // Puis définir la nouvelle requête et lancer la recherche
    setTimeout(() => {
      setInitialSearchQuery(query);
      handleSearch(query, searchFilters);
    }, 0);
  }, [handleSearch, searchFilters]);

  // Fonction pour rafraîchir les posts
  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    try {
      setIsRefreshing(true);
      await fetchPosts(1);
      setCurrentPage(1);
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Gérer le changement d'onglet
  const handleTabChange = (tab: 'all' | 'following') => {
    setCurrentTab(tab);
    setCurrentPage(1);
    setPosts([]);
    setHasMore(true);
    setIsSearching(false);
  };

  useEffect(() => {
    const setupAutoRefresh = () => {
      if (localStorage.getItem("user") !== null) {
        let user = JSON.parse(localStorage.getItem("user")!);
        let reloading = user.reloading;
        if (reloading == null) {
          reloading = 0;
        }
        if (reloading > 0) {
          const intervalId = setInterval(() => {
            handleRefresh();
            console.log("autoRefresh");
          }, reloading * (1000 * 60));
          
          // Nettoyer l'intervalle précédent
          return () => clearInterval(intervalId);
        }
      }
    };

    // Configuration initiale du rafraîchissement
    const cleanup = setupAutoRefresh();

    // Écouter les changements de paramètres
    const handleReloadingUpdate = (event: CustomEvent) => {
      if (cleanup) cleanup();
      setupAutoRefresh();
    };

    window.addEventListener('reloadingUpdated', handleReloadingUpdate as EventListener);

    return () => {
      if (cleanup) cleanup();
      window.removeEventListener('reloadingUpdated', handleReloadingUpdate as EventListener);
    };
  }, [handleRefresh]);

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

  // Charger les posts initiaux
  useEffect(() => {
    if (!isSearching) {
      fetchPosts(currentPage);
    }
  }, [currentPage, fetchPosts, isSearching]);


  // Ajouter cette fonction pour gérer l'édition d'un tweet
  const handleEditTweet = useCallback((editedPost: Post) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === editedPost.id ? editedPost : post
      )
    );
  }, []);

  return (
    <div className="flex justify-center md:gap-4 min-h-screen bg-black">
      <div className="flex">
        <Sidebar />
      </div>
      <main className="flex-1 border-l border-r md:border-gray-700 md:ml-72 md:max-w-[600px]">
        <header className="sticky top-0 z-10 border-b border-gray-700 backdrop-blur">
          <div className='flex items-start justify-between'>
            <h1 className="text-xl font-bold text-white p-4">Accueil</h1>
            <div className="p-4">
              <SearchBar 
                onSearch={handleSearch} 
                placeholder="Rechercher des tweets..." 
                className="w-full md:w-64"
                initialQuery={initialSearchQuery}
              />
            </div>
          </div>
          
          <HomeTab 
            currentTab={currentTab}
            onTabChange={handleTabChange}
          />
        </header>

        <div className="flex justify-end px-4 py-2">
          <div 
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-800 p-2 rounded-full transition-colors"
            onClick={handleRefresh}
          >
            <Icon 
              name="reload" 
              className={`w-6 h-6 fill-white ${isRefreshing ? 'animate-spin' : ''}`} 
            />
            <p className="text-white">Actualiser</p>
          </div>
        </div>

        {isSearching && (
          <div className="px-4 py-2 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-white">
                Résultats pour "{searchQuery}"
                {searchFilters.dateRange !== 'all' && (
                  <span className="text-gray-400 ml-2">
                    • {searchFilters.dateRange === 'today' ? 'Aujourd\'hui' : 
                       searchFilters.dateRange === 'week' ? 'Cette semaine' : 
                       searchFilters.dateRange === 'month' ? 'Ce mois' : 'Cette année'}
                  </span>
                )}
                {searchFilters.contentType !== 'all' && (
                  <span className="text-gray-400 ml-2">
                    • {searchFilters.contentType === 'text' ? 'Texte uniquement' : 
                       searchFilters.contentType === 'media' ? 'Médias uniquement' : 'Vidéos uniquement'}
                  </span>
                )}
              </div>
              <button 
                onClick={() => {
                  setIsSearching(false);
                  setSearchQuery('');
                  fetchPosts(1);
                }}
                className="text-blue-400 hover:text-blue-300"
              >
                Effacer la recherche
              </button>
            </div>
          </div>
        )}

        <div className="divide-y divide-gray-700">
          {posts.map((post, index) => (
            <div
              key={post.id}
              ref={index === posts.length - 1 ? lastPostElementRef : undefined}
            >
              <Tweet 
                post={post} 
                onDelete={handleDeleteTweet}
                onEdit={handleEditTweet}
                onHashtagClick={setInitialQuery}
              />
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

        {!loading && posts.length === 0 && currentTab === 'following' && (
          <div className="p-4 text-center text-gray-500">
            Aucun tweet des personnes que vous suivez
          </div>
        )}

        {!loading && posts.length === 0 && isSearching && (
          <div className="p-4 text-center text-gray-500">
            Aucun résultat trouvé pour votre recherche
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;