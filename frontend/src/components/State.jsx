export const Loading = ({ label = "Loading" }) => (
  <div className="state" role="status">{label}...</div>
);

export const ErrorBox = ({ message }) =>
  message ? <div className="alert error" role="alert">{message}</div> : null;

export const Empty = ({ title, children }) => (
  <div className="state empty">
    <h2>{title}</h2>
    {children}
  </div>
);

// Shows the API message plus any per-field validation errors.
export const FormErrors = ({ error }) =>
  error ? (
    <div className="alert error" role="alert">
      <strong>{error.message}</strong>
      {error.errors?.length > 0 && (
        <ul>
          {error.errors.map((e, i) => (
            <li key={i}>{e.field ? `${e.field}: ` : ""}{e.message}</li>
          ))}
        </ul>
      )}
    </div>
  ) : null;
