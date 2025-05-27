import React, { useEffect, useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ adminOnly = false }) => {
  const { accessToken, isStaff } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const simulateLoading = setTimeout(() => {
      setIsLoading(false);
    }, 100); 

    return () => clearTimeout(simulateLoading);
  }, []);

  if (isLoading) {
    return <div></div>;
  }

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isStaff) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
