import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth.jsx";
import { Loading } from "./State.jsx";

export default function RequireAuth({ roles, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  if (roles && !roles.includes(user.role)) {
    return (
      <div className="page narrow">
        <h1>You don't have access to this page</h1>
        <p className="muted">This area is for {roles.join(" and ")} accounts.</p>
      </div>
    );
  }
  return children;
}
