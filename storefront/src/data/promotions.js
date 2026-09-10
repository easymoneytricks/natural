export const shippingRules = { threshold: 999, fee: 79 }

export const demoCoupons = {
  WELCOME10: { type: 'percentage', value: 10, minimum: 799, maximum: 250, label: '10% off' },
  GLOW20: { type: 'percentage', value: 20, minimum: 1999, maximum: 500, label: '20% off' },
  FLAT200: { type: 'fixed', value: 200, minimum: 1499, label: '₹200 off' },
  EXPIRED15: { type: 'percentage', value: 15, minimum: 0, expired: true, label: '15% off' },
}

export const demoGiftCards = {
  'NB-GIFT-500': { balance: 500 },
  'NB-GIFT-1000': { balance: 650 },
  'NB-GIFT-2000': { balance: 2000 },
  'NB-GIFT-USED': { balance: 0 },
  'NB-GIFT-EXPIRED': { balance: 750, expired: true },
}
