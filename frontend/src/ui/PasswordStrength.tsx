interface PasswordStrengthProps {
  password: string;
}

const PasswordStrength = ({ password }: PasswordStrengthProps) => {
  const requirements = [
    { test: (p: string) => p.length >= 8, message: "Au moins 8 caractères" },
    { test: (p: string) => /[A-Z]/.test(p), message: "Une lettre majuscule" },
    { test: (p: string) => /[a-z]/.test(p), message: "Une lettre minuscule" },
    { test: (p: string) => /[0-9]/.test(p), message: "Un chiffre" },
    { test: (p: string) => /[^A-Za-z0-9]/.test(p), message: "Un caractère spécial" }
  ];

  const getPasswordStrength = (password: string) => {
    return requirements.reduce((strength, req) => 
      strength + (req.test(password) ? 1 : 0), 0
    );
  };

  const strength = getPasswordStrength(password);
  const width = `${(strength / 5) * 100}%`;
  
  const getColor = () => {
    switch(strength) {
      case 0:
      case 1: return 'bg-red-500';
      case 2: return 'bg-orange-500';
      case 3: return 'bg-yellow-500';
      case 4: return 'bg-green-500';
      case 5: return 'bg-emerald-500';
      default: return 'bg-gray-500';
    }
  };

  // Filtrer les exigences non satisfaites
  const missingRequirements = requirements.filter(req => !req.test(password));

  return (
    <div className="mt-2">
      <div className="h-1 w-full bg-gray-800 rounded-full">
        <div 
          className={`h-1 rounded-full transition-all duration-300 ${getColor()}`}
          style={{ width }}
        />
      </div>
      {missingRequirements.length > 0 && (
        <div className="mt-2 space-y-1">
          {missingRequirements.map((req, index) => (
            <p key={index} className="text-sm text-gray-400 flex items-center">
              <span className="mr-2">•</span>
              {req.message}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default PasswordStrength; 