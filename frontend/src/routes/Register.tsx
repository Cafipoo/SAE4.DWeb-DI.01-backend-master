import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../ui/Logo';
import Input from '../ui/Input';
import Button from '../ui/Button';
import AuthLayout from '../ui/AuthLayout';
import AuthService from '../services/auth.service';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthDate: ''
  });

  const [errors, setErrors] = useState({
    name: '',
    username: '',
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

  // Vérifier si le formulaire est valide
  const isFormValid = useMemo(() => {
    const noErrors = !Object.values(errors).some(error => error !== '');
    const allFieldsFilled = Object.values(formData).every(value => value !== '');
    const passwordValid = validatePassword(formData.password);
    const emailValid = validateEmail(formData.email);
    const passwordsMatch = formData.password === formData.confirmPassword;
    const nameValid = formData.name.length >= 2;
    const usernameValid = formData.username.length >= 2;

    return noErrors && allFieldsFilled && passwordValid && emailValid && 
           passwordsMatch && nameValid && usernameValid;
  }, [formData, errors]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validation en temps réel
    let error = '';
    switch (name) {
      case 'name':
        if (value.length < 2) {
          error = 'Le nom doit contenir au moins 2 caractères';
        }
        break;
      case 'username':
        if (value.length < 2) {
          error = 'Le nom d\'utilisateur doit contenir au moins 2 caractères';
        }
        break;
      case 'email':
        if (!validateEmail(value)) {
          error = 'Email invalide';
        }
        break;
      case 'password':
        if (!validatePassword(value)) {
          error = 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial';
        }
        break;
      case 'confirmPassword':
        if (value !== formData.password) {
          error = 'Les mots de passe ne correspondent pas';
        }
        break;
    }
    
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation finale avant soumission
    const newErrors = {
      name: formData.name.length < 2 ? 'Le nom doit contenir au moins 2 caractères' : '',
      username: formData.username.length < 2 ? 'Le nom d\'utilisateur doit contenir au moins 2 caractères' : '',
      email: !validateEmail(formData.email) ? 'Email invalide' : '',
      password: !validatePassword(formData.password) ? 'Mot de passe invalide' : '',
      confirmPassword: formData.password !== formData.confirmPassword ? 'Les mots de passe ne correspondent pas' : ''
    };

    setErrors(newErrors);

    // Si pas d'erreurs, on peut soumettre
    if (!Object.values(newErrors).some(error => error !== '')) {
      try {
        await AuthService.register({
          name: formData.name,
          username: formData.username,
          email: formData.email,
          password: formData.password,
          birthDate: formData.birthDate
        });

        // Redirection vers la page d'accueil après inscription réussie
        navigate('/');
      } catch (error) {
        console.error('Erreur:', error);
        setErrors(prev => ({
          ...prev,
          email: error instanceof Error ? error.message : 'Une erreur est survenue lors de l\'inscription'
        }));
      }
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
            type="text"
            name="username"
            placeholder="Nom d'utilisateur"
            value={formData.username}
            onChange={handleChange}
            error={errors.username}
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
          <Button 
            variant={isFormValid ? "default" : "secondary"} 
            rounded="full" 
            size="xl"
            disabled={!isFormValid}
          >
            S'inscrire
          </Button>
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