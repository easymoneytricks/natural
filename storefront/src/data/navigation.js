export const imageUrls = {
  barrier:
    "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80",
  skin: "https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=900&q=80",
  concerns:
    "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=900&q=80",
  serum:
    "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=300&q=80",
  cream:
    "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=300&q=80",
};
export const menus = {
  Shop: {
    columns: [
      {
        title: "Shop by category",
        links: [
          "Cleansers",
          "Toners & Mists",
          "Serums",
          "Moisturizers",
          "Sunscreens",
          "Masks & Treatments",
          "Eye Care",
          "Lip Care",
        ],
      },
      {
        title: "Shop edits",
        links: [
          "New Arrivals",
          "Best Sellers",
          "Daily Essentials",
          "Travel Essentials",
          "Gift Sets",
          "Shop All",
        ],
      },
    ],
    feature: {
      image: imageUrls.barrier,
      title: "The Barrier Edit",
      text: "Comforting hydration for stressed, dry skin.",
      cta: "Explore collection",
    },
  },
  Skin: {
    columns: [
      {
        title: "Shop by skin type",
        links: [
          "Normal Skin",
          "Dry Skin",
          "Oily Skin",
          "Combination Skin",
          "Sensitive Skin",
          "Acne-Prone Skin",
        ],
      },
      {
        title: "Find your routine",
        links: [
          "Morning Essentials",
          "Night Routine",
          "Hydration Routine",
          "Barrier Repair",
          "Beginner Routine",
        ],
      },
    ],
    feature: {
      image: imageUrls.skin,
      title: "Not sure about your skin type?",
      text: "Find products designed around your skin's needs.",
      cta: "Explore skin guide",
    },
  },
  Concerns: {
    columns: [
      {
        title: "Shop by concern",
        links: [
          "Acne & Breakouts",
          "Dark Spots",
          "Pigmentation",
          "Dryness",
          "Dullness",
          "Fine Lines",
          "Uneven Texture",
          "Redness",
          "Oil Control",
          "Dehydration",
          "Sun Protection",
          "Damaged Skin Barrier",
        ],
      },
      {
        title: "Popular solutions",
        links: [
          "Brightening",
          "Deep Hydration",
          "Barrier Support",
          "Clarifying Care",
          "Age Support",
        ],
      },
    ],
    feature: {
      image: imageUrls.concerns,
      title: "Care with intention",
      text: "Thoughtful formulas for every skin concern.",
      cta: "Discover solutions",
    },
  },
  Collections: {
    columns: [
      {
        title: "Curated collections",
        links: [
          "Glow Essentials",
          "Clear Skin Edit",
          "Barrier Repair",
          "Hydration Heroes",
          "Sun Defence",
          "Night Renewal",
        ],
      },
    ],
    feature: {
      image: imageUrls.barrier,
      title: "Rituals worth keeping",
      text: "Curated for the moments your skin needs most.",
      cta: "View all collections",
    },
  },
};

const menuText = (menu) =>
  menu.columns
    .map((column) => `${column.title} :: ${column.links.join(", ")}`)
    .concat(
      `feature|${menu.feature.title}|${menu.feature.text}|${menu.feature.cta}|${menu.feature.image}`,
    )
    .join("\n");

export const megaMenuDefaults = Object.fromEntries(
  Object.entries(menus).map(([name, menu]) => [
    name.toLowerCase(),
    menuText(menu),
  ]),
);

export function parseMegaMenu(value, fallback) {
  if (!value || typeof value !== "string") return fallback;
  const columns = [];
  let feature = fallback.feature;
  value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      if (line.toLowerCase().startsWith("feature|")) {
        const [, title, text, cta, image] = line.split("|");
        feature = {
          title: title?.trim() || fallback.feature.title,
          text: text?.trim() || fallback.feature.text,
          cta: cta?.trim() || fallback.feature.cta,
          image: image?.trim() || fallback.feature.image,
        };
        return;
      }
      const separator = line.indexOf("::");
      if (separator < 0) return;
      const title = line.slice(0, separator).trim();
      const links = line
        .slice(separator + 2)
        .split(",")
        .map((link) => link.trim())
        .filter(Boolean);
      if (title && links.length) columns.push({ title, links });
    });
  return {
    columns: columns.length ? columns : fallback.columns,
    feature,
  };
}
