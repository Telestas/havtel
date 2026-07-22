export type View =
  | 'home' | 'shop' | 'support' | 'account' | 'orders'
  | 'cart' | 'shipping' | 'payment' | 'confirmed'
  | 'tracking' | 'product' | 'notfound' | 'login' | 'signup' | 'forgot' | 'reset'
  | 'preorder' | 'privacy' | 'terms';

export type RouteSnapshot = {
  view: View;
  productSlug: string | null;
  trackedOrderId: string | null;
};

export const normalizePath = (pathname: string): string => {
  if (!pathname || pathname === '/') return '/';
  const trimmed = pathname.replace(/\/+$/, '');
  return trimmed || '/';
};

export const getRouteSnapshotFromPath = (pathname: string): RouteSnapshot => {
  const path = normalizePath(pathname);

  const productMatch = path.match(/^\/product\/([^/]+)$/);
  if (productMatch) {
    return { view: 'product', productSlug: decodeURIComponent(productMatch[1]), trackedOrderId: null };
  }

  const trackingMatch = path.match(/^\/tracking\/([^/]+)$/);
  if (trackingMatch) {
    return { view: 'tracking', productSlug: null, trackedOrderId: decodeURIComponent(trackingMatch[1]) };
  }

  const confirmedMatch = path.match(/^\/checkout\/confirmed\/([^/]+)$/);
  if (confirmedMatch) {
    return { view: 'confirmed', productSlug: null, trackedOrderId: decodeURIComponent(confirmedMatch[1]) };
  }

  switch (path) {
    case '/':                    return { view: 'home',      productSlug: null, trackedOrderId: null };
    case '/store':               return { view: 'shop',      productSlug: null, trackedOrderId: null };
    case '/support':             return { view: 'support',   productSlug: null, trackedOrderId: null };
    case '/account':             return { view: 'account',   productSlug: null, trackedOrderId: null };
    case '/orders':              return { view: 'orders',    productSlug: null, trackedOrderId: null };
    case '/cart':                return { view: 'cart',      productSlug: null, trackedOrderId: null };
    case '/preorder':            return { view: 'preorder',  productSlug: null, trackedOrderId: null };
    case '/checkout/shipping':   return { view: 'shipping',  productSlug: null, trackedOrderId: null };
    case '/checkout/payment':
    case '/checkout/review':     return { view: 'payment',   productSlug: null, trackedOrderId: null };
    case '/checkout/confirmed':  return { view: 'confirmed', productSlug: null, trackedOrderId: null };
    case '/tracking':            return { view: 'tracking',  productSlug: null, trackedOrderId: null };
    case '/login':               return { view: 'login',     productSlug: null, trackedOrderId: null };
    case '/signup':              return { view: 'signup',    productSlug: null, trackedOrderId: null };
    case '/forgot-password':     return { view: 'forgot',    productSlug: null, trackedOrderId: null };
    case '/reset-password':      return { view: 'reset',     productSlug: null, trackedOrderId: null };
    case '/privacy-policy':      return { view: 'privacy',   productSlug: null, trackedOrderId: null };
    case '/terms-of-use':        return { view: 'terms',     productSlug: null, trackedOrderId: null };
    case '/404':                 return { view: 'notfound',  productSlug: null, trackedOrderId: null };
    default:                     return { view: 'notfound',  productSlug: null, trackedOrderId: null };
  }
};

export const buildPathFromRoute = ({ view, productSlug, trackedOrderId }: RouteSnapshot): string => {
  switch (view) {
    case 'home':      return '/';
    case 'shop':      return '/store';
    case 'support':   return '/support';
    case 'account':   return '/account';
    case 'orders':    return '/orders';
    case 'cart':      return '/cart';
    case 'preorder':  return '/preorder';
    case 'shipping':  return '/checkout/shipping';
    case 'payment':   return '/checkout/payment';
    case 'confirmed': return trackedOrderId ? `/checkout/confirmed/${encodeURIComponent(trackedOrderId)}` : '/checkout/confirmed';
    case 'login':     return '/login';
    case 'signup':    return '/signup';
    case 'forgot':    return '/forgot-password';
    case 'reset':     return '/reset-password';
    case 'privacy':   return '/privacy-policy';
    case 'terms':     return '/terms-of-use';
    case 'notfound':  return '/404';
    case 'tracking':  return trackedOrderId ? `/tracking/${encodeURIComponent(trackedOrderId)}` : '/tracking';
    case 'product':   return productSlug ? `/product/${encodeURIComponent(productSlug)}` : '/store';
    default:          return '/';
  }
};
