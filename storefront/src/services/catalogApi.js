import { apiRequest, mediaUrl } from "../lib/api";
import { products as demoProducts } from "../data/products";

const normalizeImage = (image, slug) => {
  const fallback =
    demoProducts.find((product) => product.slug === slug)?.image || null;
  if (!image?.src) return fallback;
  return image.src.startsWith("/uploads/") ? fallback : mediaUrl(image.src);
};
const normalizeListItem = (item) => ({
  ...item,
  category: item.category?.name || "",
  categorySlug: item.category?.slug || "",
  brand: item.brand?.name || "",
  brandSlug: item.brand?.slug || "",
  image: normalizeImage(item.image, item.slug) || "",
  hoverImage: normalizeImage(item.image, item.slug) || "",
  price: item.price?.min ?? 0,
  maxPrice: item.price?.max ?? item.price?.min ?? 0,
  mrp: item.price?.mrpMin ?? item.price?.min ?? 0,
  rating: item.rating ?? 0,
  reviews: item.reviewCount ?? 0,
  badge: item.badges?.[0] || "",
  sizes: [],
  skinTypes: [],
  concerns: [],
  available: item.available,
});

export async function getProducts(params = {}, options) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "")
      search.append(key, value);
  });
  const payload = await apiRequest(
    `/products${search.toString() ? `?${search}` : ""}`,
    options,
  );
  return { ...payload, data: payload.data.map(normalizeListItem) };
}

export async function getProductBySlug(slug, options) {
  const payload = await apiRequest(
    `/products/${encodeURIComponent(slug)}`,
    options,
  );
  const product = payload.data;
  return {
    ...product,
    image: normalizeImage(product.gallery?.[0], product.slug),
    hoverImage: normalizeImage(
      product.gallery?.[1] || product.gallery?.[0],
      product.slug,
    ),
    category: product.categories?.[0]?.name || "",
    categorySlug: product.categories?.[0]?.slug || "",
    price: product.price?.min ?? 0,
    mrp: product.price?.mrpMin ?? product.price?.min ?? 0,
    rating: product.rating ?? 0,
    reviews: product.reviewCount ?? 0,
    badge: product.bestSeller ? "Bestseller" : "",
    sizes:
      product.attributes
        ?.find((item) => item.slug === "pack-size")
        ?.values?.map((value) => value.value) || [],
    skinTypes:
      product.attributes
        ?.find((item) => item.slug === "skin-type")
        ?.values?.map((value) => value.value) || [],
    concerns:
      product.attributes
        ?.find((item) => item.slug === "concern")
        ?.values?.map((value) => value.value) || [],
    gallery:
      product.gallery
        ?.map((image) => normalizeImage(image, product.slug))
        .filter(Boolean) || [],
  };
}

export const getCategories = (options) => apiRequest("/categories", options);
export const getBrands = (options) => apiRequest("/brands", options);
export const getCatalogFilters = (options) =>
  apiRequest("/catalog/filters", options);
