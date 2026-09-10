import heroImage from "../assets/natural-beauty-hero.png";

export const homeImages = {
  hero: heroImage,
  acne: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=900&q=80",
  spots:
    "https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=900&q=80",
  dryness:
    "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80",
  dullness:
    "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=900&q=80",
  lines:
    "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=80",
  barrier:
    "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=80",
  gel: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=900&q=80",
};

export const concernTiles = [
  {
    title: "Acne & Breakouts",
    description: "Clarify without stripping",
    image: homeImages.acne,
  },
  {
    title: "Dark Spots",
    description: "Reveal more even-looking skin",
    image: homeImages.spots,
  },
  {
    title: "Dryness",
    description: "Replenish lasting comfort",
    image: homeImages.dryness,
  },
  {
    title: "Dullness",
    description: "Bring radiance back",
    image: homeImages.dullness,
  },
  {
    title: "Fine Lines",
    description: "Support smoother-looking skin",
    image: homeImages.lines,
  },
  {
    title: "Barrier Support",
    description: "Comfort stressed skin",
    image: homeImages.barrier,
  },
];

export const trustItems = [
  {
    title: "Thoughtful formulas",
    text: "Made for everyday skin rituals",
    icon: "sparkle",
  },
  {
    title: "Skin-first care",
    text: "Solutions organized around your needs",
    icon: "heart",
  },
  {
    title: "Secure checkout",
    text: "Protected and straightforward",
    icon: "shield",
  },
  {
    title: "Complimentary shipping",
    text: "On orders above ₹999",
    icon: "package",
  },
];

export const skinTypes = [
  {
    name: "Normal",
    description: "Maintain everyday balance",
    image: homeImages.hero,
  },
  {
    name: "Dry",
    description: "Replenish comfort & moisture",
    image: homeImages.dryness,
  },
  {
    name: "Oily",
    description: "Balance without over-drying",
    image: homeImages.gel,
  },
  {
    name: "Combination",
    description: "Care for changing zones",
    image: homeImages.barrier,
  },
  {
    name: "Sensitive",
    description: "Gentle comfort comes first",
    image: homeImages.spots,
  },
  {
    name: "Acne-Prone",
    description: "Clarify with thoughtful care",
    image: homeImages.acne,
  },
];

export const ingredients = [
  { name: "Vitamin C", description: "For brighter-looking, more radiant skin" },
  {
    name: "Niacinamide",
    description: "Supports balance and smoother-looking texture",
  },
  { name: "Hyaluronic Acid", description: "Helps maintain skin hydration" },
  { name: "Ceramides", description: "Supports the skin's moisture barrier" },
  {
    name: "Salicylic Acid",
    description: "Helps clarify congested-looking skin",
  },
  { name: "Retinol", description: "Supports smoother, renewed-looking skin" },
];

export const brandPrinciples = [
  {
    title: "Purposeful formulas",
    text: "Every product starts with a clear role in your routine.",
  },
  {
    title: "Routine-first design",
    text: "Products made to work naturally within everyday skincare.",
  },
  {
    title: "Considered experience",
    text: "Texture, usability and presentation matter as much as the formula story.",
  },
];
