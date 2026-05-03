import { describe, expect, it } from 'vitest';
import { formatCurrency, splitFullName } from '../lib/utils';

describe('formatCurrency', () => {
  it('formats a whole number', () => {
    expect(formatCurrency(100)).toBe('$100.00');
  });

  it('formats a decimal amount', () => {
    expect(formatCurrency(29.99)).toBe('$29.99');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('adds thousands separator for large amounts', () => {
    expect(formatCurrency(1000)).toBe('$1,000.00');
    expect(formatCurrency(12345.67)).toBe('$12,345.67');
  });

  it('rounds to two decimal places', () => {
    expect(formatCurrency(9.999)).toBe('$10.00');
    expect(formatCurrency(1.005)).toBe('$1.01');
  });

  it('formats negative values', () => {
    expect(formatCurrency(-5)).toBe('-$5.00');
  });
});

describe('splitFullName', () => {
  it('splits first and last name', () => {
    expect(splitFullName('John Doe')).toEqual({ firstName: 'John', lastName: 'Doe' });
  });

  it('handles single name with no last name', () => {
    expect(splitFullName('John')).toEqual({ firstName: 'John', lastName: '' });
  });

  it('joins multiple last name parts', () => {
    expect(splitFullName('John Michael Doe')).toEqual({ firstName: 'John', lastName: 'Michael Doe' });
  });

  it('returns empty strings for empty input', () => {
    expect(splitFullName('')).toEqual({ firstName: '', lastName: '' });
  });

  it('returns empty strings for whitespace-only input', () => {
    expect(splitFullName('   ')).toEqual({ firstName: '', lastName: '' });
  });

  it('trims and normalises internal whitespace', () => {
    expect(splitFullName('  John   Doe  ')).toEqual({ firstName: 'John', lastName: 'Doe' });
  });
});
