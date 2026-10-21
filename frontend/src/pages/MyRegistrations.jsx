import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useToast } from "../toast.jsx";
import { hasEnded } from "../utils.js";
import TicketCard from "../components/TicketCard.jsx";
import { Loading, ErrorBox, Empty } from "../components/State.jsx";

export default function MyRegistrations() {
  const toast = useToast();
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/registrations/me")
      .then((r) => setItems(r.data.registrations))
      .catch((e) => setError(e.message));
  }, []);

  const cancel = async (eventId) => {
    if (!window.confirm("Cancel your registration for this event?")) return;
    try {
      await api(`/events/${eventId}/register`, { method: "DELETE" });
      setItems((list) => list.filter((r) => r.event._id !== eventId));
      toast("Registration cancelled");
    } catch (e) {
      toast(e.message, "error");
    }
  };

  return (
    <div className="page">
      <h1>My registrations</h1>
      <ErrorBox message={error} />
      {!items && !error && <Loading />}
      {items?.length === 0 && (
        <Empty title="You haven't registered for anything yet">
          <Link className="btn" to="/">Browse events</Link>
        </Empty>
      )}
      <div className="ticket-grid">
        {items?.map((r) => (
          <TicketCard key={r._id} event={r.event}>
            {!hasEnded(r.event) && (
              <div className="ticket-actions">
                <button className="btn secondary small" onClick={() => cancel(r.event._id)}>Cancel registration</button>
              </div>
            )}
          </TicketCard>
        ))}
      </div>
    </div>
  );
}
