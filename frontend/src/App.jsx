import { Routes, Route, Link } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import RequireAuth from "./components/RequireAuth.jsx";
import Events from "./pages/Events.jsx";
import EventDetail from "./pages/EventDetail.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import MyRegistrations from "./pages/MyRegistrations.jsx";
import MyEvents from "./pages/MyEvents.jsx";
import EventForm from "./pages/EventForm.jsx";
import Attendees from "./pages/Attendees.jsx";
import Admin from "./pages/Admin.jsx";

const ORGANIZER = ["organizer", "admin"];

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/my-registrations" element={<RequireAuth><MyRegistrations /></RequireAuth>} />
          <Route path="/organizer/events" element={<RequireAuth roles={ORGANIZER}><MyEvents /></RequireAuth>} />
          <Route path="/organizer/events/new" element={<RequireAuth roles={ORGANIZER}><EventForm /></RequireAuth>} />
          <Route path="/organizer/events/:id/edit" element={<RequireAuth roles={ORGANIZER}><EventForm /></RequireAuth>} />
          <Route path="/organizer/events/:id/attendees" element={<RequireAuth roles={ORGANIZER}><Attendees /></RequireAuth>} />
          <Route path="/admin" element={<RequireAuth roles={["admin"]}><Admin /></RequireAuth>} />
          <Route
            path="*"
            element={
              <div className="page narrow">
                <h1>Page not found</h1>
                <p className="muted">That address doesn't match any page.</p>
                <Link className="btn" to="/">Browse events</Link>
              </div>
            }
          />
        </Routes>
      </main>
      <footer className="footer">showup, an event management project</footer>
    </>
  );
}
