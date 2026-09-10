/* DEMO CUSTOMER DATA — replace with API/backend later. */
export const demoOrders = [
  {
    orderNumber: "NB-2026-10421",
    date: "August 18, 2026",
    status: "Delivered",
    payment: "Online Payment",
    paymentStatus: "Paid",
    total: 2348,
    courier: "Blue Dart",
    trackingId: "BD784512963IN",
    expected: "August 22, 2026",
    address:
      "42 Lotus Residency, Indiranagar, Bengaluru, Karnataka 560038, India",
    items: [
      {
        slug: "barrier-restore-moisturizer",
        name: "Barrier Restore Moisturizer",
        variant: "100 ml · Sensitive · Barrier Support",
        sku: "NB-BRM-100-SENSITIVE-BARRIER",
        quantity: 1,
        price: 1649,
      },
      {
        slug: "daily-defence-spf-50",
        name: "Daily Defence SPF 50 PA++++",
        variant: "50 g",
        sku: "NB-DDS-50",
        quantity: 1,
        price: 699,
      },
    ],
  },
  {
    orderNumber: "NB-2026-10482",
    date: "September 8, 2026",
    status: "Shipped",
    payment: "Online Payment",
    paymentStatus: "Paid",
    total: 1548,
    courier: "Delhivery",
    trackingId: "DLV926481735",
    expected: "September 12, 2026",
    address:
      "42 Lotus Residency, Indiranagar, Bengaluru, Karnataka 560038, India",
    items: [
      {
        slug: "vitamin-c-radiance-serum",
        name: "Vitamin C Radiance Serum",
        variant: "30 ml",
        sku: "NB-VCR-30",
        quantity: 1,
        price: 899,
      },
      {
        slug: "gentle-barrier-cleanser",
        name: "Gentle Barrier Cleanser",
        variant: "200 ml",
        sku: "NB-GBC-200",
        quantity: 1,
        price: 649,
      },
    ],
  },
  {
    orderNumber: "NB-2026-10495",
    date: "September 10, 2026",
    status: "Processing",
    payment: "Cash on Delivery",
    paymentStatus: "Pending",
    total: 799,
    address:
      "42 Lotus Residency, Indiranagar, Bengaluru, Karnataka 560038, India",
    items: [
      {
        slug: "niacinamide-balance-serum",
        name: "Niacinamide Balance Serum",
        variant: "50 ml",
        sku: "NB-NBS-50",
        quantity: 1,
        price: 799,
      },
    ],
  },
  {
    orderNumber: "NB-2026-10372",
    date: "July 27, 2026",
    status: "Cancelled",
    payment: "Online Payment",
    paymentStatus: "Refunded",
    total: 849,
    address:
      "42 Lotus Residency, Indiranagar, Bengaluru, Karnataka 560038, India",
    items: [
      {
        slug: "hyaluronic-water-gel",
        name: "Hyaluronic Water Gel",
        variant: "50 ml",
        sku: "NB-HWG-50",
        quantity: 1,
        price: 849,
      },
    ],
  },
];
export const defaultAddresses = [
  {
    id: "home",
    label: "Home",
    firstName: "Aanya",
    lastName: "Mehta",
    mobile: "9876543210",
    address1: "42 Lotus Residency",
    address2: "Indiranagar",
    city: "Bengaluru",
    state: "Karnataka",
    pin: "560038",
    country: "India",
    isDefault: true,
  },
  {
    id: "work",
    label: "Work",
    firstName: "Aanya",
    lastName: "Mehta",
    mobile: "9876543210",
    address1: "88 Demo Business Park",
    address2: "Koramangala",
    city: "Bengaluru",
    state: "Karnataka",
    pin: "560095",
    country: "India",
    isDefault: false,
  },
];
export const demoRewards = {
  available: 420,
  lifetime: 760,
  redeemed: 340,
  history: [
    ["+165", "Order NB-2026-10421", "Earned"],
    ["+255", "Order NB-2026-10482", "Earned"],
    ["−340", "Redeemed on order", "Used"],
  ],
};
export const demoGiftCards = [
  { code: "NB-GIFT-500", original: 500, balance: 500, status: "Active" },
  { code: "NB-GIFT-1000", original: 1000, balance: 650, status: "Active" },
];
