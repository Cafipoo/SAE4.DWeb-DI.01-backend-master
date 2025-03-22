import PasswordStrength from './PasswordStrength';

interface InputProps {
  type: string;
  name: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  showPasswordStrength?: boolean;
}

const Input = ({ 
  type, 
  name, 
  placeholder, 
  value, 
  onChange, 
  error,
  showPasswordStrength 
}: InputProps) => (
  <div>
    <input
      type={type}
      name={name}
      required
      className={`w-full px-4 py-3 border ${error ? 'border-red-500' : 'border-gray-800'} rounded-lg bg-black text-white focus:ring-2 focus:ring-white focus:border-transparent`}
      placeholder={placeholder}
      onChange={onChange}
      value={value}
    />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    {showPasswordStrength && type === 'password' && <PasswordStrength password={value} />}
  </div>
);

export default Input; 