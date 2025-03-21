import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/Input';
import Button from '../components/Button';
import AuthService from '../services/auth.service';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      let response = await AuthService.admin(credentials.username, credentials.password);
      localStorage.setItem('adminAuth', 'true');
      console.log(response);
      // Redirection vers la page d'accueil après connexion réussie
      navigate('/backoffice');
    } catch (error) {
      console.error('Erreur:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue lors de la connexion');
    }
  };

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold text-white mb-8">Administration</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          name="username"
          placeholder="Nom d'utilisateur"
          value={credentials.username}
          onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
        />
        <Input
          type="password"
          name="password"
          placeholder="Mot de passe"
          value={credentials.password}
          onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
        />
        <Button variant="default" type="submit">
          Se connecter
        </Button>
      </form>
    </AuthLayout>
  );
};

export default AdminLogin; 