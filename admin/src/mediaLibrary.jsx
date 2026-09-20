import React, { useEffect, useRef, useState } from "react";
import {
  Eye,
  Image,
  LoaderCircle,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useAuth } from "./main";

const assetUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const base = (
    import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1"
  ).replace(/\/api\/v1\/?$/, "");
  return `${base}/${path.replace(/^\//, "")}`;
};

export function MediaLibrary() {
  const { authFetch } = useAuth();
  const [assets, setAssets] = useState([]);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [selected, setSelected] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [uploadAltText, setUploadAltText] = useState("");
  const [uploadType, setUploadType] = useState("general");
  const [altDraft, setAltDraft] = useState("");
  const [savingDetails, setSavingDetails] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");
  const fileInputRef = useRef(null);
  const chooseFile = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setPendingFile(file);
    setUploadAltText("");
    setUploadType("general");
  };
  const uploadFile = async (event) => {
    const file = pendingFile;
    if (!file) return;
    setUploading(true);
    setError("");
    setUploadMessage("");
    try {
      const form = new FormData();
      form.append("image", file);
      form.append("altText", uploadAltText);
      form.append("usageType", uploadType);
      const response = await authFetch("/admin/media", {
        method: "POST",
        body: form,
      });
      setAssets((current) => [response.data, ...current]);
      setUploadMessage("Image uploaded to the library.");
      setPendingFile(null);
    } catch (caught) {
      setError(caught.message || "Unable to upload image.");
    } finally {
      setUploading(false);
    }
  };
  const deleteAsset = async () => {
    if (!selected || deleting) return;
    if (!window.confirm(`Delete “${selected.name}” from the media library?`)) {
      return;
    }
    setDeleting(true);
    setError("");
    try {
      await authFetch(`/admin/media/${selected.id}?type=${selected.type}`, {
        method: "DELETE",
      });
      setAssets((current) =>
        current.filter(
          (asset) =>
            !(asset.id === selected.id && asset.type === selected.type),
        ),
      );
      setSelected(null);
      setUploadMessage("Image deleted from the library.");
    } catch (caught) {
      setError(caught.message || "Unable to delete image.");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setError("");
    authFetch(`/admin/media?q=${encodeURIComponent(query)}&type=${type}`)
      .then((response) => setAssets(response.data || []))
      .catch((caught) =>
        setError(caught.message || "Unable to load media library."),
      )
      .finally(() => setLoading(false));
  }, [query, type]);

  return (
    <div className="media-library-page">
      <div className="page-head catalog-page-head">
        <div>
          <span className="section-kicker">CONTENT / MEDIA</span>
          <h1>Media library</h1>
          <p>
            One organised home for every brand mark, category image and product
            gallery asset.
          </p>
        </div>
        <div className="media-library-actions">
          <label className="button media-upload-button">
            <Upload size={16} /> {uploading ? "Uploading…" : "Upload image"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={chooseFile}
              disabled={uploading}
              hidden
            />
          </label>
          <div className="media-library-count">
            <b>{assets.length}</b>
            <span>visible assets</span>
          </div>
        </div>
      </div>
      <div className="media-library-toolbar">
        <div className="search-field">
          <Search size={17} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by file name or asset"
          />
        </div>
        <div className="media-type-filter">
          <button
            className={type === "all" ? "is-active" : ""}
            onClick={() => setType("all")}
          >
            All
          </button>
          <button
            className={type === "brand" ? "is-active" : ""}
            onClick={() => setType("brand")}
          >
            Brands
          </button>
          <button
            className={type === "category" ? "is-active" : ""}
            onClick={() => setType("category")}
          >
            Categories
          </button>
          <button
            className={type === "product" ? "is-active" : ""}
            onClick={() => setType("product")}
          >
            Products
          </button>
        </div>
      </div>
      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}
      {uploadMessage && (
        <div className="notice" role="status">
          {uploadMessage}
        </div>
      )}
      <div className="media-library-grid">
        {loading ? (
          <div className="catalog-state card">
            <LoaderCircle className="spin" size={24} />
            <p>Loading media library…</p>
          </div>
        ) : assets.length === 0 ? (
          <div className="catalog-state card">
            <Image size={28} />
            <h2>No media found</h2>
            <p>
              Upload an image from a brand, category or product editor and it
              will appear here.
            </p>
          </div>
        ) : (
          assets.map((asset) => (
            <article
              className="media-library-card"
              key={`${asset.type}-${asset.id}`}
            >
              <button
                className="media-library-preview"
                type="button"
                onClick={() => {
                  setSelected(asset);
                  setAltDraft(asset.altText || "");
                }}
                aria-label={`View details for ${asset.name}`}
              >
                <img
                  src={assetUrl(asset.path)}
                  alt={asset.altText || asset.name}
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                    event.currentTarget.nextElementSibling?.classList.add(
                      "is-visible",
                    );
                  }}
                />
                <span className="media-image-fallback" aria-hidden="true">
                  {asset.name.slice(0, 1).toUpperCase()}
                </span>
                <span className="media-preview-overlay">
                  <Eye size={18} /> View details
                </span>
              </button>
              <div className="media-library-meta">
                <div>
                  <span className={`media-type-pill ${asset.type}`}>
                    {asset.type}
                  </span>
                  {asset.primary && (
                    <span className="media-primary-pill">Primary</span>
                  )}
                  {asset.type === "unassigned" && asset.usageType && (
                    <span className="media-primary-pill">
                      {asset.usageType}
                    </span>
                  )}
                </div>
                <h2>{asset.name}</h2>
                <p>{asset.altText || "No alt text added"}</p>
                <small>{asset.path}</small>
              </div>
            </article>
          ))
        )}
      </div>
      {pendingFile && (
        <div className="modal-backdrop" role="presentation">
          <section
            className="modal-card media-detail-modal"
            role="dialog"
            aria-modal="true"
          >
            <button
              className="modal-close"
              type="button"
              onClick={() => setPendingFile(null)}
              aria-label="Close upload details"
            >
              <X size={20} />
            </button>
            <h2>Image details</h2>
            <p>{pendingFile.name}</p>
            <label className="media-detail-alt-field">
              Image type
              <select
                value={uploadType}
                onChange={(event) => setUploadType(event.target.value)}
              >
                <option value="general">General image</option>
                <option value="brand">Brand image</option>
                <option value="category">Category image</option>
                <option value="product">Product image</option>
              </select>
            </label>
            <label className="media-detail-alt-field">
              Alt text
              <input
                value={uploadAltText}
                onChange={(event) => setUploadAltText(event.target.value)}
                maxLength={255}
                placeholder="Describe this image"
              />
            </label>
            <div className="modal-actions media-detail-actions">
              <button
                className="button-secondary"
                type="button"
                onClick={() => setPendingFile(null)}
              >
                Cancel
              </button>
              <button
                className="button"
                type="button"
                onClick={uploadFile}
                disabled={uploading}
              >
                {uploading ? "Uploading…" : "Upload image"}
              </button>
            </div>
          </section>
        </div>
      )}
      {selected && (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => !deleting && setSelected(null)}
        >
          <section
            className="modal-card media-detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="media-detail-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Close media details"
            >
              <X size={20} />
            </button>
            <div className="media-detail-image">
              <img
                src={assetUrl(selected.path)}
                alt={selected.altText || selected.name}
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                  event.currentTarget.nextElementSibling?.classList.add(
                    "is-visible",
                  );
                }}
              />
              <span className="media-image-fallback" aria-hidden="true">
                {selected.name.slice(0, 1).toUpperCase()}
              </span>
            </div>
            <span className={`media-type-pill ${selected.type}`}>
              {selected.type}
            </span>
            <h2 id="media-detail-title">{selected.name}</h2>
            {selected.type === "unassigned" && (
              <label className="media-detail-alt-field">
                Alt text
                <input
                  value={altDraft}
                  onChange={(event) => setAltDraft(event.target.value)}
                  maxLength={255}
                  placeholder="Describe this image"
                />
              </label>
            )}
            <dl className="media-detail-meta">
              <div>
                <dt>Alt text</dt>
                <dd>{selected.altText || "Not provided"}</dd>
              </div>
              <div>
                <dt>File path</dt>
                <dd>{selected.path}</dd>
              </div>
              <div>
                <dt>Updated</dt>
                <dd>
                  {selected.updatedAt
                    ? new Date(selected.updatedAt).toLocaleString("en-IN")
                    : "—"}
                </dd>
              </div>
            </dl>
            <div className="modal-actions media-detail-actions">
              {selected.type === "unassigned" && (
                <button
                  className="button-secondary"
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(
                      assetUrl(selected.path),
                    );
                    setCopyMessage("Link copied");
                    window.setTimeout(() => setCopyMessage(""), 1800);
                  }}
                >
                  {copyMessage || "Copy image link"}
                </button>
              )}
              <button
                className="button-secondary"
                type="button"
                onClick={async () => {
                  setSavingDetails(true);
                  try {
                    const response = await authFetch(
                      `/admin/media/${selected.id}`,
                      {
                        method: "PATCH",
                        body: JSON.stringify({
                          altText: altDraft,
                          usageType: selected.usageType || "general",
                        }),
                      },
                    );
                    setSelected((current) =>
                      current
                        ? { ...current, altText: response.data.altText }
                        : current,
                    );
                    setAssets((current) =>
                      current.map((asset) =>
                        asset.id === selected.id && asset.type === selected.type
                          ? { ...asset, altText: response.data.altText }
                          : asset,
                      ),
                    );
                    setUploadMessage("Media details saved.");
                  } catch (caught) {
                    setError(caught.message || "Unable to save media details.");
                  } finally {
                    setSavingDetails(false);
                  }
                }}
                disabled={savingDetails || selected.type !== "unassigned"}
              >
                {savingDetails ? "Saving…" : "Save details"}
              </button>
              <button
                className="button-secondary"
                type="button"
                onClick={() => setSelected(null)}
                disabled={deleting}
              >
                Close
              </button>
              <button
                className="danger-action"
                type="button"
                onClick={deleteAsset}
                disabled={deleting}
              >
                <Trash2 size={15} /> {deleting ? "Deleting…" : "Delete image"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
