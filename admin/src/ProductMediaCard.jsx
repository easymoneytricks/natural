import React, { useEffect, useState } from "react";

export function ProductMediaCard({ item, src, onSave, onRemove, disabled }) {
  const [altText, setAltText] = useState(item.alt_text || "");
  const [sortOrder, setSortOrder] = useState(item.sort_order || 0);
  useEffect(() => {
    setAltText(item.alt_text || "");
    setSortOrder(item.sort_order || 0);
  }, [item.alt_text, item.sort_order]);
  return (
    <div className="media-item">
      <img className="thumb" src={src} alt={item.alt_text || "Product image"} />
      <label>
        Alt text
        <input
          value={altText}
          onChange={(event) => setAltText(event.target.value)}
        />
      </label>
      <label>
        Display order
        <input
          type="number"
          min="0"
          step="1"
          value={sortOrder}
          onChange={(event) => setSortOrder(event.target.value)}
        />
      </label>
      <div className="actions">
        <button
          type="button"
          disabled={disabled}
          onClick={() =>
            onSave(item, { altText, sortOrder: Number(sortOrder) })
          }
        >
          Save image
        </button>
        <button
          type="button"
          disabled={disabled || !!item.is_primary}
          onClick={() => onSave(item, { primary: true })}
        >
          {item.is_primary ? "Primary image" : "Make primary"}
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onRemove(item)}
        >
          Remove
        </button>
      </div>
    </div>
  );
}
