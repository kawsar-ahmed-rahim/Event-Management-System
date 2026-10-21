import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";
import { useToast } from "../toast.jsx";
import { cap, fmtDateTime, hasEnded, money } from "../utils.js";
import { SeatMeter } from "../components/TicketCard.jsx";
import { Loading, ErrorBox } from "../components/State.jsx";

export default function EventDetail() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await api(`/events/${id}`);
      setEvent(r.data.event);
      setError("");
    } catch (e) {
      setError(e.message);
    }
  }, [id]);

  // Re-load once auth is known so "isRegistered" reflects the logged-in user.
  useEffect(() => {
    if (!authLoading) load();
  }, [load, authLoading, user?._id]);

  const run = async (fn, successMessage) => {
    setBusy(true);
    try {
      await fn();
      toast(successMessage);
      await load();
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setBusy(false);
    }
  };

  const register = () => run(() => api(`/events/${id}/register`, { method: "POST" }), "You're registered");
  const cancel = () => {
    if (window.confirm("Cancel your registration for this event?")) {
      run(() => api(`/events/${id}/register`, { method: "DELETE" }), "Registration cancelled");
    }
  };
  const remove = async () => {
    if (!window.confirm("Delete this event and all its registrations? This can't be undone.")) return;
    try {
      await api(`/events/${id}`, { method: "DELETE" });
      toast("Event deleted");
      navigate("/organizer/events");
    } catch (e) {
      toast(e.message, "error");
    }
  };

  if (error) return <div className="page narrow"><ErrorBox message={error} /><Link to="/" className="btn secondary">Back to events</Link></div>;
  if (!event) return <Loading label="Loading event" />;

  const ended = hasEnded(event);
  const closed = event.status === "cancelled" || ended;

  return (
    <div className="page detail">
      <Link to="/" className="back">Back to events</Link>
      {event.imageUrl && (
        <img className="cover" src={event.imageUrl} alt="" onError={(e) => (e.currentTarget.style.display = "none")} />
      )}
      <div className="detail-grid">
        <div>
          <p className="muted">{cap(event.category)}{event.status !== "published" && ` (${event.status})`}</p>
          <h1>{event.title}</h1>
          <p className="description">{event.description}</p>
        </div>

        <aside className="booking">
          <dl>
            <dt>Starts</dt><dd>{fmtDateTime(event.startDate)}</dd>
            <dt>Ends</dt><dd>{fmtDateTime(event.endDate)}</dd>
            <dt>Where</dt><dd>{event.venue}, {event.city}</dd>
            <dt>Price</dt><dd>{money(event.price)}</dd>
            <dt>Organizer</dt><dd>{event.organizer?.name}</dd>
          </dl>
          <SeatMeter event={event} />

          <div className="booking-actions">
            {event.status === "cancelled" && <p className="alert error">This event was cancelled.</p>}
            {ended && event.status !== "cancelled" && <p className="muted">This event has ended.</p>}
            {!closed && !user && (
              <Link className="btn block" to="/login" state={{ from: location.pathname }}>Log in to register</Link>
            )}
            {!closed && user && event.isRegistered && (
              <>
                <p className="alert ok">You're registered for this event.</p>
                <button className="btn secondary block" onClick={cancel} disabled={busy}>Cancel registration</button>
              </>
            )}
            {!closed && user && !event.isRegistered && (
              <button className="btn block" onClick={register} disabled={busy || event.isFull}>
                {event.isFull ? "Event is full" : busy ? "Registering..." : "Register for this event"}
              </button>
            )}
          </div>

          {event.canManage && (
            <div className="manage">
              <Link className="btn secondary small" to={`/organizer/events/${id}/edit`}>Edit</Link>
              <Link className="btn secondary small" to={`/organizer/events/${id}/attendees`}>Attendees</Link>
              <button className="btn danger small" onClick={remove}>Delete</button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
