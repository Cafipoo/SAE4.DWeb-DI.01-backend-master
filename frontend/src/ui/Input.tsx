import PasswordStrength from './PasswordStrength';
// import { cva } from "class-variance-authority";
// import { cn } from "../utils/cn";

// const inputVariants = cva("w-full px-4 py-3 border rounded-lg bg-black text-white focus:ring-2 focus:ring-dark-red focus:border-transparent", {
//   variants: {
//     variant: {
//       true: "border-red-800",
//       false: "border-gray-800",
//       default: "border-bg"
//     }
//   },
//   defaultVariants: {
//     variant: "default"
//   }
// });

// interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
//   variant?: boolean;
// }

// const Input = ({ variant,
//    ...props 
//   }: InputProps) => {
//   const className = inputVariants({ variant });
//   return <input className={cn(className, props.className)} {...props} />;
// };

// export default Input;

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
      className={`w-full px-4 py-3 border ${error ? 'border-gray-800' : 'border-red-800'} rounded-lg bg-black text-white focus:ring-2 focus:ring-white focus:border-transparent`}
      placeholder={placeholder}
      onChange={onChange}
      value={value}
    />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    {showPasswordStrength && type === 'password' && <PasswordStrength password={value} />}
  </div>
);

export default Input; 