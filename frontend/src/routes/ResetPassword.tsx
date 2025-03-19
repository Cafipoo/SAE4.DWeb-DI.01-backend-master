import { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import Input from '../components/Input';
import Button from '../components/Button';
import AuthLayout from '../components/AuthLayout';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('New password:', formData);
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
      <h2 className="text-2xl font-bold text-center text-white">Nouveau mot de passe</h2>
      
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="space-y-4">
          <Input
            type="password"
            name="password"
            placeholder="Nouveau mot de passe"
            value={formData.password}
            onChange={handleChange}
          />
          <Input
            type="password"
            name="confirmPassword"
            placeholder="Confirmer le mot de passe"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
        </div>
        <Button variant="default" rounded="full" size="xl">Réinitialiser</Button>
      </form>

      <p className="mt-4 text-center text-gray-400">
        <Link to="/login" className="text-white hover:text-gray-200">
          Retour à la connexion
        </Link>
      </p>
    </AuthLayout>
  );
};

export default ResetPassword; 