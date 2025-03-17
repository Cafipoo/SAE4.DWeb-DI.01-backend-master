import { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import Input from '../components/Input';
import Button from '../components/Button';
import AuthLayout from '../components/AuthLayout';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logique de connexion à implémenter
    console.log('Form submitted:', formData);
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
          <Button variant="default" rounded="full" size="xl">Se connecter</Button>
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