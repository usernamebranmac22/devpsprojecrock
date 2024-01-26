import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  return (
    <>
      <Outlet />
    </>
  );
}
