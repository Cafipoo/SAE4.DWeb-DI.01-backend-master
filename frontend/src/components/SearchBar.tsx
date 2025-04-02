import { useState, useEffect } from 'react';
import Icon from '../ui/Icon';
import { DataRequests, User } from '../data/data-requests';

export interface SearchFilters {
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
  contentType: 'all' | 'text' | 'media';
  userId: number | null;
}

export interface SearchBarProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  placeholder?: string;
  className?: string;
  initialQuery?: string;
}

const SearchBar = ({ 
  onSearch, 
  placeholder = "Rechercher...", 
  className = "",
  initialQuery = ""
}: SearchBarProps) => {
  const [query, setQuery] = useState(initialQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    dateRange: 'all',
    contentType: 'all',
    userId: null
  });
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // Mettre à jour la requête si initialQuery change
  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  // Charger les utilisateurs pour le filtre
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await DataRequests.getAllUsers();
        setUsers(response);
      } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSearch = () => {
    onSearch(query, filters);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center bg-gray-800 rounded-full px-4 py-2">
        <Icon name="search" className="w-5 h-5 text-gray-400 mr-2" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="bg-transparent outline-none text-white w-full"
        />
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="ml-2 p-1 rounded-full hover:bg-gray-700 transition-colors"
        >
          <Icon name="settings" className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {showFilters && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 rounded-lg p-4 shadow-lg z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtre par date */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Période
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="w-full bg-gray-700 text-white rounded-md p-2 outline-none"
              >
                <option value="all">Toutes les dates</option>
                <option value="today">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
                <option value="year">Cette année</option>
              </select>
            </div>

            {/* Filtre par type de contenu */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Type de contenu
              </label>
              <select
                value={filters.contentType}
                onChange={(e) => handleFilterChange('contentType', e.target.value)}
                className="w-full bg-gray-700 text-white rounded-md p-2 outline-none"
              >
                <option value="all">Tous les types</option>
                <option value="text">Texte uniquement</option>
                <option value="media">Médias (images/vidéos)</option>
              </select>
            </div>

            {/* Filtre par utilisateur */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Utilisateur
              </label>
              <select
                value={filters.userId || ''}
                onChange={(e) => handleFilterChange('userId', e.target.value ? parseInt(e.target.value) : null)}
                className="w-full bg-gray-700 text-white rounded-md p-2 outline-none"
              >
                <option value="">Tous les utilisateurs</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} (@{user.username})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSearch}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-full transition-colors"
            >
              Appliquer les filtres
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
