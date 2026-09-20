import { useEffect } from "react";
import {
  getBusinessName,
  useStoreSettings,
} from "../context/StoreSettingsContext";

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
  const settings = useStoreSettings();
  const businessName = getBusinessName(settings);
  const seo = settings.seo || {};
  const siteTitle = String(seo.site_title || "").trim();
  useEffect(() => {
    const canonical = resolveCanonical(canonicalUrl);
    const faviconUrl = settings.branding?.favicon_url?.trim();
    let favicon = document.head.querySelector("link[rel='icon']");
    if (faviconUrl) {
      if (!favicon) {
        favicon = document.createElement("link");
        favicon.rel = "icon";
        document.head.appendChild(favicon);
      }
      favicon.href = faviconUrl;
    } else {
      favicon?.remove();
    }
    const titleSuffix = siteTitle || businessName;
    const effectiveDescription =
      description ||
      seo.meta_description ||
      "Thoughtfully formulated skincare for everyday rituals.";
    const effectiveKeywords = keywords || seo.keywords || "";
    const effectiveImage = image || seo.og_image_url || "";
    document.title = title
      ? title.endsWith(`| ${titleSuffix}`)
        ? title
        : `${title} | ${titleSuffix}`
      : titleSuffix;
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
      effectiveDescription,
    );
    upsert("meta[name='keywords']", { name: "keywords" }, effectiveKeywords);
    upsert(
      "meta[property='og:title']",
      { property: "og:title" },
      title || titleSuffix,
    );
    upsert(
      "meta[property='og:description']",
      { property: "og:description" },
      effectiveDescription,
    );
    upsert("meta[property='og:url']", { property: "og:url" }, canonical);
    upsert("meta[property='og:type']", { property: "og:type" }, type);
    upsert(
      "meta[property='og:image']",
      { property: "og:image" },
      effectiveImage,
    );
    upsert(
      "meta[name='twitter:card']",
      { name: "twitter:card" },
      effectiveImage ? "summary_large_image" : "summary",
    );
    upsert(
      "meta[name='twitter:title']",
      { name: "twitter:title" },
      title || titleSuffix,
    );
    upsert(
      "meta[name='twitter:image']",
      { name: "twitter:image" },
      effectiveImage,
    );
    upsert(
      "meta[name='robots']",
      { name: "robots" },
      noindex ? "noindex,nofollow" : seo.robots || "index,follow",
    );
    const verification = String(seo.google_site_verification || "").trim();
    if (verification) {
      upsert(
        "meta[name='google-site-verification']",
        { name: "google-site-verification" },
        verification,
      );
    } else {
      document.head
        .querySelector("meta[name='google-site-verification']")
        ?.remove();
    }
  }, [
    title,
    description,
    image,
    type,
    noindex,
    keywords,
    canonicalUrl,
    businessName,
    siteTitle,
    seo.meta_description,
    seo.keywords,
    seo.og_image_url,
    seo.robots,
    seo.google_site_verification,
    settings.branding?.favicon_url,
  ]);
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
