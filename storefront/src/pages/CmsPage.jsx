import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1"
).replace(/\/$/, "");

export function CmsPage() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [state, setState] = useState("loading");
  useEffect(() => {
    let active = true;
    setState("loading");
    fetch(`${API}/pages/${encodeURIComponent(slug)}`)
      .then((response) => {
        if (!response.ok) throw new Error("Page not found");
        return response.json();
      })
      .then((response) => {
        if (active) {
          setPage(response.data);
          setState("ready");
        }
      })
      .catch(() => {
        if (active) setState("error");
      });
    return () => {
      active = false;
    };
  }, [slug]);
  if (state === "loading")
    return <div className="cms-state">Loading page…</div>;
  if (state === "error")
    return (
      <div className="cms-state">
        <h1>Page not found</h1>
        <p>This page is not available right now.</p>
      </div>
    );
  return (
    <article className="cms-page">
      <div className="cms-page-header">
        {page.eyebrow && <span className="section-kicker">{page.eyebrow}</span>}
        <h1>{page.title}</h1>
        {page.intro && <p>{page.intro}</p>}
      </div>
      <div className="cms-page-content">
        {(page.content || []).map(([heading, body], index) => (
          <section key={`${heading}-${index}`}>
            <h2>{heading}</h2>
            <p>{body}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
