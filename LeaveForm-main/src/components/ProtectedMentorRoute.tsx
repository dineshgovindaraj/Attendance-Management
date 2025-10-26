import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedMentorRouteProps {
  children: React.ReactNode;
}

const ProtectedMentorRoute: React.FC<ProtectedMentorRouteProps> = ({ children }) => {
  const isLoggedIn = localStorage.getItem('isMentorLoggedIn') === 'true';

  if (!isLoggedIn) {
    return <Navigate to="/mentor-login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedMentorRoute;