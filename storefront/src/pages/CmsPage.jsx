import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { SeoMeta, StructuredData } from "../components/SeoMeta";

const API = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1"
).replace(/\/$/, "");

export function CmsPage({ slug: routeSlug }) {
  const { slug: paramSlug } = useParams();
  const slug = routeSlug || paramSlug;
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
    <>
      <SeoMeta
        title={page.seoTitle || page.title}
        description={page.seoDescription || page.intro}
        canonicalUrl={`${window.location.origin}/pages/${page.slug}`}
      />
      {slug === "faq" && (
        <StructuredData
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: (page.content || []).map(([question, answer]) => ({
              "@type": "Question",
              name: question,
              acceptedAnswer: { "@type": "Answer", text: answer },
            })),
          }}
        />
      )}
      <article
        className={`cms-page ${slug === "journal" ? "journal-page" : ""}`}
      >
        <div className="cms-page-header">
          {page.eyebrow && (
            <span className="section-kicker">{page.eyebrow}</span>
          )}
          <h1>{page.title}</h1>
          {page.intro && <p>{page.intro}</p>}
        </div>
        <div className="cms-page-layout">
          <aside className="cms-page-nav" aria-label="On this page">
            <span>On this page</span>
            <ol>
              {(page.content || []).map(([heading], index) => (
                <li key={`${heading}-link`}>
                  <a href={`#policy-section-${index}`}>{heading}</a>
                </li>
              ))}
            </ol>
          </aside>
          <div className="cms-page-content">
            {(page.content || []).map(([heading, body], index) => (
              <section
                id={`policy-section-${index}`}
                key={`${heading}-${index}`}
              >
                <span className="cms-section-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h2>{heading}</h2>
                  <p>{body}</p>
                </div>
              </section>
            ))}
          </div>
        </div>
      </article>
    </>
  );
}
