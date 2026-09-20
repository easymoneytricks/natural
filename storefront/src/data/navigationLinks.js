const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
const categories = new Set([
  "cleansers",
  "toners & mists",
  "serums",
  "moisturizers",
  "sunscreens",
  "masks & treatments",
  "eye care",
  "lip care",
]);
const concerns = new Set([
  "acne & breakouts",
  "dark spots",
  "pigmentation",
  "dryness",
  "dullness",
  "fine lines",
  "uneven texture",
  "redness",
  "oil control",
  "dehydration",
  "sun protection",
  "barrier support",
  "damaged skin barrier",
]);

export function linkTarget(label) {
  const explicit = label.indexOf("|");
  if (explicit > 0) {
    const target = label.slice(explicit + 1).trim();
    return target.startsWith("/") || /^https?:\/\//i.test(target)
      ? target
      : null;
  }
  if (categories.has(label.toLowerCase()))
    return `/shop?category=${slugify(label)}`;
  if (label.toLowerCase().endsWith(" skin"))
    return `/shop?skin=${slugify(label.replace(/ skin$/i, ""))}`;
  if (concerns.has(label.toLowerCase()))
    return `/shop?concern=${label.toLowerCase() === "damaged skin barrier" ? "barrier-support" : slugify(label)}`;
  if (label === "New Arrivals") return "/shop?sort=newest";
  if (
    label.toLowerCase() === "new arrivals" ||
    label.toLowerCase() === "new in"
  )
    return "/shop?sort=newest";
  if (label === "Best Sellers") return "/shop?sort=best-selling";
  if (
    label.toLowerCase() === "best sellers" ||
    label.toLowerCase() === "trending now"
  )
    return "/shop?sort=best-selling";
  if (
    [
      "everyday essentials",
      "seasonal picks",
      "featured edit",
      "daily essentials",
      "limited edition",
      "gift sets",
      "staff favourites",
      "gift ideas",
      "value sets",
    ].includes(label.toLowerCase())
  )
    return "/shop";
  return null;
}

export function linkLabel(value) {
  const separator = value.indexOf("|");
  return separator > 0 ? value.slice(0, separator).trim() : value;
}
