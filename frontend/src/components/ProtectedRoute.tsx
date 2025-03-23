import { useNavigate, useLocation } from "react-router-dom";
import React, { useEffect } from "react";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    
    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            if (location.pathname !== '/register' && location.pathname !== '/login' && location.pathname !== '/admin') {
                if (location.pathname === '/backoffice') {
                    navigate('/admin');
                }
                else {
                    navigate('/login');
                }
            }
        }
    }, [navigate, location]);

    return children;
}

export default ProtectedRoute;