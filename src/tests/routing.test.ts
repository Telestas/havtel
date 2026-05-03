import { describe, expect, it } from 'vitest';
import { buildPathFromRoute, getRouteSnapshotFromPath, normalizePath } from '../lib/routing';
import type { RouteSnapshot } from '../lib/routing';

const snap = (overrides: Partial<RouteSnapshot> = {}): RouteSnapshot => ({
  view: 'home',
  productSlug: null,
  trackedOrderId: null,
  ...overrides,
});

describe('normalizePath', () => {
  it('returns / for empty string', () => {
    expect(normalizePath('')).toBe('/');
  });

  it('returns / for root path', () => {
    expect(normalizePath('/')).toBe('/');
  });

  it('passes through a clean path', () => {
    expect(normalizePath('/store')).toBe('/store');
  });

  it('strips trailing slash', () => {
    expect(normalizePath('/store/')).toBe('/store');
  });

  it('strips multiple trailing slashes', () => {
    expect(normalizePath('/product/widget//')).toBe('/product/widget');
  });
});

describe('getRouteSnapshotFromPath', () => {
  it('resolves / to home', () => {
    expect(getRouteSnapshotFromPath('/')).toEqual(snap({ view: 'home' }));
  });

  it('resolves /store to shop', () => {
    expect(getRouteSnapshotFromPath('/store')).toEqual(snap({ view: 'shop' }));
  });

  it('resolves /cart', () => {
    expect(getRouteSnapshotFromPath('/cart')).toEqual(snap({ view: 'cart' }));
  });

  it('resolves /login and /signup', () => {
    expect(getRouteSnapshotFromPath('/login')).toEqual(snap({ view: 'login' }));
    expect(getRouteSnapshotFromPath('/signup')).toEqual(snap({ view: 'signup' }));
  });

  it('resolves /checkout/review as payment view', () => {
    expect(getRouteSnapshotFromPath('/checkout/review').view).toBe('payment');
    expect(getRouteSnapshotFromPath('/checkout/payment').view).toBe('payment');
  });

  it('resolves product path and extracts slug', () => {
    expect(getRouteSnapshotFromPath('/product/widget-x')).toEqual(
      snap({ view: 'product', productSlug: 'widget-x' }),
    );
  });

  it('URL-decodes the product slug', () => {
    expect(getRouteSnapshotFromPath('/product/hello%20world').productSlug).toBe('hello world');
  });

  it('resolves tracking path and extracts order id', () => {
    expect(getRouteSnapshotFromPath('/tracking/order-abc')).toEqual(
      snap({ view: 'tracking', trackedOrderId: 'order-abc' }),
    );
  });

  it('resolves unknown path to notfound', () => {
    expect(getRouteSnapshotFromPath('/this-does-not-exist').view).toBe('notfound');
  });

  it('ignores trailing slash on known routes', () => {
    expect(getRouteSnapshotFromPath('/store/').view).toBe('shop');
  });
});

describe('buildPathFromRoute', () => {
  it('builds / for home', () => {
    expect(buildPathFromRoute(snap({ view: 'home' }))).toBe('/');
  });

  it('builds /store for shop', () => {
    expect(buildPathFromRoute(snap({ view: 'shop' }))).toBe('/store');
  });

  it('builds /cart', () => {
    expect(buildPathFromRoute(snap({ view: 'cart' }))).toBe('/cart');
  });

  it('builds product path with slug', () => {
    expect(buildPathFromRoute(snap({ view: 'product', productSlug: 'widget-x' }))).toBe(
      '/product/widget-x',
    );
  });

  it('falls back to /store when product slug is null', () => {
    expect(buildPathFromRoute(snap({ view: 'product', productSlug: null }))).toBe('/store');
  });

  it('builds tracking path with order id', () => {
    expect(buildPathFromRoute(snap({ view: 'tracking', trackedOrderId: 'abc-123' }))).toBe(
      '/tracking/abc-123',
    );
  });

  it('builds /tracking with no id', () => {
    expect(buildPathFromRoute(snap({ view: 'tracking', trackedOrderId: null }))).toBe('/tracking');
  });

  it('round-trips: buildPath(getSnapshot(path)) restores the path', () => {
    const paths = ['/store', '/cart', '/login', '/signup', '/checkout/shipping', '/checkout/confirmed'];
    for (const path of paths) {
      expect(buildPathFromRoute(getRouteSnapshotFromPath(path))).toBe(path);
    }
  });
});
