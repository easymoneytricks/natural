export const detailContent = {
  "barrier-restore-moisturizer": {
    positioning:
      "Comforting daily moisture designed to support dry, dehydrated and stressed-feeling skin.",
    benefits: [
      ["DEEP COMFORT", "Helps skin feel replenished and comfortable."],
      ["BARRIER SUPPORT", "Designed to support the skin's moisture barrier."],
      [
        "EVERYDAY TEXTURE",
        "Comforting moisture without an unnecessarily heavy finish.",
      ],
      ["ROUTINE FRIENDLY", "Easy to layer into morning or evening care."],
    ],
    ingredients: [
      ["Ceramides", "Support the skin's moisture barrier."],
      ["Hyaluronic Acid", "Helps maintain hydration."],
      ["Squalane", "Provides lightweight emollient comfort."],
      [
        "Centella",
        "A botanical ingredient commonly used in calming skincare formulas.",
      ],
    ],
    fullIngredients:
      "Aqua, Glycerin, Squalane, Cetearyl Alcohol, Ceramide NP, Sodium Hyaluronate, Centella Asiatica Leaf Extract, Tocopherol, Phenoxyethanol.",
    variants: [
      ["NB-BRM-50-DRY-DRYNESS", "50 ml", "Dry", "Dryness", 1249, 1049, 12],
      [
        "NB-BRM-50-DRY-DEHYDRATION",
        "50 ml",
        "Dry",
        "Dehydration",
        1249,
        1049,
        5,
      ],
      [
        "NB-BRM-50-OILY-ACNE",
        "50 ml",
        "Oily",
        "Acne & Breakouts",
        1199,
        999,
        0,
      ],
      [
        "NB-BRM-50-COMBINATION-BARRIER",
        "50 ml",
        "Combination",
        "Barrier Support",
        1249,
        1049,
        3,
      ],
      [
        "NB-BRM-50-SENSITIVE-BARRIER",
        "50 ml",
        "Sensitive",
        "Barrier Support",
        1249,
        1049,
        8,
      ],
      ["NB-BRM-100-DRY-DRYNESS", "100 ml", "Dry", "Dryness", 1899, 1599, 7],
      [
        "NB-BRM-100-DRY-DEHYDRATION",
        "100 ml",
        "Dry",
        "Dehydration",
        1899,
        1599,
        2,
      ],
      [
        "NB-BRM-100-COMBINATION-DEHYDRATION",
        "100 ml",
        "Combination",
        "Dehydration",
        1849,
        1549,
        9,
      ],
      [
        "NB-BRM-100-SENSITIVE-BARRIER",
        "100 ml",
        "Sensitive",
        "Barrier Support",
        1949,
        1649,
        4,
      ],
      [
        "NB-BRM-100-OILY-ACNE",
        "100 ml",
        "Oily",
        "Acne & Breakouts",
        1849,
        1549,
        0,
      ],
    ],
  },
};

export function getDetailContent(product) {
  return (
    detailContent[product.slug] || {
      positioning: `${product.name} is a considered step for a simple, comfortable skincare ritual.`,
      benefits: [
        ["THOUGHTFUL FORMULA", "Made for an uncomplicated daily ritual."],
        ["EVERYDAY COMFORT", "A lightweight texture that layers easily."],
        ["RITUAL READY", "Designed to fit naturally into your routine."],
        ["CONSIDERED CARE", "Simple care for skin that feels like itself."],
      ],
      ingredients: [
        [
          "Botanical extracts",
          "Selected for a comfortable skincare experience.",
        ],
        ["Humectants", "Help the formula feel fresh and hydrating."],
        ["Emollients", "Leave skin feeling soft and conditioned."],
      ],
      fullIngredients:
        "Aqua, Glycerin, Botanical Extracts, Emollients, Tocopherol, Phenoxyethanol.",
    }
  );
}
