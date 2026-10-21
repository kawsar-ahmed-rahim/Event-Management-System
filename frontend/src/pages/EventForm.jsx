import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api.js";
import { useToast } from "../toast.jsx";
import { CATEGORIES, cap, toLocalInput } from "../utils.js";
import { Loading, FormErrors } from "../components/State.jsx";

const EMPTY = {
  title: "", description: "", category: "other", venue: "", city: "",
  startDate: "", endDate: "", price: 0, capacity: 50, imageUrl: "", status: "published",
};

export default function EventForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(editing);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!editing) return;
    api(`/events/${id}`)
      .then((r) => {
        const ev = r.data.event;
        setForm({
          title: ev.title, description: ev.description, category: ev.category, venue: ev.venue, city: ev.city,
          startDate: toLocalInput(ev.startDate), endDate: toLocalInput(ev.endDate),
          price: ev.price, capacity: ev.capacity, imageUrl: ev.imageUrl || "", status: ev.status,
        });
      })
      .catch((e) => setError(e))
      .finally(() => setLoading(false));
  }, [id, editing]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const body = {
      ...form,
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
      price: Number(form.price),
      capacity: Number(form.capacity),
    };
    try {
      const r = editing
        ? await api(`/events/${id}`, { method: "PATCH", body })
        : await api("/events", { method: "POST", body });
      toast(editing ? "Changes saved" : "Event created");
      navigate(`/events/${r.data.event._id}`);
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="page narrow wide">
      <h1>{editing ? "Edit event" : "Create event"}</h1>
      <form className="form" onSubmit={onSubmit}>
        <FormErrors error={error} />
        <label>Title
          <input required minLength={3} maxLength={120} value={form.title} onChange={set("title")} />
        </label>
        <label>Description
          <textarea required rows={5} maxLength={5000} value={form.description} onChange={set("description")} />
        </label>
        <div className="row">
          <label>Category
            <select value={form.category} onChange={set("category")}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{cap(c)}</option>)}
            </select>
          </label>
          <label>Status
            <select value={form.status} onChange={set("status")}>
              <option value="published">Published (visible to everyone)</option>
              <option value="draft">Draft (only you can see it)</option>
              {editing && <option value="cancelled">Cancelled</option>}
            </select>
          </label>
        </div>
        <div className="row">
          <label>Venue
            <input required value={form.venue} onChange={set("venue")} />
          </label>
          <label>City
            <input required value={form.city} onChange={set("city")} />
          </label>
        </div>
        <div className="row">
          <label>Starts
            <input type="datetime-local" required value={form.startDate} onChange={set("startDate")} />
          </label>
          <label>Ends
            <input type="datetime-local" required value={form.endDate} onChange={set("endDate")} />
          </label>
        </div>
        <div className="row">
          <label>Price (0 for free)
            <input type="number" min={0} step="1" required value={form.price} onChange={set("price")} />
          </label>
          <label>Capacity (seats)
            <input type="number" min={1} step="1" required value={form.capacity} onChange={set("capacity")} />
          </label>
        </div>
        <label>Cover image URL (optional)
          <input type="url" placeholder="https://..." value={form.imageUrl} onChange={set("imageUrl")} />
        </label>
        <div className="row actions">
          <button className="btn" disabled={busy}>{busy ? "Saving..." : editing ? "Save changes" : "Create event"}</button>
          <Link className="btn secondary" to="/organizer/events">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
