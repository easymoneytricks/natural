import { pool } from "../src/config/database.js";

const pages = [
  [
    "privacy",
    "Privacy policy",
    "Your privacy",
    "How Natural Beauty collects, uses and protects information when you browse, create an account or shop with us.",
    [
      [
        "Information we collect",
        "We collect your name, email, phone, delivery details, account activity, order history and messages you send to our care team. We also process limited device and security information needed to operate the website and prevent abuse.",
      ],
      [
        "How we use information",
        "We use information to authenticate accounts, calculate and fulfil orders, provide delivery and support updates, improve the service, prevent fraud and meet tax and legal obligations. Marketing is sent only where you have opted in.",
      ],
      [
        "Sharing and security",
        "We share only the information required with payment, delivery, email, hosting and storage providers. Access controls, secure transport, hashed passwords and audit records protect the data we hold.",
      ],
      [
        "Cookies and consent",
        "We use strictly necessary cookies and browser storage for sign-in, cart continuity, security and preferences. Optional analytics or marketing cookies must remain off unless you give a separate, informed consent. You can withdraw optional consent through the cookie controls or your browser settings.",
      ],
      [
        "Retention and your choices",
        "We retain account and support data while your account is active and retain order, tax and payment records for the period required by applicable law, accounting and fraud-prevention needs. After the applicable period, we delete or anonymise it. You can update your profile, export your account or request deletion from Account settings, subject to records we must retain.",
      ],
      [
        "Contact",
        "For privacy questions or a data request, email hello@naturalbeauty.example. We will verify the request before disclosing or changing account information.",
      ],
    ],
    "Privacy Policy | Natural Beauty",
    "How Natural Beauty collects and protects customer information.",
  ],
  [
    "terms",
    "Terms & conditions",
    "Store terms",
    "The terms that govern use of the Natural Beauty website, products, orders and services.",
    [
      [
        "Using our store",
        "Provide accurate information, keep account credentials confidential and use this website only for lawful purposes. We may suspend access where needed to protect customers or the service.",
      ],
      [
        "Products and information",
        "We make reasonable efforts to keep product descriptions, ingredients, images, prices and availability accurate. Cosmetic results vary and product information is not medical advice.",
      ],
      [
        "Orders and payment",
        "An order is accepted only after availability, pricing and payment or COD eligibility are confirmed. Payment processing is handled by the selected provider under its terms.",
      ],
      [
        "Payment security boundary",
        "Natural Beauty does not ask for or store full card numbers, CVV, UPI PINs or banking passwords. Online payment details are entered into the selected PCI-compliant payment provider's hosted or tokenised flow. Never send payment credentials or OTPs to our support team.",
      ],
      [
        "Delivery, returns and refunds",
        "Our Shipping, Returns, Refund and Cancellation policies form part of these terms. Nothing here limits rights that cannot legally be excluded.",
      ],
      [
        "Changes and contact",
        "We may update these terms when the service changes. Questions can be sent to hello@naturalbeauty.example.",
      ],
    ],
    "Terms & Conditions | Natural Beauty",
    "Terms for using the Natural Beauty store and services.",
  ],
  [
    "shipping",
    "Shipping policy",
    "Delivery",
    "Clear delivery information from our studio to your door.",
    [
      [
        "Delivery areas and estimates",
        "We deliver to serviceable addresses in India. Checkout shows the estimated delivery window; weather, holidays, carrier capacity and PIN-code serviceability can affect it.",
      ],
      [
        "Shipping charges",
        "Any complimentary-shipping threshold and applicable charge are shown before you place the order. Taxes and shipping are calculated at checkout.",
      ],
      [
        "Tracking and delivery",
        "Courier and tracking details are emailed after dispatch where available. Please inspect the parcel for visible damage when it arrives.",
      ],
      [
        "Delayed or damaged parcels",
        "Email hello@naturalbeauty.example with your order number, photographs and packaging details if a parcel is delayed, damaged or incomplete.",
      ],
      [
        "Address changes",
        "Contact us immediately for an address correction. We can try to update it before dispatch but cannot guarantee changes after fulfilment begins.",
      ],
    ],
    "Shipping Policy | Natural Beauty",
    "Delivery areas, charges, tracking and damaged-parcel guidance.",
  ],
  [
    "returns",
    "Returns & exchanges",
    "Help centre",
    "A simple process for eligible returns, damaged deliveries and order issues.",
    [
      [
        "Eligibility",
        "Contact us within 7 days of delivery for an unopened, unused product in original packaging. Hygiene-sensitive skincare that has been opened or used cannot be returned.",
      ],
      [
        "How to request",
        "Email hello@naturalbeauty.example with order number, product, reason and clear photographs where relevant. Wait for eligibility instructions before sending anything.",
      ],
      [
        "Inspection and exchange",
        "Returned products are inspected for condition and authenticity. An exchange depends on availability and any price difference is confirmed first.",
      ],
      [
        "Damaged or incorrect items",
        "Notify us promptly with parcel and product photographs. After verification we will prioritise a replacement or refund.",
      ],
      [
        "Non-returnable cases",
        "Opened or used products, missing original packaging and requests outside the stated window may not be eligible, subject to applicable law.",
      ],
    ],
    "Returns & Exchanges | Natural Beauty",
    "Eligibility and process for skincare returns and exchanges.",
  ],
  [
    "refund-policy",
    "Refund policy",
    "Help centre",
    "How approved refunds are calculated, processed and communicated.",
    [
      [
        "When a refund is approved",
        "Refunds may follow an eligible cancellation, returned-product inspection, damaged-delivery investigation or payment reversal. The approved amount follows the order record.",
      ],
      [
        "Payment method and timing",
        "Online refunds are sent to the original payment method through the provider. COD refunds use the verified method requested by our care team. Banks may take additional business days.",
      ],
      [
        "Partial refunds",
        "A partial refund may apply when only part of an order is returned or unavailable. Coupon, gift-card and shipping adjustments follow the order and promotion records.",
      ],
      [
        "Status updates",
        "We email you when a refund is approved or initiated. Contact us with your order number if the credit misses the provider timeline.",
      ],
      [
        "Verification",
        "We may pause a refund while verifying duplicate claims, payment risk, returned condition or an obvious pricing error.",
      ],
    ],
    "Refund Policy | Natural Beauty",
    "Refund eligibility, timing, payment method and partial-refund rules.",
  ],
  [
    "cancellation-policy",
    "Cancellation policy",
    "Help centre",
    "What to expect when you need to change or cancel an order.",
    [
      [
        "Before dispatch",
        "Email hello@naturalbeauty.example with your order number as soon as possible. Cancellation is confirmed only when our team replies or the order status changes.",
      ],
      [
        "After dispatch",
        "Once an order is packed or dispatched, cancellation may no longer be possible. An eligible return can be requested after delivery.",
      ],
      [
        "Payment and COD",
        "Approved cancellations release payment holds or inventory reservations through the applicable workflow. COD orders have no payment capture.",
      ],
      [
        "How to contact us",
        "Include the order number, checkout email and reason. Never share a password, card number or OTP in support email.",
      ],
      [
        "Policy updates",
        "This policy is reviewed as delivery, payment and consumer requirements evolve. The current published version applies to new orders.",
      ],
    ],
    "Cancellation Policy | Natural Beauty",
    "How to request cancellation before dispatch and what happens afterward.",
  ],
];

for (const [
  slug,
  title,
  eyebrow,
  intro,
  content,
  seoTitle,
  seoDescription,
] of pages) {
  await pool.execute(
    `INSERT INTO content_pages (slug,title,eyebrow,intro,content_json,seo_title,seo_description,status,published_at)
     VALUES (?,?,?,?,?,?,?,'published',NOW())
     ON DUPLICATE KEY UPDATE title=VALUES(title),eyebrow=VALUES(eyebrow),intro=VALUES(intro),content_json=VALUES(content_json),seo_title=VALUES(seo_title),seo_description=VALUES(seo_description),status='published',published_at=COALESCE(published_at,NOW())`,
    [
      slug,
      title,
      eyebrow,
      intro,
      JSON.stringify(content),
      seoTitle,
      seoDescription,
    ],
  );
}
console.log(`Seeded ${pages.length} CMS legal pages.`);
await pool.end();
