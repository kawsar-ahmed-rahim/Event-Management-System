import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api.js";
import { CATEGORIES, cap } from "../utils.js";
import TicketCard from "../components/TicketCard.jsx";
import Pagination from "../components/Pagination.jsx";
import { Loading, ErrorBox, Empty } from "../components/State.jsx";

export default function Events() {
  const [params, setParams] = useSearchParams();
  const [state, setState] = useState({ loading: true, error: "", events: [], pagination: null });
  const query = params.toString();

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: "" }));
    api("/events", { params: Object.fromEntries(params) })
      .then((r) => !cancelled && setState({ loading: false, error: "", events: r.data.events, pagination: r.pagination }))
      .catch((e) => !cancelled && setState((s) => ({ ...s, loading: false, error: e.message })));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const onSubmit = (e) => {
    e.preventDefault();
    const next = {};
    for (const [k, v] of new FormData(e.currentTarget).entries()) {
      if (String(v).trim()) next[k] = String(v).trim();
    }
    setParams(next);
  };

  const setPage = (page) => {
    const next = Object.fromEntries(params);
    next.page = page;
    setParams(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const get = (k) => params.get(k) || "";

  return (
    <>
      <section className="hero">
        <div className="page">
          <h1>Find something to go to.</h1>
          <p>Browse upcoming events and reserve a seat in a few taps.</p>
          <form className="filters" onSubmit={onSubmit} key={query}>
            <input name="search" type="search" placeholder="Search by title, venue or city" defaultValue={get("search")} aria-label="Search events" className="grow" />
            <select name="category" defaultValue={get("category")} aria-label="Category">
              <option value="">All categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{cap(c)}</option>)}
            </select>
            <input name="city" placeholder="City" defaultValue={get("city")} aria-label="City" />
            <select name="free" defaultValue={get("free")} aria-label="Price">
              <option value="">Any price</option>
              <option value="true">Free</option>
              <option value="false">Paid</option>
            </select>
            <select name="sort" defaultValue={get("sort")} aria-label="Sort">
              <option value="">Soonest first</option>
              <option value="-startDate">Latest first</option>
              <option value="price">Price, low to high</option>
              <option value="-price">Price, high to low</option>
              <option value="newest">Recently added</option>
            </select>
            <label className="check">
              <input type="checkbox" name="past" value="true" defaultChecked={get("past") === "true"} />
              Past events
            </label>
            <button className="btn" type="submit">Search</button>
            {query && <button type="button" className="btn secondary" onClick={() => setParams({})}>Clear</button>}
          </form>
        </div>
      </section>

      <div className="page">
        <ErrorBox message={state.error} />
        {state.loading && <Loading label="Loading events" />}
        {!state.loading && !state.error && state.events.length === 0 && (
          <Empty title="No events match that search">
            <p className="muted">Try a different keyword, or clear the filters to see everything.</p>
          </Empty>
        )}
        <div className="ticket-grid">
          {state.events.map((ev) => <TicketCard key={ev._id} event={ev} />)}
        </div>
        <Pagination pagination={state.pagination} onPage={setPage} />
      </div>
    </>
  );
}
