import { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import Input from '../components/Input';
import Button from '../components/Button';
import AuthLayout from '../components/AuthLayout';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthDate: ''
  });

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    return minLength && hasUpper && hasLower && hasNumber && hasSpecial;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validation en temps réel
    let error = '';
    switch (name) {
      case 'email':
        if (!validateEmail(value)) {
          error = 'Email invalide';
        }
        break;
      // case 'password':
      //   if (!validatePassword(value)) {
      //     error = 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial';
      //   }
        break;
      case 'confirmPassword':
        if (value !== formData.password) {
          error = 'Les mots de passe ne correspondent pas';
        }
        break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation finale avant soumission
    const newErrors = {
      name: formData.name.length < 2 ? 'Le nom doit contenir au moins 2 caractères' : '',
      email: !validateEmail(formData.email) ? 'Email invalide' : '',
      password: !validatePassword(formData.password) ? 'Mot de passe invalide' : '',
      confirmPassword: formData.password !== formData.confirmPassword ? 'Les mots de passe ne correspondent pas' : ''
    };

    setErrors(newErrors);

    // Si pas d'erreurs, on peut soumettre
    if (!Object.values(newErrors).some(error => error !== '')) {
      console.log('Form submitted:', formData);
      // Logique d'inscription à implémenter
    }
  };

  return (
    <AuthLayout>
      <Logo />
      <h2 className="text-2xl font-bold text-center text-white">Créez votre compte</h2>
      
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="space-y-4">
          <Input
            type="text"
            name="name"
            placeholder="Nom"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
          />
          <Input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
          />
          <Input
            type="date"
            name="birthDate"
            placeholder="Date de naissance"
            value={formData.birthDate}
            onChange={handleChange}
          />
          <Input
            type="password"
            name="password"
            placeholder="Mot de passe"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            showPasswordStrength
          />
          <Input
            type="password"
            name="confirmPassword"
            placeholder="Confirmer le mot de passe"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
          />
        </div>

        <div>
        <Button variant="default" rounded="full" size="xl">S'inscrire</Button>
        </div>
      </form>

      <p className="text-center text-gray-400">
        Vous avez déjà un compte?{' '}
        <Link to="/login" className="text-white hover:text-gray-200">
          Connectez-vous
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Register; 