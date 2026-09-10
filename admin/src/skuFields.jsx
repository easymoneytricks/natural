import React from "react";

export function SkuFields({
  sku,
  onChange,
  assignments,
  attributes,
  media = [],
}) {
  const setField = (key, value) => onChange({ ...sku, [key]: value });
  const setValue = (attributeId, valueId) => {
    const remaining = sku.attributes.filter(
      (item) => Number(item.attributeId) !== Number(attributeId),
    );
    onChange({
      ...sku,
      attributes: valueId
        ? [...remaining, { attributeId, valueId: Number(valueId) }]
        : remaining,
    });
  };

  return (
    <>
      <fieldset>
        <legend>SKU gallery images</legend>
        <p>Select existing product images. The first selection is primary.</p>
        {media.map((image) => (
          <label key={image.id}>
            <input
              type="checkbox"
              checked={(sku.mediaIds || []).includes(Number(image.id))}
              onChange={(event) =>
                setField(
                  "mediaIds",
                  event.target.checked
                    ? [...(sku.mediaIds || []), Number(image.id)]
                    : sku.mediaIds.filter((id) => id !== Number(image.id)),
                )
              }
            />
            {image.alt_text || `Gallery image ${image.id}`}
          </label>
        ))}
      </fieldset>
      <label>
        Barcode
        <input
          value={sku.barcode || ""}
          onChange={(event) => setField("barcode", event.target.value)}
        />
      </label>
      <label>
        Weight in grams
        <input
          type="number"
          min="0"
          step="1"
          value={sku.weightGrams}
          onChange={(event) => setField("weightGrams", event.target.value)}
        />
      </label>
      {assignments.map((assignment) => {
        const attribute = attributes.find(
          (item) => Number(item.id) === Number(assignment.attributeId),
        );
        if (!attribute) return null;
        const selected = sku.attributes.find(
          (item) => Number(item.attributeId) === Number(attribute.id),
        );
        const allowed = new Set(
          assignment.values.map((item) => Number(item.valueId)),
        );
        return (
          <label key={attribute.id}>
            {attribute.name}
            {Boolean(assignment.isRequired) ? " (required)" : " (optional)"}
            <select
              value={selected?.valueId || ""}
              onChange={(event) => setValue(attribute.id, event.target.value)}
            >
              <option value="">Choose a value</option>
              {attribute.values
                .filter((value) => allowed.has(Number(value.id)))
                .map((value) => (
                  <option key={value.id} value={value.id}>
                    {value.display_value || value.value}
                  </option>
                ))}
            </select>
          </label>
        );
      })}
      {[
        ["isActive", "Active"],
        ["trackInventory", "Track inventory"],
        ["allowBackorder", "Allow backorders"],
      ].map(([key, label]) => (
        <label key={key}>
          <input
            type="checkbox"
            checked={!!sku[key]}
            onChange={(event) => setField(key, event.target.checked)}
          />
          {label}
        </label>
      ))}
    </>
  );
}
