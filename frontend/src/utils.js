export const CATEGORIES = ["conference", "workshop", "concert", "sports", "networking", "exhibition", "other"];
export const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");

const fmt = (opts) => new Intl.DateTimeFormat("en-GB", opts);
export const fmtDay = (d) => fmt({ day: "numeric" }).format(new Date(d));
export const fmtMonth = (d) => fmt({ month: "short" }).format(new Date(d));
export const fmtTime = (d) => fmt({ hour: "numeric", minute: "2-digit", hour12: true }).format(new Date(d));
export const fmtFull = (d) => fmt({ weekday: "short", day: "numeric", month: "long", year: "numeric" }).format(new Date(d));
export const fmtDateTime = (d) => `${fmtFull(d)}, ${fmtTime(d)}`;

// Change the currency here if you don't use BDT.
export const money = (n) =>
  n > 0 ? new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 0 }).format(n) : "Free";

// <input type="datetime-local"> wants local time without a timezone suffix.
export const toLocalInput = (d) => {
  const x = new Date(d);
  x.setMinutes(x.getMinutes() - x.getTimezoneOffset());
  return x.toISOString().slice(0, 16);
};

export const hasEnded = (event) => new Date(event.endDate) < new Date();
