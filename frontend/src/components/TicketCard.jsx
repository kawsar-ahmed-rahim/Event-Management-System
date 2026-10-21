import { Link } from "react-router-dom";
import { cap, fmtDay, fmtMonth, fmtTime, money } from "../utils.js";

export function SeatMeter({ event }) {
  const pct = Math.min(100, Math.round((event.registeredCount / event.capacity) * 100));
  return (
    <div className="seats">
      <div className="seat-bar" aria-hidden="true">
        <span style={{ width: `${pct}%` }} className={event.isFull ? "full" : ""} />
      </div>
      <span className="seat-text">
        {event.isFull ? "Full" : `${event.seatsLeft} of ${event.capacity} seats left`}
      </span>
    </div>
  );
}

export default function TicketCard({ event, to, children }) {
  return (
    <article className="ticket">
      <Link to={to || `/events/${event._id}`} className="ticket-main">
        <span className="ticket-meta">
          {cap(event.category)}
          {event.status !== "published" && <em className={`chip ${event.status}`}>{cap(event.status)}</em>}
        </span>
        <h3>{event.title}</h3>
        <p className="muted">{event.venue}, {event.city}</p>
        <div className="ticket-foot">
          <strong className="price">{money(event.price)}</strong>
          <SeatMeter event={event} />
        </div>
      </Link>
      <div className="ticket-stub" aria-label={`${fmtDay(event.startDate)} ${fmtMonth(event.startDate)}, ${fmtTime(event.startDate)}`}>
        <span className="stub-month">{fmtMonth(event.startDate)}</span>
        <span className="stub-day">{fmtDay(event.startDate)}</span>
        <span className="stub-time">{fmtTime(event.startDate)}</span>
      </div>
      {children}
    </article>
  );
}
