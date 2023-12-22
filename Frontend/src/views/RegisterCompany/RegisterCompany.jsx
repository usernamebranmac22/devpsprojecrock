import { useEffect } from "react";
import { useAuth } from "../../auth/AuthProvider";

const Dashboard = () => {
  const auth = useAuth();
  useEffect(() => {
    auth.checkTokenExpiration();
  }, []);
  return <div className="text-4xl text-center">Dashboard Administrativo</div>;
};

export default Dashboard;
