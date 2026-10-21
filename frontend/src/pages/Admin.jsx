import { useCallback, useEffect, useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";
import { useToast } from "../toast.jsx";
import { cap } from "../utils.js";
import Pagination from "../components/Pagination.jsx";
import { Loading, ErrorBox } from "../components/State.jsx";

export default function Admin() {
  const { user: me } = useAuth();
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [role, setRole] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api("/admin/stats").then((r) => setStats(r.data)).catch((e) => setError(e.message));
  }, []);

  const loadUsers = useCallback(() => {
    api("/admin/users", { params: { page, role } })
      .then((r) => { setUsers(r.data.users); setPagination(r.pagination); })
      .catch((e) => setError(e.message));
  }, [page, role]);

  useEffect(loadUsers, [loadUsers]);

  const changeRole = async (u, newRole) => {
    try {
      await api(`/admin/users/${u._id}/role`, { method: "PATCH", body: { role: newRole } });
      toast(`${u.name} is now ${newRole === "admin" ? "an admin" : `a${newRole === "organizer" ? "n" : ""} ${newRole}`}`);
      loadUsers();
    } catch (e) {
      toast(e.message, "error");
    }
  };

  const maxCat = Math.max(1, ...(stats?.eventsByCategory.map((c) => c.count) || [1]));

  return (
    <div className="page">
      <h1>Admin</h1>
      <ErrorBox message={error} />
      {!stats && !error && <Loading />}
      {stats && (
        <>
          <dl className="stats">
            <div><dd>{stats.users}</dd><dt>Users</dt></div>
            <div><dd>{stats.events}</dd><dt>Events</dt></div>
            <div><dd>{stats.upcomingEvents}</dd><dt>Upcoming events</dt></div>
            <div><dd>{stats.registrations}</dd><dt>Active registrations</dt></div>
          </dl>
          {stats.eventsByCategory.length > 0 && (
            <section>
              <h2>Events by category</h2>
              <ul className="bars">
                {stats.eventsByCategory.map((c) => (
                  <li key={c._id}>
                    <span>{cap(c._id)}</span>
                    <div><i style={{ width: `${(c.count / maxCat) * 100}%` }} /></div>
                    <b>{c.count}</b>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      <section>
        <div className="page-head">
          <h2>Users</h2>
          <select value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }} aria-label="Filter by role">
            <option value="">All roles</option>
            <option value="user">Users</option>
            <option value="organizer">Organizers</option>
            <option value="admin">Admins</option>
          </select>
        </div>
        {!users && !error && <Loading />}
        {users && (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <select value={u.role} disabled={u._id === me._id} onChange={(e) => changeRole(u, e.target.value)} aria-label={`Role for ${u.name}`}>
                        <option value="user">User</option>
                        <option value="organizer">Organizer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination pagination={pagination} onPage={setPage} />
      </section>
    </div>
  );
}
