interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => (
  <div className="min-h-screen bg-red-700 flex items-center justify-center p-4">
    <div className="max-w-md w-full space-y-8 bg-red-800 p-8 rounded-xl border border-gray-800">
      {children}
    </div>
  </div>
);

export default AuthLayout; 