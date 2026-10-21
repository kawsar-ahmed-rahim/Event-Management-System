import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useToast } from "../toast.jsx";
import TicketCard from "../components/TicketCard.jsx";
import { Loading, ErrorBox, Empty } from "../components/State.jsx";

export default function MyEvents() {
  const toast = useToast();
  const [events, setEvents] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/events/mine")
      .then((r) => setEvents(r.data.events))
      .catch((e) => setError(e.message));
  }, []);

  const remove = async (ev) => {
    if (!window.confirm(`Delete "${ev.title}" and all its registrations? This can't be undone.`)) return;
    try {
      await api(`/events/${ev._id}`, { method: "DELETE" });
      setEvents((list) => list.filter((x) => x._id !== ev._id));
      toast("Event deleted");
    } catch (e) {
      toast(e.message, "error");
    }
  };

  return (
    <div className="page">
      <div className="page-head">
        <h1>My events</h1>
        <Link className="btn" to="/organizer/events/new">Create event</Link>
      </div>
      <ErrorBox message={error} />
      {!events && !error && <Loading />}
      {events?.length === 0 && (
        <Empty title="You haven't created an event yet">
          <p className="muted">Events you create show up here, including drafts.</p>
          <Link className="btn" to="/organizer/events/new">Create your first event</Link>
        </Empty>
      )}
      <div className="ticket-grid">
        {events?.map((ev) => (
          <TicketCard key={ev._id} event={ev}>
            <div className="ticket-actions">
              <Link className="btn secondary small" to={`/organizer/events/${ev._id}/edit`}>Edit</Link>
              <Link className="btn secondary small" to={`/organizer/events/${ev._id}/attendees`}>Attendees ({ev.registeredCount})</Link>
              <button className="btn danger small" onClick={() => remove(ev)}>Delete</button>
            </div>
          </TicketCard>
        ))}
      </div>
    </div>
  );
}
