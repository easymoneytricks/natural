import React, { useEffect, useState } from "react";
import { Image, LoaderCircle, Search } from "lucide-react";
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
        <div className="media-library-count">
          <b>{assets.length}</b>
          <span>visible assets</span>
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
              <div className="media-library-preview">
                <img
                  src={assetUrl(asset.path)}
                  alt={asset.altText || asset.name}
                />
              </div>
              <div className="media-library-meta">
                <div>
                  <span className={`media-type-pill ${asset.type}`}>
                    {asset.type}
                  </span>
                  {asset.primary && (
                    <span className="media-primary-pill">Primary</span>
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
    </div>
  );
}
