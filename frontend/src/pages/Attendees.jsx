import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api.js";
import { fmtDateTime } from "../utils.js";
import { Loading, ErrorBox, Empty } from "../components/State.jsx";

const csvCell = (v) => `"${String(v).replace(/"/g, '""')}"`;

export default function Attendees() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api(`/events/${id}`), api(`/events/${id}/attendees`)])
      .then(([e, a]) => {
        setEvent(e.data.event);
        setAttendees(a.data.attendees);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  const exportCsv = () => {
    const rows = [["Name", "Email", "Registered on"], ...attendees.map((a) => [a.user.name, a.user.email, a.createdAt])];
    const blob = new Blob([rows.map((r) => r.map(csvCell).join(",")).join("\n")], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${event.title.replace(/\W+/g, "-").toLowerCase()}-attendees.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="page">
      <Link to={`/events/${id}`} className="back">Back to event</Link>
      <div className="page-head">
        <h1>{event ? `Attendees: ${event.title}` : "Attendees"}</h1>
        {attendees?.length > 0 && <button className="btn secondary" onClick={exportCsv}>Download CSV</button>}
      </div>
      <ErrorBox message={error} />
      {!attendees && !error && <Loading />}
      {attendees?.length === 0 && <Empty title="No one has registered yet" />}
      {attendees?.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Registered</th></tr></thead>
            <tbody>
              {attendees.map((a) => (
                <tr key={a._id}><td>{a.user.name}</td><td>{a.user.email}</td><td>{fmtDateTime(a.createdAt)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
