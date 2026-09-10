import React from "react";

export function ProductContentFields({ items, onChange, ingredients = false }) {
  const field = ingredients ? "name" : "benefit";
  const title = ingredients ? "Ingredients" : "Benefits";
  const update = (index, patch) =>
    onChange(
      items.map((item, position) =>
        position === index ? { ...item, ...patch } : item,
      ),
    );
  const move = (index, direction) => {
    const next = [...items];
    [next[index], next[index + direction]] = [
      next[index + direction],
      next[index],
    ];
    onChange(next);
  };

  return (
    <section className="card">
      <h2>{title}</h2>
      {!items.length && <p>No {title.toLowerCase()} added yet.</p>}
      {items.map((item, index) => (
        <div className="sku-editor" key={index}>
          <label>
            {ingredients ? "Ingredient name" : "Benefit"}
            <input
              required
              value={item[field] || ""}
              onChange={(event) =>
                update(index, { [field]: event.target.value })
              }
            />
          </label>
          {ingredients && (
            <>
              <label>
                Description
                <textarea
                  value={item.description || ""}
                  onChange={(event) =>
                    update(index, { description: event.target.value })
                  }
                />
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={!!(item.isKey ?? item.is_key)}
                  onChange={(event) =>
                    update(index, { isKey: event.target.checked })
                  }
                />
                Key ingredient
              </label>
            </>
          )}
          <div className="actions">
            <button
              type="button"
              disabled={index === 0}
              onClick={() => move(index, -1)}
            >
              Move up
            </button>
            <button
              type="button"
              disabled={index === items.length - 1}
              onClick={() => move(index, 1)}
            >
              Move down
            </button>
            <button
              type="button"
              onClick={() =>
                onChange(items.filter((_, position) => position !== index))
              }
            >
              Remove
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          onChange([
            ...items,
            {
              [field]: "",
              ...(ingredients ? { description: "", isKey: false } : {}),
            },
          ])
        }
      >
        Add {ingredients ? "ingredient" : "benefit"}
      </button>
    </section>
  );
}
