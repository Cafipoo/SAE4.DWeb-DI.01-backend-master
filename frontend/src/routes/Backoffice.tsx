import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataRequests, User, AdminApiResponse } from '../data/data-requests';

const Backoffice = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Omit<AdminApiResponse, 'users'> | null>(null);

  useEffect(() => {
    const isAdmin = localStorage.getItem('adminAuth') === 'true';
    if (!isAdmin) {
      navigate('/admin');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await DataRequests.getAdminUsers(currentPage);
        setUsers(data.users || []);
        const { users: _, ...paginationData } = data;
        setPagination(paginationData);
      } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        setError('Impossible de charger les utilisateurs. Veuillez réessayer plus tard.');
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentPage]);

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    navigate('/admin');
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
  };

  const handleSave = async (updatedUser: User) => {
    try {
      setError(null);
      const userData = {
        name: updatedUser.name,
        username: updatedUser.username,
        bio: updatedUser.bio || '',
        banned: updatedUser.banned || false
      };

      console.log('Données envoyées:', userData);
      await DataRequests.updateUser(updatedUser.id, userData);
      // Rafraîchir la liste des utilisateurs
      const data = await DataRequests.getAdminUsers(currentPage);
      setUsers(data.users || []);
      setEditingUser(null);
    } catch (err: any) {
      console.error('Erreur de mise à jour:', err);
      setError(err.message || 'Une erreur est survenue lors de la mise à jour');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Dashboard d'administration</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Déconnexion
          </button>
        </div>

        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Utilisateurs</h2>
          {error && (
            <div className="text-red-500 text-center py-4">{error}</div>
          )}
          {loading ? (
            <div className="text-center py-4">Chargement...</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-4">ID</th>
                      <th className="text-left py-3 px-4">Nom d'utilisateur</th>
                      <th className="text-left py-3 px-4">Nom</th>
                      <th className="text-left py-3 px-4">Email</th>
                      <th className="text-left py-3 px-4">Date d'inscription</th>
                      <th className="text-left py-3 px-4">Bio</th>
                      <th className="text-left py-3 px-4">Banni</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users && users.length > 0 ? (
                      users.map(user => (
                        <tr key={user.id} className="border-b border-gray-800">
                          <td className="py-3 px-4">{user.id}</td>
                          <td className="py-3 px-4">{user.username}</td>
                          <td className="py-3 px-4">{user.name}</td>
                          <td className="py-3 px-4">{user.email}</td>
                          <td className="py-3 px-4">{user.joined_date}</td>
                          <td className="py-3 px-4">{user.bio || '-'}</td>
                          <td className="py-3 px-4">{user.banned ? 'Oui' : 'Non'}</td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleEdit(user)}
                              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                              Modifier
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center py-4 text-gray-500">
                          Aucun utilisateur trouvé
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {pagination && users.length > 0 && (
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-sm text-gray-400">
                    {pagination.total_users} : utilisateurs au total
                  </div>
                  <div className="flex gap-2">
                    {pagination.previous_page !== null && (
                      <button
                        onClick={() => setCurrentPage(pagination.previous_page!)}
                        className="px-3 py-1 bg-gray-800 rounded hover:bg-gray-700"
                      >
                        Précédent
                      </button>
                    )}
                    <span className="px-3 py-1">
                      Page {pagination.current_page} sur {pagination.max_pages}
                    </span>
                    {pagination.next_page !== null && (
                      <button
                        onClick={() => setCurrentPage(pagination.next_page!)}
                        className="px-3 py-1 bg-gray-800 rounded hover:bg-gray-700"
                      >
                        Suivant
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Modifier l'utilisateur</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave(editingUser);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1">Nom d'utilisateur</label>
                <input
                  type="text"
                  value={editingUser.username}
                  onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                  className="w-full bg-gray-800 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nom affiché</label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full bg-gray-800 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bio</label>
                <textarea
                  value={editingUser.bio || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, bio: e.target.value })}
                  className="w-full bg-gray-800 rounded px-3 py-2"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-white">Bannissement</label>
                <select
                  value={editingUser.banned === true ? "true" : "false"}
                  onChange={(e) => {
                    if (editingUser) {
                      setEditingUser({
                        ...editingUser,
                        banned: e.target.value === "true"
                      });
                    }
                  }}
                  className="w-full bg-gray-800 text-white rounded px-3 py-2"
                >
                  <option value="false">Non</option>
                  <option value="true">Oui</option>
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Backoffice;