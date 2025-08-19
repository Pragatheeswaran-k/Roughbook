import { useSession } from "@supabase/auth-helpers-react";
import { Navigate, useLocation } from "react-router-dom";
import React from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const session = useSession();
  const location = useLocation();

  if (!session) {
    // Redirect to login page, but remember where we came from
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Render children if authenticated
  return <>{children}</>;
};

export default ProtectedRoute;
