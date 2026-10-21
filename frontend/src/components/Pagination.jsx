export default function Pagination({ pagination, onPage }) {
  if (!pagination || pagination.pages <= 1) return null;
  const { page, pages } = pagination;
  return (
    <nav className="pagination" aria-label="Pagination">
      <button className="btn secondary small" disabled={page <= 1} onClick={() => onPage(page - 1)}>Previous</button>
      <span className="muted">Page {page} of {pages}</span>
      <button className="btn secondary small" disabled={page >= pages} onClick={() => onPage(page + 1)}>Next</button>
    </nav>
  );
}
