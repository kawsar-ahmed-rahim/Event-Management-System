import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";
import { useToast } from "../toast.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    toast("Logged out");
    navigate("/");
  };

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link to="/" className="brand">showup</Link>
        <nav className="nav-links" aria-label="Main">
          <NavLink to="/" end>Events</NavLink>
          {user && <NavLink to="/my-registrations">My registrations</NavLink>}
          {user && ["organizer", "admin"].includes(user.role) && <NavLink to="/organizer/events">My events</NavLink>}
          {user?.role === "admin" && <NavLink to="/admin">Admin</NavLink>}
        </nav>
        <div className="nav-user">
          {user ? (
            <>
              <span className="muted nav-name">{user.name}</span>
              <button className="btn secondary small" onClick={onLogout}>Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-login">Log in</Link>
              <Link to="/register" className="btn small">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
