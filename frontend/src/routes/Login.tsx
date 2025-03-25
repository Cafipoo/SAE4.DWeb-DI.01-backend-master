import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Logo from '../ui/Logo';
import Input from '../ui/Input';
import Button from '../ui/Button';
import AuthLayout from '../ui/AuthLayout';
import AuthService from '../services/auth.service';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Check for verification status in URL
    const params = new URLSearchParams(location.search);
    const verified = params.get('verified');
    const verificationError = params.get('error');
    
    if (verified === 'true') {
      setSuccessMessage('Votre email a été vérifié avec succès. Vous pouvez maintenant vous connecter.');
    } else if (verified === 'false' && verificationError) {
      setError('Erreur de vérification: ' + decodeURIComponent(verificationError));
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      let response = await AuthService.login(formData.email, formData.password);
      
      console.log(response);
      // Redirection vers la page d'accueil après connexion réussie
      navigate('/home');
    } catch (error) {
      console.error('Erreur:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue lors de la connexion');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <AuthLayout>
      <Logo />
      <h2 className="text-2xl font-bold text-center text-white">Connectez-vous</h2>
      
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {successMessage && (
          <div className="bg-green-500/10 border border-green-500 text-green-500 rounded-lg p-3 text-sm">
            {successMessage}
          </div>
        )}
        
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-3 text-sm">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          <Input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />
          <Input
            type="password"
            name="password"
            placeholder="Mot de passe"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        <div>
          <Button 
            variant="default" 
            rounded="full" 
            size="xl"
            disabled={!formData.email || !formData.password}
          >
            Se connecter
          </Button>
        </div>
      </form>

      <div className="space-y-4 text-center">
        <p className="text-gray-400">
          Vous n'avez pas de compte?{' '}
          <Link to="/register" className="text-white hover:text-gray-200">
            Inscrivez-vous
          </Link>
        </p>
        <p className="text-gray-400">
          <Link to="/reset-password" className="text-white hover:text-gray-200">
            Mot de passe oublié?
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Login; 