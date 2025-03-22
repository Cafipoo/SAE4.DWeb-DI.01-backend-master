import { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../ui/Logo';
import Input from '../ui/Input';
import Button from '../ui/Button';
import AuthLayout from '../ui/AuthLayout';

const RequestReset = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Reset requested for:', email);
  };

  return (
    <AuthLayout>
      <Logo />
      <h2 className="text-2xl font-bold text-center text-white">Réinitialiser le mot de passe</h2>
      
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <Input
          type="email"
          name="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button variant="default" rounded="full" size="xl">Envoyer le lien</Button>
      </form>

      <p className="mt-4 text-center text-gray-400">
        <Link to="/login" className="text-white hover:text-gray-200">
          Retour à la connexion
        </Link>
      </p>
    </AuthLayout>
  );
};

export default RequestReset; 