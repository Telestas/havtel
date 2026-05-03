import { describe, expect, it } from 'vitest';
import { TAX_RATE, calculateCartTotals } from '../lib/cart';

describe('calculateCartTotals', () => {
  it('calculates totals for a single item', () => {
    const result = calculateCartTotals([{ price: 100, quantity: 1 }]);
    expect(result.subtotal).toBe(100);
    expect(result.tax).toBeCloseTo(8);
    expect(result.total).toBeCloseTo(108);
  });

  it('multiplies price by quantity for each line', () => {
    const result = calculateCartTotals([{ price: 50, quantity: 3 }]);
    expect(result.subtotal).toBe(150);
    expect(result.total).toBeCloseTo(162);
  });

  it('sums multiple items correctly', () => {
    const result = calculateCartTotals([
      { price: 10, quantity: 2 },
      { price: 20, quantity: 1 },
    ]);
    expect(result.subtotal).toBe(40);
    expect(result.tax).toBeCloseTo(40 * TAX_RATE);
    expect(result.total).toBeCloseTo(40 + 40 * TAX_RATE);
  });

  it('returns zeros for an empty cart', () => {
    const result = calculateCartTotals([]);
    expect(result.subtotal).toBe(0);
    expect(result.tax).toBe(0);
    expect(result.total).toBe(0);
  });

  it('accepts a custom tax rate', () => {
    const result = calculateCartTotals([{ price: 100, quantity: 1 }], 0.21);
    expect(result.tax).toBeCloseTo(21);
    expect(result.total).toBeCloseTo(121);
  });

  it('handles fractional prices without floating-point explosion', () => {
    const result = calculateCartTotals([{ price: 29.99, quantity: 2 }]);
    expect(result.subtotal).toBeCloseTo(59.98);
    expect(result.tax).toBeCloseTo(59.98 * TAX_RATE);
  });
});
