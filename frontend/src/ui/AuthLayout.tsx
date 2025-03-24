interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => (
  <div className="min-h-screen bg-dark-red flex items-center justify-center p-4">
    <div className="max-w-md w-full space-y-8 bg-black p-8 rounded-xl">
      {children}
    </div>
  </div>
);

export default AuthLayout; 