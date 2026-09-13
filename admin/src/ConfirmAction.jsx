import React, { useEffect, useRef, useState } from "react";

export function ConfirmAction({ title, description, onConfirm, onClose }) {
  const dialog = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    dialog.current.showModal();
  }, []);
  return (
    <dialog
      ref={dialog}
      className="confirm-dialog"
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
    >
      <h2>{title}</h2>
      <p>{description}</p>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <div className="actions">
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await onConfirm();
              onClose();
            } catch (caught) {
              setError(caught.message || "Action failed. Please retry.");
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "Please wait…" : "Confirm"}
        </button>
        <button type="button" disabled={busy} autoFocus onClick={onClose}>
          Cancel
        </button>
      </div>
    </dialog>
  );
}
