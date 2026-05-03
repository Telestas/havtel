export interface CartLineItem {
  price: number;
  quantity: number;
}

export const TAX_RATE = 0.08;

export function calculateCartTotals(
  items: CartLineItem[],
  taxRate = TAX_RATE,
): { subtotal: number; tax: number; total: number } {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax;
  return { subtotal, tax, total };
}
