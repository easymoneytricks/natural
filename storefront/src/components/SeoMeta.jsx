import { useEffect } from "react";

const siteUrl = (
  import.meta.env.VITE_SITE_URL || window.location.origin
).replace(/\/$/, "");
const upsert = (selector, attributes, content) => {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([key, value]) =>
    element.setAttribute(key, value),
  );
  element.setAttribute("content", content || "");
};

const resolveCanonical = (value) => {
  if (!value) return `${siteUrl}${window.location.pathname}`;
  try {
    const url = new URL(value, siteUrl);
    const allowedOrigin = new URL(siteUrl).origin;
    return url.origin === allowedOrigin
      ? url.href.replace(/\/$/, "")
      : `${siteUrl}${window.location.pathname}`;
  } catch {
    return `${siteUrl}${window.location.pathname}`;
  }
};

export function SeoMeta({
  title,
  description,
  image,
  type = "website",
  noindex = false,
  keywords = "",
  canonicalUrl = "",
}) {
  useEffect(() => {
    const canonical = resolveCanonical(canonicalUrl);
    document.title = title ? `${title} | Natural Beauty` : "Natural Beauty";
    let link = document.head.querySelector("link[rel='canonical']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = canonical;
    upsert(
      "meta[name='description']",
      { name: "description" },
      description || "Thoughtfully formulated skincare for everyday rituals.",
    );
    upsert("meta[name='keywords']", { name: "keywords" }, keywords || "");
    upsert(
      "meta[property='og:title']",
      { property: "og:title" },
      title || "Natural Beauty",
    );
    upsert(
      "meta[property='og:description']",
      { property: "og:description" },
      description || "Thoughtfully formulated skincare for everyday rituals.",
    );
    upsert("meta[property='og:url']", { property: "og:url" }, canonical);
    upsert("meta[property='og:type']", { property: "og:type" }, type);
    upsert("meta[property='og:image']", { property: "og:image" }, image || "");
    upsert(
      "meta[name='twitter:card']",
      { name: "twitter:card" },
      image ? "summary_large_image" : "summary",
    );
    upsert(
      "meta[name='twitter:title']",
      { name: "twitter:title" },
      title || "Natural Beauty",
    );
    upsert(
      "meta[name='twitter:image']",
      { name: "twitter:image" },
      image || "",
    );
    upsert(
      "meta[name='robots']",
      { name: "robots" },
      noindex ? "noindex,nofollow" : "index,follow",
    );
  }, [title, description, image, type, noindex, keywords, canonicalUrl]);
  return null;
}

export function StructuredData({ data }) {
  useEffect(() => {
    const id = "natural-beauty-structured-data";
    let script = document.getElementById(id);
    if (!script) {
      script = document.createElement("script");
      script.id = id;
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(data);
    return () => script.remove();
  }, [data]);
  return null;
}
