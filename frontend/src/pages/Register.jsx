import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";
import { useToast } from "../toast.jsx";
import { FormErrors } from "../components/State.jsx";

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user" });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await register(form);
      toast("Account created");
      navigate(form.role === "organizer" ? "/organizer/events" : "/", { replace: true });
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page narrow">
      <h1>Create your account</h1>
      <form className="form" onSubmit={onSubmit}>
        <FormErrors error={error} />
        <label>Name
          <input required minLength={2} autoComplete="name" value={form.name} onChange={set("name")} />
        </label>
        <label>Email
          <input type="email" required autoComplete="email" value={form.email} onChange={set("email")} />
        </label>
        <label>Password
          <input type="password" required minLength={8} autoComplete="new-password" value={form.password} onChange={set("password")} />
          <small className="muted">At least 8 characters, with a letter and a number.</small>
        </label>
        <fieldset>
          <legend>I want to</legend>
          <label className="check"><input type="radio" name="role" value="user" checked={form.role === "user"} onChange={set("role")} /> Attend events</label>
          <label className="check"><input type="radio" name="role" value="organizer" checked={form.role === "organizer"} onChange={set("role")} /> Organize events</label>
        </fieldset>
        <button className="btn" disabled={busy}>{busy ? "Creating account..." : "Create account"}</button>
        <p className="muted">Already have an account? <Link to="/login">Log in</Link></p>
      </form>
    </div>
  );
}
