import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePhoneInput, defaultCountries, parseCountry } from 'react-international-phone';
import { isValidPhoneNumber } from 'libphonenumber-js';
import { trackPageView } from './lib/analytics';
import { setPageMeta, usePageMeta } from './hooks/usePageMeta';
import { loadStripe } from '@stripe/stripe-js';
import { CheckoutElementsProvider, PaymentElement, useCheckout } from '@stripe/react-stripe-js/checkout';

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string)
  : null;
import {
  Bookmark,
  ShoppingCart,
  User,
  CircleUserRound,
  Building2,
  Check,
  ArrowRight,
  ChevronRight,
  Globe,
  Share2,
  ShieldCheck,
  Search,
  MapPin,
  Mail,
  Lock,
  BadgePercent,
  Star,
  AtSign,
  Phone,
  Minus,
  Plus,
  Pencil,
  Trash2,
  IdCard,
  Eye,
  X,
  CreditCard,
  Wallet,
  Truck,
  Cpu,
  Monitor,
  Database,
  HardDrive,
  MousePointer2,
  Wifi,
  Server,
  Smartphone,
  Headphones,
  Zap,
  Shield,
  Layers,
  CircuitBoard,
  ChevronLeft,
  Package,
  Download,
  LogOut,
  Send,
  LoaderCircle,
  type LucideIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ApiError,
  type AuthResponse,
  type Category,
  type CheckoutResponse,
  type Order,
  type ProductDetail,
  type ProductVariant,
  type UserAddress,
  addCartItemRequest,
  checkoutRequest,
  createUserAddressRequest,
  deleteUserAddressRequest,
  getCartRequest,
  getOrderRequest,
  getProductRequest,
  getCurrentUserRequest,
  getTaxConfigRequest,
  validateTaxExemptionRequest,
  listCategoriesRequest,
  listOrdersRequest,
  listProductsRequest,
  listUserAddressesRequest,
  loginRequest,
  refreshTokenRequest,
  registerRequest,
  forgotPasswordRequest,
  resetPasswordRequest,
  removeCartItemRequest,
  setDefaultUserAddressRequest,
  updateCartItemRequest,
  updateCurrentUserRequest,
  updateUserAddressRequest,
  fetchMaintenanceStatus,
  listPickupPointsRequest,
  type PickupPointPublic,
  createReservationRequest,
  saveCartItemRequest,
  listReservationsRequest,
  cancelReservationRequest,
  restoreReservationRequest,
  type Reservation,
} from './lib/api';

type View = 'home' | 'shop' | 'support' | 'account' | 'orders' | 'cart' | 'shipping' | 'payment' | 'confirmed' | 'tracking' | 'product' | 'notfound' | 'login' | 'signup' | 'forgot' | 'reset' | 'preorder' | 'privacy' | 'terms';

const PAGE_META: Partial<Record<View, { title: string; description: string }>> = {
  home:     { title: 'Havtel',    description: 'Premium tech hardware — servers, networking gear, and more.' },
  shop:     { title: 'Shop',      description: 'Browse our full catalog of hardware and tech products.' },
  support:  { title: 'Support',   description: 'Get help with your Havtel orders and products.' },
  account:  { title: 'My Account', description: '' },
  orders:   { title: 'My Orders', description: '' },
  cart:     { title: 'Cart',      description: '' },
  shipping: { title: 'Checkout',  description: '' },
  payment:  { title: 'Payment',   description: '' },
  privacy:  { title: 'Privacy Policy', description: 'How Havtel Corp collects, uses, and protects your personal information.' },
  terms:    { title: 'Terms of Use',   description: 'Terms governing the use of www.nitrotelmanufacturing.com.' },
};

function navigateToPath(href: string) {
  if (window.location.pathname === href) return;
  window.history.pushState(null, '', href);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

interface Product {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  series: string;
  price: number;
  priceString: string;
  tag: string | null;
  img: string | null;
  category: string;
  categoryId: string;
  categorySlug: string;
  brand: string;
  variants: ProductVariant[];
  isInStock: boolean;
}

interface CartItem {
  variantId: string;
  productSlug: string;
  productName: string;
  variantName: string;
  quantity: number;
  price: number;
  img: string | null;
  maxStock?: number;
}

type CheckoutShippingAddress = {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

type AuthSession = AuthResponse | null;

const AUTH_STORAGE_KEY = 'havtel.auth.session';
const CART_STORAGE_KEY = 'havtel.cart.items';

const splitFullName = (fullName: string) => {
  const trimmedName = fullName.trim();
  if (!trimmedName) {
    return { firstName: '', lastName: '' };
  }

  const parts = trimmedName.split(/\s+/);
  return {
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' '),
  };
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

function HavtelLogo({ height = 34, light = false }: { height?: number; light?: boolean }) {
  const navy = '#1a3f6f';
  const fontSize = Math.round(height * 0.5);
  const px = Math.round(height * 0.2);
  const borderWidth = Math.max(2, Math.round(height * 0.065));
  const borderRadius = Math.round(height * 0.07);
  return (
    <div
      style={{
        display: 'inline-flex',
        height: `${height}px`,
        border: `${borderWidth}px solid ${light ? 'white' : navy}`,
        borderRadius: `${borderRadius}px`,
        overflow: 'hidden',
        backgroundColor: light ? 'transparent' : 'white',
        userSelect: 'none',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          paddingInline: `${px}px`,
          fontFamily: "'Arial Black', 'Arial Bold', Arial, sans-serif",
          fontSize: `${fontSize}px`,
          fontWeight: 900,
          color: light ? 'white' : navy,
          letterSpacing: '-0.03em',
          lineHeight: 1,
        }}
      >
        HAV
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          paddingInline: `${px}px`,
          fontFamily: "'Arial Black', 'Arial Bold', Arial, sans-serif",
          fontSize: `${fontSize}px`,
          fontWeight: 900,
          color: light ? navy : 'white',
          backgroundColor: light ? 'white' : navy,
          letterSpacing: '-0.03em',
          lineHeight: 1,
        }}
      >
        TEL
      </div>
    </div>
  );
}

function CheckoutHeader({
  activeStep,
  onGoHome,
  onClose,
  onBackToCart,
  onBackToShipping,
  mode = 'checkout',
}: {
  activeStep: 'cart' | 'shipping' | 'payment' | 'tracking';
  onGoHome: () => void;
  onClose: () => void;
  onBackToCart?: () => void;
  onBackToShipping?: () => void;
  mode?: 'checkout' | 'tracking';
}) {
  const checkoutSteps = [
    { id: 'cart', label: 'Cart', onClick: onBackToCart },
    { id: 'shipping', label: 'Shipping', onClick: onBackToShipping },
    { id: 'payment', label: 'Payment', onClick: undefined },
  ] as const;

  return (
    <header className="bg-[#1a3f6f] shadow-[0_8px_22px_rgba(26,63,111,0.18)]">
      <div className="mx-auto flex h-20 max-w-[1600px] items-center justify-between px-8 md:px-12">
        <button type="button" onClick={onGoHome}>
          <HavtelLogo height={32} light />
        </button>
        <nav className="hidden md:flex items-center gap-10 text-sm">
          {mode === 'tracking' ? (
            <span className="border-b-2 border-white pb-1 text-xs font-bold uppercase tracking-[0.12em] text-white">
              Tracking
            </span>
          ) : (
            checkoutSteps.map((step) => {
              const isActive = step.id === activeStep;
              const isClickable = Boolean(step.onClick);

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={step.onClick}
                  disabled={!isClickable}
                  className={`border-b-2 pb-1 text-xs font-bold uppercase tracking-[0.12em] transition-colors ${
                    isActive
                      ? 'border-white text-white'
                      : isClickable
                        ? 'border-transparent text-white/60 hover:text-white'
                        : 'border-transparent text-white/45'
                  }`}
                >
                  {step.label}
                </button>
              );
            })
          )}
        </nav>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Close checkout flow"
        >
          <X size={26} />
        </button>
      </div>
    </header>
  );
}

type RouteSnapshot = {
  view: View;
  productSlug: string | null;
  trackedOrderId: string | null;
};

const normalizePath = (pathname: string) => {
  if (!pathname || pathname === '/') {
    return '/';
  }

  const trimmed = pathname.replace(/\/+$/, '');
  return trimmed || '/';
};

const getRouteSnapshotFromPath = (pathname: string): RouteSnapshot => {
  const path = normalizePath(pathname);
  const productMatch = path.match(/^\/product\/([^/]+)$/);
  if (productMatch) {
    return {
      view: 'product',
      productSlug: decodeURIComponent(productMatch[1]),
      trackedOrderId: null,
    };
  }

  const trackingMatch = path.match(/^\/tracking\/([^/]+)$/);
  if (trackingMatch) {
    return {
      view: 'tracking',
      productSlug: null,
      trackedOrderId: decodeURIComponent(trackingMatch[1]),
    };
  }

  switch (path) {
    case '/':
      return { view: 'home', productSlug: null, trackedOrderId: null };
    case '/store':
      return { view: 'shop', productSlug: null, trackedOrderId: null };
    case '/support':
      return { view: 'support', productSlug: null, trackedOrderId: null };
    case '/account':
      return { view: 'account', productSlug: null, trackedOrderId: null };
    case '/orders':
      return { view: 'orders', productSlug: null, trackedOrderId: null };
    case '/cart':
      return { view: 'cart', productSlug: null, trackedOrderId: null };
    case '/preorder':
      return { view: 'preorder', productSlug: null, trackedOrderId: null };
    case '/checkout/shipping':
      return { view: 'shipping', productSlug: null, trackedOrderId: null };
    case '/checkout/payment':
    case '/checkout/review':
      return { view: 'payment', productSlug: null, trackedOrderId: null };
    case '/checkout/confirmed':
      return { view: 'confirmed', productSlug: null, trackedOrderId: null };
    case '/tracking':
      return { view: 'tracking', productSlug: null, trackedOrderId: null };
    case '/login':
      return { view: 'login', productSlug: null, trackedOrderId: null };
    case '/signup':
      return { view: 'signup', productSlug: null, trackedOrderId: null };
    case '/forgot-password':
      return { view: 'forgot', productSlug: null, trackedOrderId: null };
    case '/404':
      return { view: 'notfound', productSlug: null, trackedOrderId: null };
    default:
      return { view: 'notfound', productSlug: null, trackedOrderId: null };
  }
};

const getCurrentRouteSnapshot = (): RouteSnapshot => {
  if (typeof window === 'undefined') {
    return { view: 'home', productSlug: null, trackedOrderId: null };
  }

  return getRouteSnapshotFromPath(window.location.pathname);
};

const buildPathFromRoute = ({
  view,
  productSlug,
  trackedOrderId,
}: RouteSnapshot): string => {
  switch (view) {
    case 'home':
      return '/';
    case 'shop':
      return '/store';
    case 'support':
      return '/support';
    case 'account':
      return '/account';
    case 'orders':
      return '/orders';
    case 'cart':
      return '/cart';
    case 'preorder':
      return '/preorder';
    case 'shipping':
      return '/checkout/shipping';
    case 'payment':
      return '/checkout/payment';
    case 'confirmed':
      return '/checkout/confirmed';
    case 'tracking':
      return trackedOrderId ? `/tracking/${encodeURIComponent(trackedOrderId)}` : '/tracking';
    case 'product':
      return productSlug ? `/product/${encodeURIComponent(productSlug)}` : '/store';
    case 'login':
      return '/login';
    case 'signup':
      return '/signup';
    case 'forgot':
      return '/forgot-password';
    case 'notfound':
      return '/404';
    default:
      return '/';
  }
};

function mapApiProductToLocal(
  p: import('./lib/api').ProductListItem,
  categoryMap: Map<string, Category>,
): Product {
  const cat = p.category_id ? categoryMap.get(p.category_id) : null;
  const price = p.price_from ? parseFloat(p.price_from) : 0;
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    series: cat?.name ?? '',
    price,
    priceString: price > 0 ? formatCurrency(price) : 'N/A',
    tag: null,
    img: p.primary_image_url,
    category: cat?.name?.toUpperCase() ?? 'OTHER',
    categoryId: p.category_id ?? '',
    categorySlug: cat?.slug ?? '',
    brand: cat?.name ?? '',
    variants: [],
    isInStock: p.is_in_stock,
  };
}

export default function App() {
  const initialRoute = getCurrentRouteSnapshot();
  // Payment and shipping views require transient state (client_secret, shipping form)
  // that is lost on page refresh — redirect to cart instead of showing a blank screen.
  const safeInitialView = (v: View): View =>
    v === 'payment' || v === 'shipping' ? 'cart' : v;
  const [view, setView] = useState<View>(safeInitialView(initialRoute.view));
  const [selectedProductSlug, setSelectedProductSlug] = useState<string | null>(initialRoute.productSlug);
  const [notification, setNotification] = useState<string | null>(null);
  const [authSession, setAuthSession] = useState<AuthSession>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? (JSON.parse(stored) as CartItem[]) : [];
    } catch {
      return [];
    }
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<'priority' | 'express'>('priority');
  const [taxRatePercent, setTaxRatePercent] = useState<number>(7);
  const [taxExemptionInput, setTaxExemptionInput] = useState('');
  const [appliedExemption, setAppliedExemption] = useState<{ code: string; holder: string | null } | null>(null);
  const [exemptionError, setExemptionError] = useState<string | null>(null);
  const [isValidatingExemption, setIsValidatingExemption] = useState(false);
  const [deliveryType, setDeliveryType] = useState<'home_delivery' | 'warehouse_pickup'>('home_delivery');
  const [selectedPickupPointId, setSelectedPickupPointId] = useState<string | null>(null);
  const [checkoutShippingAddress, setCheckoutShippingAddress] = useState<CheckoutShippingAddress | null>(null);
  const [checkoutResponse, setCheckoutResponse] = useState<CheckoutResponse | null>(null);
  const [isInitiatingCheckout, setIsInitiatingCheckout] = useState(false);
  const [latestOrder, setLatestOrder] = useState<Order | null>(null);
  const [stripeReturnOrderId, setStripeReturnOrderId] = useState<string | null>(null);
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [trackedOrderId, setTrackedOrderId] = useState<string | null>(initialRoute.trackedOrderId);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [reservationToast, setReservationToast] = useState<{ expiresAt: string } | null>(null);
  const [postLoginView, setPostLoginView] = useState<View | null>(null);
  const isAuthenticated = authSession !== null;
  const isPopNavigationRef = useRef(false);
  const initialTokenRef = useRef(authSession?.access_token ?? null);
  const isFirstCartSyncDoneRef = useRef(false);

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const isCheckoutView =
    view === 'cart' || view === 'shipping' || view === 'payment' || view === 'confirmed' || view === 'tracking';

  const addToCart = async (productSlug: string, preferredVariantId?: string, quantity = 1) => {
    if (!authSession?.access_token) {
      setPostLoginView(view);
      setAuthError('Please sign in to add items to your cart.');
      setView('login');
      return;
    }

    try {
      const detail = await getProductRequest(productSlug, authSession.access_token);
      const variant =
        (preferredVariantId
          ? detail.variants.find((v) => v.id === preferredVariantId && v.is_active)
          : undefined) ??
        detail.variants.find((v) => v.is_active && (v.inventory?.qty_available ?? 0) > 0) ??
        detail.variants.find((v) => v.is_active) ??
        detail.variants[0];
      if (!variant) {
        setNotification('This product has no active variants yet.');
        setTimeout(() => setNotification(null), 3000);
        return;
      }

      if ((variant.inventory?.qty_available ?? 0) <= 0) {
        setNotification('This product is currently out of stock.');
        setTimeout(() => setNotification(null), 3000);
        return;
      }

      const existingItem = cartItems.find((item) => item.variantId === variant.id);
      if (existingItem) {
        await updateCartItemRequest(authSession.access_token, variant.id, existingItem.quantity + quantity);
      } else {
        await addCartItemRequest(authSession.access_token, {
          variant_id: variant.id,
          quantity,
        });
      }

      const primaryImg =
        detail.images.find((img) => img.is_primary && !img.variant_id)?.url ??
        detail.images[0]?.url ??
        null;

      setCartItems((prev) => {
        const existing = prev.find((item) => item.variantId === variant.id);
        if (existing) {
          return prev.map((item) =>
            item.variantId === variant.id ? { ...item, quantity: item.quantity + quantity } : item,
          );
        }
        return [
          ...prev,
          {
            variantId: variant.id,
            productSlug: detail.slug,
            productName: detail.name,
            variantName: variant.name,
            quantity,
            price: parseFloat(variant.price),
            img: primaryImg,
          },
        ];
      });

      setNotification(`Added ${detail.name} to cart`);
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification(error instanceof ApiError ? error.message : 'Could not add item to cart');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const openProduct = (slug: string) => {
    setSelectedProductSlug(slug);
    setView('product');
  };

  const handleReorder = async (order: Order): Promise<{ added: number; skipped: number }> => {
    if (!authSession?.access_token) {
      setView('login');
      return { added: 0, skipped: 0 };
    }
    const token = authSession.access_token;
    const reorderableItems = order.items.filter((item) => item.variant_id != null);
    let added = 0;
    let skipped = 0;
    for (const item of reorderableItems) {
      try {
        const existing = cartItems.find((ci) => ci.variantId === item.variant_id);
        if (existing) {
          await updateCartItemRequest(token, item.variant_id!, existing.quantity + item.quantity);
        } else {
          await addCartItemRequest(token, { variant_id: item.variant_id!, quantity: item.quantity });
        }
        added++;
      } catch {
        skipped++;
      }
    }
    // Refresh cart from server after bulk add
    try {
      const cart = await getCartRequest(token);
      setCartItems(cart.items.map((si) => ({
        variantId: si.variant_id,
        productSlug: '',
        productName: si.variant.product?.name ?? si.variant.name,
        variantName: si.variant.name,
        quantity: si.quantity,
        price: parseFloat(si.unit_price),
        img: null,
      })));
    } catch { /* keep stale state if refresh fails */ }
    return { added, skipped };
  };

  useEffect(() => {
    // Check on mount and poll every 30 s so maintenance activates without needing a failed request.
    const check = async () => {
      const active = await fetchMaintenanceStatus();
      setIsMaintenance(active);
    };
    void check();
    const interval = setInterval(() => void check(), 30_000);

    // Also react immediately when any API call returns 503.
    const handleMaintenance = () => setIsMaintenance(true);
    window.addEventListener('app:maintenance', handleMaintenance);

    return () => {
      clearInterval(interval);
      window.removeEventListener('app:maintenance', handleMaintenance);
    };
  }, []);

  useEffect(() => {
    // Load the configured sales-tax rate (falls back to the default on failure).
    let cancelled = false;
    void (async () => {
      try {
        const cfg = await getTaxConfigRequest();
        if (!cancelled && typeof cfg.tax_rate === 'number') setTaxRatePercent(cfg.tax_rate);
      } catch {
        // keep default
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const nextRoute = getCurrentRouteSnapshot();
      isPopNavigationRef.current = true;
      setView(nextRoute.view);
      setSelectedProductSlug(nextRoute.productSlug);
      setTrackedOrderId(nextRoute.trackedOrderId);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    const nextPath = buildPathFromRoute({
      view,
      productSlug: selectedProductSlug,
      trackedOrderId,
    });
    const currentPath = normalizePath(window.location.pathname);

    if (isPopNavigationRef.current) {
      isPopNavigationRef.current = false;
      if (currentPath !== nextPath) {
        window.history.replaceState(null, '', nextPath);
      }
      return;
    }

    if (currentPath !== nextPath) {
      window.history.pushState(null, '', nextPath);
    }

    if (view !== 'product') {
      const meta = PAGE_META[view];
      if (meta) setPageMeta(meta.title, meta.description);
    }
    trackPageView(nextPath, document.title);
  }, [view, selectedProductSlug, trackedOrderId]);

  // Load products and categories from API (all pages)
  useEffect(() => {
    const PAGE_LIMIT = 100;
    let cancelled = false;
    setIsLoadingProducts(true);

    const fetchAllProducts = async () => {
      const [cats, firstPage] = await Promise.all([
        listCategoriesRequest(),
        listProductsRequest({ limit: PAGE_LIMIT, page: 1 }, authSession?.access_token),
      ]);
      if (cancelled) return;

      const flat = new Map<string, Category>();
      const flattenCats = (list: Category[]) => {
        for (const c of list) {
          flat.set(c.id, c);
          if (c.children.length) flattenCats(c.children);
        }
      };
      flattenCats(cats);
      setCategories(cats);

      let allItems = [...firstPage.items];

      if (firstPage.pages > 1) {
        const remaining = await Promise.all(
          Array.from({ length: firstPage.pages - 1 }, (_, i) =>
            listProductsRequest({ limit: PAGE_LIMIT, page: i + 2 }, authSession?.access_token),
          ),
        );
        if (cancelled) return;
        for (const page of remaining) allItems = allItems.concat(page.items);
      }

      setProducts(allItems.map((p) => mapApiProductToLocal(p, flat)));
    };

    fetchAllProducts()
      .catch(() => {/* products stay empty */})
      .finally(() => { if (!cancelled) setIsLoadingProducts(false); });

    return () => { cancelled = true; };
  }, [authSession?.access_token]);

  // Sync cart from server on login / page refresh
  useEffect(() => {
    if (!authSession?.access_token) return;
    getCartRequest(authSession.access_token)
      .then((cart) => {
        const serverItems: CartItem[] = cart.items.map((si) => ({
          variantId: si.variant_id,
          productSlug: '',
          productName: si.variant.product?.name ?? si.variant.name,
          variantName: si.variant.name,
          quantity: si.quantity,
          price: parseFloat(si.unit_price),
          img: null,
          maxStock: si.qty_available,
        }));
        setCartItems((prev: CartItem[]) => {
          const isFirstSync = !isFirstCartSyncDoneRef.current;
          isFirstCartSyncDoneRef.current = true;
          // Restore cached images from localStorage since the server cart API
          // does not return image URLs for cart items.
          const withImages = (items: CartItem[]) =>
            items.map((si) => {
              const local = prev.find((i) => i.variantId === si.variantId);
              return local?.img ? { ...si, img: local.img } : si;
            });
          // Page refresh (token was present at mount): server is authoritative,
          // replace any stale localStorage cache with the live server state.
          if (isFirstSync && initialTokenRef.current) {
            return withImages(serverItems);
          }
          // Mid-session login (guest → user): merge local cart into server cart
          // so guest items that the server doesn't know about yet are preserved.
          if (prev.length === 0) return serverItems;
          const merged = [...withImages(serverItems)];
          for (const localItem of prev) {
            if (!merged.find((i) => i.variantId === localItem.variantId)) {
              merged.push(localItem);
            }
          }
          return merged;
        });
      })
      .catch(() => {/* keep local cart */});
  }, [authSession?.access_token]);

  // Load active reservations from server
  useEffect(() => {
    if (!authSession?.access_token) {
      setReservations([]);
      return;
    }
    listReservationsRequest(authSession.access_token)
      .then(setReservations)
      .catch(() => {/* reservations not critical */});
  }, [authSession?.access_token]);

  // Persist cart to localStorage so it survives page refreshes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // localStorage unavailable (private mode, storage full, etc.)
    }
  }, [cartItems]);

  // Scroll to top on every view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [view]);

  // Detect Stripe redirect return (3D Secure / redirect-based payment methods)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirectStatus = params.get('redirect_status');
    // Stripe appends different param keys depending on the integration:
    //  - Payment Intents flow: `payment_intent` + `payment_intent_client_secret`
    //  - Checkout Sessions (ui_mode='elements'): `session_id`
    //  - Sometimes no params at all, just landing on the return URL.
    // If we have a pending order id stashed before redirect AND we land on
    // /checkout/confirmed, treat it as the post-payment return regardless of
    // which param shape Stripe used.
    const pendingOrderId = sessionStorage.getItem('havtel.stripe.pending_order_id');
    const onConfirmedPath = window.location.pathname === '/checkout/confirmed';
    const hasStripeParams =
      params.has('payment_intent_client_secret') ||
      params.has('session_id') ||
      (onConfirmedPath && !!pendingOrderId);

    if (!hasStripeParams) return;

    // Strip Stripe params from URL so they don't persist on refresh
    window.history.replaceState({}, '', window.location.pathname);

    sessionStorage.removeItem('havtel.stripe.pending_order_id');

    // `redirect_status` is only present on the Payment Intents flow. For
    // Checkout Sessions we assume success since failures keep the user on the
    // payment page rather than redirecting.
    const succeeded = redirectStatus === 'succeeded' || redirectStatus === null;
    if (succeeded) {
      setStripeReturnOrderId(pendingOrderId);
      setView('confirmed');
    } else {
      setAuthError('Your payment was not completed. Please try again.');
      setView('cart');
    }
  }, []);

  // Once auth is ready, fetch the order for a successful Stripe redirect return
  useEffect(() => {
    if (!stripeReturnOrderId || !authSession?.access_token) return;

    const orderId = stripeReturnOrderId;
    setStripeReturnOrderId(null);

    void (async () => {
      try {
        const order = await getOrderRequest(authSession.access_token, orderId);
        setLatestOrder(order);
        setTrackedOrderId(order.id);
      } catch {
        // best-effort — confirmed screen still shows without order details
      }
      setCartItems([]);
    })();
  }, [stripeReturnOrderId, authSession?.access_token]);

  // Poll the order while we're on the confirmed view and the payment webhook
  // hasn't moved the status past `confirmed` yet, so the UI flips to the
  // "Order Confirmed" copy as soon as the backend records the payment.
  useEffect(() => {
    if (view !== 'confirmed') return;
    if (!authSession?.access_token || !latestOrder) return;
    if (latestOrder.status !== 'confirmed') return;

    const orderId = latestOrder.id;
    const token = authSession.access_token;
    const interval = setInterval(async () => {
      try {
        const next = await getOrderRequest(token, orderId);
        setLatestOrder(next);
      } catch {
        // ignore transient errors; we'll try again on the next tick
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [view, authSession?.access_token, latestOrder?.id, latestOrder?.status]);

  const requireAuthForView = (nextView: View) => {
    if (isAuthenticated) {
      setView(nextView);
      return;
    }

    setPostLoginView(nextView);
    setAuthError('Please sign in before continuing to checkout.');
    setView('login');
  };

  useEffect(() => {
    const storedSession = window.localStorage.getItem(AUTH_STORAGE_KEY);

    if (!storedSession) {
      return;
    }

    try {
      const parsedSession = JSON.parse(storedSession) as AuthResponse;
      setAuthSession(parsedSession);
    } catch {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (!authSession?.access_token) {
      return;
    }

    let cancelled = false;

    const syncCurrentUser = async () => {
      try {
        const user = await getCurrentUserRequest(authSession.access_token);
        if (cancelled) {
          return;
        }

        persistSession({
          ...authSession,
          user,
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (error instanceof ApiError && error.status === 401) {
          persistSession(null);
        }
      }
    };

    void syncCurrentUser();

    return () => {
      cancelled = true;
    };
  }, [authSession?.access_token]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!userMenuRef.current?.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const persistSession = (session: AuthResponse | null) => {
    setAuthSession(session);

    if (session) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      return;
    }

    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const callWithRefresh = async <T,>(fn: (token: string) => Promise<T>): Promise<T> => {
    if (!authSession?.access_token) {
      throw new ApiError('Not authenticated', 401);
    }
    try {
      return await fn(authSession.access_token);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401 && authSession.refresh_token) {
        try {
          const newSession = await refreshTokenRequest(authSession.refresh_token);
          persistSession(newSession);
          return await fn(newSession.access_token);
        } catch {
          persistSession(null);
          setAuthError('Your session has expired. Please sign in again.');
          setView('login');
          throw new ApiError('Session expired. Please sign in again.', 401);
        }
      }
      throw error;
    }
  };

  const handleLogin = async (payload: { email: string; password: string }) => {
    setIsAuthSubmitting(true);
    setAuthError(null);

    try {
      const session = await loginRequest(payload);
      persistSession(session);
      const destination = postLoginView ?? 'account';
      setPostLoginView(null);
      setView(destination);
    } catch (error) {
      setAuthError(error instanceof ApiError ? error.message : 'Unable to sign in right now.');
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const handleSignup = async (payload: {
    accountType: 'b2c' | 'b2b';
    firstName: string;
    lastName: string;
    companyName: string;
    email: string;
    password: string;
  }) => {
    setIsAuthSubmitting(true);
    setAuthError(null);

    try {
      const fullName =
        payload.accountType === 'b2b'
          ? payload.companyName.trim()
          : `${payload.firstName} ${payload.lastName}`.trim();

      const session = await registerRequest({
        email: payload.email,
        password: payload.password,
        full_name: fullName,
        customer_type: payload.accountType,
      });
      persistSession(session);
      const destination = postLoginView ?? 'account';
      setPostLoginView(null);
      setView(destination);
    } catch (error) {
      setAuthError(error instanceof ApiError ? error.message : 'Unable to create your account right now.');
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const effectiveTaxRate = appliedExemption ? 0 : taxRatePercent / 100;

  const handleApplyExemption = async () => {
    const code = taxExemptionInput.trim();
    if (!code) return;
    setIsValidatingExemption(true);
    setExemptionError(null);
    try {
      const result = await validateTaxExemptionRequest(code);
      if (result.valid) {
        setAppliedExemption({ code, holder: result.holder_name });
        setExemptionError(null);
      } else {
        setAppliedExemption(null);
        setExemptionError('Invalid or inactive exemption code.');
      }
    } catch {
      setAppliedExemption(null);
      setExemptionError('Could not validate the code. Please try again.');
    } finally {
      setIsValidatingExemption(false);
    }
  };

  const handleRemoveExemption = () => {
    setAppliedExemption(null);
    setTaxExemptionInput('');
    setExemptionError(null);
  };

  const handleProceedToPayment = async (address: CheckoutShippingAddress | null) => {
    if (!authSession?.access_token) {
      setAuthError('Please sign in before continuing to checkout.');
      setView('login');
      return;
    }

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const isWarehousePickup = deliveryType === 'warehouse_pickup';
    const shippingAmount = isWarehousePickup ? 0 : (shippingMethod === 'priority' ? 12 : 35);
    const taxAmount = subtotal * effectiveTaxRate;

    setIsInitiatingCheckout(true);
    setAuthError(null);
    if (address) setCheckoutShippingAddress(address);

    try {
      const result = await callWithRefresh((token) =>
        checkoutRequest(token, {
          shipping_method: isWarehousePickup ? 'warehouse_pickup' : shippingMethod,
          shipping_amount: shippingAmount,
          tax_amount: taxAmount,
          ...(appliedExemption ? { tax_exemption_code: appliedExemption.code } : {}),
          return_url: `${window.location.origin}/checkout/confirmed`,
          ...(isWarehousePickup
            ? { pickup_point_id: selectedPickupPointId ?? undefined }
            : address
            ? {
                shipping_address: {
                  contact_name: `${address.firstName} ${address.lastName}`.trim(),
                  email: address.email,
                  phone: address.phone,
                  street: address.street,
                  city: address.city,
                  state: address.state,
                  postal_code: address.postalCode,
                  country: address.country,
                },
              }
            : {}),
        })
      );
      setCheckoutResponse(result);
      sessionStorage.setItem('havtel.stripe.pending_order_id', result.order_id);
      setView('payment');
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        // handled by callWithRefresh
      } else if (error instanceof ApiError && error.status === 400 && error.message === 'Cart is empty') {
        setCartItems([]);
        setView('bag');
        setAuthError('Your cart is empty. Please add items before checking out.');
      } else {
        setAuthError(error instanceof ApiError ? error.message : 'Unable to process your order right now.');
      }
    } finally {
      setIsInitiatingCheckout(false);
    }
  };

  const handlePaymentSuccess = async () => {
    if (!authSession?.access_token || !checkoutResponse) return;
    try {
      const order = await getOrderRequest(authSession.access_token, checkoutResponse.order_id);
      setLatestOrder(order);
      setTrackedOrderId(order.id);
    } catch {
      // best-effort — confirmed screen still shows without order details
    }
    setCartItems([]);
    setView('confirmed');
  };

  if (isMaintenance) {
    return <MaintenancePage />;
  }

  return (
    <div className="min-h-screen bg-[#101419] text-[#e0e2ea] font-sans selection:bg-[#aac7ff]/30 antialiased">
      {!isCheckoutView && (
      <>
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 bg-[#1a3f6f] flex justify-between items-center px-8 md:px-12 h-20">
        <button type="button" onClick={() => setView('home')} className="cursor-pointer">
          <HavtelLogo height={32} light />
        </button>
        <div className="hidden md:flex items-center gap-8">
          {[
            { key: 'home', label: 'HOME', target: 'home' as View, active: view === 'home' },
            { key: 'shop', label: 'SHOP', target: 'shop' as View, active: view === 'shop' || view === 'product' },
            { key: 'support', label: 'SUPPORT', target: 'support' as View, active: view === 'support' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setView(item.target)}
              className={`text-xs font-bold tracking-[0.12em] transition-colors pb-1 ${item.active ? 'text-white border-b-2 border-white' : 'text-white/70 hover:text-white'}`}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => setView('preorder')}
            className={`text-xs font-bold tracking-[0.12em] transition-colors pb-1 ${view === 'preorder' ? 'text-white border-b-2 border-white' : 'text-white/70 hover:text-white'} relative`}
          >
            PRE-ORDER
            {reservations.reduce((sum, r) => sum + r.quantity, 0) > 0 && (
              <span className="absolute -top-2 -right-3 bg-white text-[#1a3f6f] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {reservations.reduce((sum, r) => sum + r.quantity, 0)}
              </span>
            )}
          </button>
        </div>
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={() => setView('cart')}
            className="text-white/80 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10 relative"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-white text-[#1a3f6f] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={isUserMenuOpen}
              aria-label="Open account menu"
              onClick={() => setIsUserMenuOpen((prev) => !prev)}
              className={`transition-colors rounded-full hover:bg-white/10 ${isUserMenuOpen ? 'bg-white/10' : ''} ${isAuthenticated ? 'p-0 w-9 h-9 flex items-center justify-center' : 'p-2'}`}
            >
              {isAuthenticated ? (
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#1a3f6f] text-xs font-bold ring-2 ring-white/30 select-none">
                  {authSession!.user.full_name
                    .split(' ')
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((w) => w[0].toUpperCase())
                    .join('')}
                </span>
              ) : (
                <User size={20} className={isUserMenuOpen ? 'text-white' : 'text-white/80'} />
              )}
            </button>

            <AnimatePresence>
              {isUserMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.16, ease: 'easeOut' }}
                  className="absolute right-0 top-[calc(100%+12px)] z-[70] w-52 rounded-2xl border border-[#d5e0ec] bg-white p-2 shadow-[0_8px_30px_rgba(26,63,111,0.15)]"
                >
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setView(isAuthenticated ? 'account' : 'login');
                        setIsUserMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-[#1a3f6f] transition-colors hover:bg-[#f0f5fb]"
                    >
                      <CircleUserRound size={18} className="text-[#1a3f6f]/60" />
                      <span>My Account</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setView('orders');
                        setIsUserMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-[#1a3f6f] transition-colors hover:bg-[#f0f5fb]"
                    >
                      <Package size={18} className="text-[#1a3f6f]/60" />
                      <span>Orders</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setView('home');
                        persistSession(null);
                        setAuthError(null);
                        setIsUserMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-[#1a3f6f] transition-colors hover:bg-[#f0f5fb]"
                    >
                      <LogOut size={18} className="text-[#1a3f6f]/60" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-28 right-8 z-[60] bg-[#1c2025] border border-[#aac7ff]/30 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4"
          >
            <div className="w-8 h-8 bg-[#aac7ff]/20 rounded-full flex items-center justify-center text-[#aac7ff]">
              <ShoppingCart size={16} />
            </div>
            <span className="text-sm font-bold text-slate-100">{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>
      </>
      )}

      <AnimatePresence mode="wait">
        {view === 'home' ? (
          <Home key="home" products={products} onShopClick={() => setView('shop')} onProductSelect={openProduct} />
        ) : view === 'notfound' ? (
          <NotFoundView key="notfound" onGoHome={() => {
            setView('home');
          }} />
        ) : view === 'login' ? (
          <AuthLoginView
            key="login"
            onLogin={handleLogin}
            errorMessage={authError}
            isSubmitting={isAuthSubmitting}
            onGoHome={() => setView('home')}
            onGoToSignup={() => {
              setAuthError(null);
              setView('signup');
            }}
            onGoToForgot={() => setView('forgot')}
          />
        ) : view === 'signup' ? (
          <AuthSignupView
            key="signup"
            onSignup={handleSignup}
            errorMessage={authError}
            isSubmitting={isAuthSubmitting}
            onGoHome={() => setView('home')}
            onGoToLogin={() => {
              setAuthError(null);
              setView('login');
            }}
          />
        ) : view === 'forgot' ? (
          <AuthForgotView
            key="forgot"
            onSubmit={() => setView('login')}
            onGoHome={() => setView('home')}
            onGoToLogin={() => setView('login')}
          />
        ) : view === 'reset' ? (
          <AuthResetView
            key="reset"
            onGoHome={() => setView('home')}
            onGoToLogin={() => setView('login')}
            onResetSuccess={() => {
              setNotification('Password updated. Please sign in with your new password.');
              setTimeout(() => setNotification(null), 5000);
              setView('login');
            }}
          />
        ) : view === 'privacy' ? (
          <PrivacyPolicy key="privacy" />
        ) : view === 'terms' ? (
          <TermsOfUse key="terms" />
        ) : view === 'shop' ? (
          <Shop key="shop" products={products} categories={categories} isLoading={isLoadingProducts} onAddToCart={addToCart} onProductSelect={openProduct} onSaveProduct={async (productSlug, quantity = 1) => {
              if (!authSession?.access_token) { requireAuthForView('shop'); return; }
              try {
                const detail = await getProductRequest(productSlug, authSession.access_token);
                const variant =
                  detail.variants.find((v) => v.is_active && (v.inventory?.qty_available ?? 0) > 0) ??
                  detail.variants.find((v) => v.is_active) ??
                  detail.variants[0];
                if (!variant) {
                  setNotification('This product has no active variants.');
                  setTimeout(() => setNotification(null), 3000);
                  return;
                }
                const reservation = await createReservationRequest(authSession.access_token, {
                  variant_id: variant.id,
                  quantity,
                });
                setReservations((prev) => {
                  const idx = prev.findIndex((r) => r.variant_id === reservation.variant_id);
                  return idx >= 0 ? prev.map((r, i) => (i === idx ? reservation : r)) : [...prev, reservation];
                });
                setReservationToast({ expiresAt: reservation.expires_at });
                setTimeout(() => setReservationToast(null), 6000);
                setNotification('Product saved to Pre-Order');
                setTimeout(() => setNotification(null), 3000);
              } catch (err) {
                setNotification(err instanceof ApiError ? err.message : 'Could not save product');
                setTimeout(() => setNotification(null), 3000);
              }
            }} />
        ) : view === 'preorder' ? (
          <PreorderView
            key="preorder"
            reservations={reservations}
            onCancelReservation={async (reservationId) => {
              if (!authSession?.access_token) return;
              await cancelReservationRequest(authSession.access_token, reservationId).catch(() => {});
              setReservations((prev) => prev.filter((r) => r.id !== reservationId));
            }}
            onRestoreToCart={async (reservationId) => {
              if (!authSession?.access_token) return;
              try {
                await restoreReservationRequest(authSession.access_token, reservationId);
                setReservations((prev) => prev.filter((r) => r.id !== reservationId));
                const cart = await getCartRequest(authSession.access_token);
                setCartItems(cart.items.map((si) => ({
                  variantId: si.variant_id,
                  productSlug: '',
                  productName: si.variant.product?.name ?? si.variant.name,
                  variantName: si.variant.name,
                  quantity: si.quantity,
                  price: parseFloat(si.unit_price),
                  img: null,
                  maxStock: si.qty_available,
                })));
              } catch { /* ignore */ }
            }}
            onGoToShop={() => setView('shop')}
          />
        ) : view === 'product' ? (
          <ProductDetailView
            key={`product-${selectedProductSlug ?? ''}`}
            productSlug={selectedProductSlug ?? ''}
            authToken={authSession?.access_token}
            customerType={authSession?.user?.customer_type ?? null}
            allProducts={products}
            onAddToCart={addToCart}
            onBackToShop={() => setView('shop')}
            onProductSelect={openProduct}
          />
        ) : view === 'payment' ? (
          checkoutResponse ? (
            <CheckoutElementsProvider
              key="payment"
              stripe={stripePromise}
              options={{ clientSecret: checkoutResponse.client_secret }}
            >
              <PaymentView
                cartItems={cartItems}
                checkoutShippingAddress={checkoutShippingAddress}
                shippingMethod={shippingMethod}
                deliveryType={deliveryType}
                onClose={() => setView('home')}
                onGoHome={() => setView('home')}
                onBackToShipping={() => {
                  setCheckoutResponse(null);
                  requireAuthForView('shipping');
                }}
                onBackToCart={() => requireAuthForView('cart')}
                onPaymentSuccess={handlePaymentSuccess}
                taxRate={effectiveTaxRate}
                appliedExemption={appliedExemption}
              />
            </CheckoutElementsProvider>
          ) : null
        ) : view === 'tracking' ? (
          <TrackOrderView
            key="tracking"
            authSession={authSession}
            cartItems={cartItems}
            trackedOrderId={trackedOrderId}
            shippingMethod={shippingMethod}
            onClose={() => setView('home')}
            onGoHome={() => setView('home')}
            onBackToOrders={() => setView('orders')}
            onContinueShopping={() => setView('shop')}
          />
        ) : view === 'confirmed' ? (
          <OrderConfirmedView
            key="confirmed"
            cartItems={cartItems}
            order={latestOrder}
            checkoutShippingAddress={checkoutShippingAddress}
            shippingMethod={shippingMethod}
            onClose={() => setView('home')}
            onGoHome={() => setView('home')}
            onTrackOrder={() => {
              if (latestOrder) {
                setTrackedOrderId(latestOrder.id);
              }
              setView('tracking');
            }}
            onContinueShopping={() => setView('shop')}
          />
        ) : view === 'shipping' ? (
          <ShippingView
            key="shipping"
            authSession={authSession}
            cartItems={cartItems}
            checkoutShippingAddress={checkoutShippingAddress}
            shippingMethod={shippingMethod}
            deliveryType={deliveryType}
            selectedPickupPointId={selectedPickupPointId}
            isLoading={isInitiatingCheckout}
            onShippingAddressChange={setCheckoutShippingAddress}
            onShippingMethodChange={setShippingMethod}
            onDeliveryTypeChange={(type) => { setDeliveryType(type); setSelectedPickupPointId(null); }}
            onPickupPointChange={setSelectedPickupPointId}
            onClose={() => setView('home')}
            onGoHome={() => setView('home')}
            onBackToCart={() => requireAuthForView('cart')}
            onGoToAccount={() => setView('account')}
            onProceedToPayment={handleProceedToPayment}
            taxRate={effectiveTaxRate}
            taxExemptionInput={taxExemptionInput}
            appliedExemption={appliedExemption}
            exemptionError={exemptionError}
            isValidatingExemption={isValidatingExemption}
            onTaxExemptionInputChange={setTaxExemptionInput}
            onApplyExemption={handleApplyExemption}
            onRemoveExemption={handleRemoveExemption}
          />
        ) : view === 'cart' ? (
          <ShoppingBagView
            key="cart"
            taxRate={taxRatePercent / 100}
            cartItems={cartItems}
            staleCartWarning={cartItems.some(
              (i) => i.maxStock !== undefined && i.quantity > i.maxStock,
            )}
            onClose={() => setView('shop')}
            onGoHome={() => setView('home')}
            onProceedToShipping={() => requireAuthForView('shipping')}
            onDecreaseQuantity={async (variantId) => {
              const item = cartItems.find((i) => i.variantId === variantId);
              if (!item) return;
              if (item.quantity <= 1) {
                setCartItems((prev) => prev.filter((i) => i.variantId !== variantId));
                if (authSession?.access_token) {
                  await removeCartItemRequest(authSession.access_token, variantId).catch(() => {});
                }
              } else {
                const newQty = item.quantity - 1;
                setCartItems((prev) => prev.map((i) => i.variantId === variantId ? { ...i, quantity: newQty } : i));
                if (authSession?.access_token) {
                  await updateCartItemRequest(authSession.access_token, variantId, newQty).catch(() => {});
                }
              }
            }}
            onIncreaseQuantity={async (variantId) => {
              const item = cartItems.find((i) => i.variantId === variantId);
              if (!item) return;
              const prevQty = item.quantity;
              const newQty = prevQty + 1;
              setCartItems((prev) => prev.map((i) => i.variantId === variantId ? { ...i, quantity: newQty } : i));
              if (authSession?.access_token) {
                try {
                  await updateCartItemRequest(authSession.access_token, variantId, newQty);
                } catch (err) {
                  setCartItems((prev) => prev.map((i) => i.variantId === variantId ? { ...i, quantity: prevQty } : i));
                  setNotification(err instanceof ApiError ? err.message : 'Could not update quantity');
                  setTimeout(() => setNotification(null), 3000);
                }
              }
            }}
            onSetQuantity={async (variantId, qty) => {
              const item = cartItems.find((i) => i.variantId === variantId);
              const prevQty = item?.quantity ?? 1;
              const newQty = Math.max(1, qty);
              setCartItems((prev) => prev.map((i) => i.variantId === variantId ? { ...i, quantity: newQty } : i));
              if (authSession?.access_token) {
                try {
                  await updateCartItemRequest(authSession.access_token, variantId, newQty);
                } catch (err) {
                  setCartItems((prev) => prev.map((i) => i.variantId === variantId ? { ...i, quantity: prevQty } : i));
                  setNotification(err instanceof ApiError ? err.message : 'Could not update quantity');
                  setTimeout(() => setNotification(null), 3000);
                }
              }
            }}
            onRemoveItem={async (variantId) => {
              setCartItems((prev) => prev.filter((i) => i.variantId !== variantId));
              if (authSession?.access_token) {
                await removeCartItemRequest(authSession.access_token, variantId).catch(() => {});
              }
            }}
            onSaveItem={async (variantId) => {
              if (!authSession?.access_token) return;
              try {
                const reservation = await saveCartItemRequest(authSession.access_token, variantId);
                setCartItems((prev) => prev.filter((i) => i.variantId !== variantId));
                setReservations((prev) => {
                  const idx = prev.findIndex((r) => r.variant_id === reservation.variant_id);
                  return idx >= 0 ? prev.map((r, i) => (i === idx ? reservation : r)) : [...prev, reservation];
                });
                setReservationToast({ expiresAt: reservation.expires_at });
                setTimeout(() => setReservationToast(null), 6000);
              } catch (err) {
                setNotification(err instanceof ApiError ? err.message : 'Could not save item');
                setTimeout(() => setNotification(null), 3000);
              }
            }}
            reservationToast={reservationToast}
            savedItems={reservations}
            onCancelSaved={async (reservationId) => {
              if (!authSession?.access_token) return;
              await cancelReservationRequest(authSession.access_token, reservationId).catch(() => {});
              setReservations((prev) => prev.filter((r) => r.id !== reservationId));
            }}
            onRestoreToCart={async (reservationId) => {
              if (!authSession?.access_token) return;
              try {
                await restoreReservationRequest(authSession.access_token, reservationId);
                setReservations((prev) => prev.filter((r) => r.id !== reservationId));
                const cart = await getCartRequest(authSession.access_token);
                setCartItems(cart.items.map((si) => ({
                  variantId: si.variant_id,
                  productSlug: '',
                  productName: si.variant.product?.name ?? si.variant.name,
                  variantName: si.variant.name,
                  quantity: si.quantity,
                  price: parseFloat(si.unit_price),
                  img: null,
                  maxStock: si.qty_available,
                })));
              } catch { /* ignore */ }
            }}
          />
        ) : view === 'orders' ? (
          <OrderHistory
            key="orders"
            authSession={authSession}
            onBackToAccount={() => setView('account')}
            onGoHome={() => setView('home')}
            onGoToCart={() => setView('cart')}
            onTrackOrder={(orderId) => {
              setTrackedOrderId(orderId);
              setView('tracking');
            }}
            onReorder={handleReorder}
          />
        ) : view === 'account' ? (
          <Account
            key="account"
            authSession={authSession}
            onExit={() => setView('home')}
            onOpenOrders={() => setView('orders')}
            onSessionUpdate={persistSession}
            callWithRefresh={callWithRefresh}
          />
        ) : (
          <Support key="support" />
        )}
      </AnimatePresence>


      {!isCheckoutView && (
      <>
      {/* Footer */}
      <footer className="bg-[#1a3f6f] px-8 md:px-16 py-16 text-sm text-white/70">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-14">
          <div className="col-span-1">
            <div className="mb-5">
              <HavtelLogo height={30} light />
            </div>
            <p className="leading-relaxed mb-6 text-white/60 text-sm">Redefining the boundaries of hardware performance and digital infrastructure since 2018.</p>
            <div className="flex gap-4">
              <Globe size={18} className="hover:text-white cursor-pointer transition-colors" />
              <Share2 size={18} className="hover:text-white cursor-pointer transition-colors" />
              <ShieldCheck size={18} className="hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>
          <div>
            <h4 className="text-white font-bold mb-5 uppercase tracking-wider text-xs">Resources</h4>
            <ul className="space-y-3">
              <li>
                <button
                  type="button"
                  onClick={() => setView('support')}
                  className="hover:text-white transition-colors text-left"
                >
                  Support
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-5 uppercase tracking-wider text-xs">Legal</h4>
            <ul className="space-y-3">
              <li>
                <button
                  type="button"
                  onClick={() => setView('privacy')}
                  className="hover:text-white transition-colors text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setView('terms')}
                  className="hover:text-white transition-colors text-left"
                >
                  Terms of Use
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setView('support')}
                  className="hover:text-white transition-colors text-left"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-5 uppercase tracking-wider text-xs">Stay Updated</h4>
            <p className="mb-5 text-white/60 text-sm leading-relaxed">Forging the next era of high-performance computing through uncompromising engineering and design.</p>
            <div className="bg-white/10 rounded-xl p-1 flex items-center border border-white/20">
              <input
                className="bg-transparent border-none focus:outline-none px-4 py-2 text-xs flex-1 text-white placeholder:text-white/50"
                placeholder="Email"
                type="text"
              />
              <button className="bg-white text-[#1a3f6f] p-2 rounded-lg hover:bg-white/90 transition-colors">
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-white/20 text-center text-xs text-white/40">
          Copyright © 2025 HAVTEL CORP. All Rights Reserved.
        </div>
      </footer>

      </>
      )}
    </div>
  );
}

function ShoppingBagView({
  cartItems,
  staleCartWarning,
  taxRate = 0.07,
  onClose,
  onGoHome,
  onProceedToShipping,
  onDecreaseQuantity,
  onIncreaseQuantity,
  onSetQuantity,
  onRemoveItem,
  onSaveItem,
  reservationToast,
  savedItems = [],
  onCancelSaved,
  onRestoreToCart,
}: {
  cartItems: CartItem[];
  staleCartWarning?: boolean;
  taxRate?: number;
  onClose: () => void;
  onGoHome: () => void;
  onProceedToShipping: () => void;
  onDecreaseQuantity: (variantId: string) => void;
  onIncreaseQuantity: (variantId: string) => void;
  onSetQuantity: (variantId: string, qty: number) => void;
  onRemoveItem: (variantId: string) => void;
  onSaveItem: (variantId: string) => void;
  reservationToast: { expiresAt: string } | null;
  savedItems?: Reservation[];
  onCancelSaved?: (id: string) => void;
  onRestoreToCart?: (id: string) => void;
  key?: string;
}) {
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax;
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[linear-gradient(90deg,#ffffff_0%,#fbf7f4_72%,#fff6df_100%)] text-[#1a3f6f]"
    >
      <CheckoutHeader
        activeStep="cart"
        onGoHome={onGoHome}
        onClose={onClose}
      />

      <AnimatePresence>
        {reservationToast && (
          <motion.div
            key="reservation-toast"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed left-1/2 top-6 z-50 -translate-x-1/2 flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-6 py-4 shadow-xl md:min-w-[420px]"
          >
            <Bookmark size={20} className="mt-0.5 shrink-0 text-amber-500" />
            <div>
              <p className="text-[14px] font-black text-amber-900">Product reserved successfully</p>
              <p className="mt-1 text-[13px] text-amber-800">
                Reserved until{' '}
                <strong>
                  {new Date(reservationToast.expiresAt).toLocaleDateString(undefined, {
                    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
                  })}
                </strong>
                . After this date the product will return to the store.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="mx-auto max-w-[1600px] px-8 py-14 md:px-16">
        <div className="grid grid-cols-1 gap-12 xl:grid-cols-[minmax(0,1fr)_440px]">
          <section>
            <div className="mb-10 flex items-end justify-between gap-6">
              <div>
                <span className="mb-4 block text-[12px] font-black uppercase tracking-[0.14em] text-[#5c95bd]">Your Selection</span>
                <h1 className="text-5xl font-black uppercase tracking-[-0.08em] text-[#1f6dad] md:text-[84px] md:leading-[0.95]">Shopping Cart</h1>
              </div>
              <div className="text-[14px] font-black uppercase tracking-[0.08em] text-[#5c95bd]">
                {cartItems.reduce((count, item) => count + item.quantity, 0)} Items
              </div>
            </div>

            {staleCartWarning && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-400/60 bg-amber-50 px-5 py-4 text-amber-800">
                <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                <div>
                  <p className="font-bold text-sm">Your cart has been updated</p>
                  <p className="mt-0.5 text-sm leading-relaxed">Some items have limited availability since you last visited. Review quantities before checking out.</p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {cartItems.map((item) => (
                <div
                  key={item.variantId}
                  className="rounded-[22px] bg-[linear-gradient(90deg,#0f66a6_0%,#2c73aa_100%)] p-5 text-white shadow-[0_16px_34px_rgba(62,117,162,0.22)] md:p-7"
                >
                  <div className="flex flex-col gap-6 md:flex-row md:items-center">
                    <div className="h-40 w-full overflow-hidden rounded-[14px] bg-[linear-gradient(180deg,#8ec4e3_0%,#7db8dd_100%)] md:h-36 md:w-40">
                      {item.img ? (
                        <img
                          src={item.img}
                          alt={item.productName}
                          className="h-full w-full object-contain p-4"
                          referrerPolicy="no-referrer"
                        />
                      ) : null}
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h2 className="text-[34px] font-black tracking-[-0.05em] text-white">{item.productName}</h2>
                          <p className="mt-2 text-[18px] italic text-white/85">{item.variantName}</p>
                          {item.maxStock !== undefined && item.quantity > item.maxStock && (
                            <p className="mt-2 text-[13px] font-bold text-amber-300">
                              Only {item.maxStock} in stock — reduce quantity to proceed
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-[34px] font-black tracking-[-0.05em] text-white">
                            {formatCurrency(item.price * item.quantity)}
                          </div>
                          {item.quantity > 1 && (
                            <div className="mt-1 text-[14px] font-bold text-white/65">
                              {formatCurrency(item.price)} × {item.quantity}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                        <div className="inline-flex items-center gap-5 rounded-[16px] bg-[linear-gradient(90deg,#7eb7db_0%,#9cc7e2_100%)] px-5 py-4 shadow-[0_10px_20px_rgba(14,67,108,0.18)]">
                          <button type="button" onClick={() => onDecreaseQuantity(item.variantId)} className="text-xl font-black text-white transition-colors hover:text-white/80">
                            <Minus size={18} />
                          </button>
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              if (!isNaN(val) && val >= 1) onSetQuantity(item.variantId, val);
                            }}
                            onBlur={(e) => {
                              const val = parseInt(e.target.value, 10);
                              if (isNaN(val) || val < 1) onSetQuantity(item.variantId, 1);
                            }}
                            onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                            className="w-12 bg-transparent text-center text-[22px] font-black text-white [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none focus:outline-none"
                          />
                          <button type="button" onClick={() => onIncreaseQuantity(item.variantId)} className="text-xl font-black text-white transition-colors hover:text-white/80">
                            <Plus size={18} />
                          </button>
                        </div>

                        <div className="flex items-center gap-4">
                          <button
                            type="button"
                            onClick={() => onSaveItem(item.variantId)}
                            className="inline-flex items-center gap-2 text-[14px] font-black uppercase tracking-[0.06em] text-white/70 transition-colors hover:text-amber-300"
                            title="Save for later"
                          >
                            <Bookmark size={15} />
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.variantId)}
                            className="inline-flex items-center gap-3 text-[15px] font-black uppercase tracking-[0.06em] text-white transition-colors hover:text-white/80"
                          >
                            <Trash2 size={16} />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {cartItems.length === 0 && (
                <div className="rounded-[22px] border border-[#d6e4ec] bg-white p-12 text-center shadow-[0_16px_34px_rgba(107,154,187,0.12)]">
                  <h2 className="mb-3 text-3xl font-black tracking-[-0.04em] text-[#1f6dad]">Your shopping bag is empty</h2>
                  <p className="mb-8 text-[#5d95bc]">Add products from the catalog to build your next HAVTEL order.</p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex items-center gap-3 rounded-[14px] bg-[linear-gradient(90deg,#0f5ca0_0%,#1d6ea9_100%)] px-8 py-5 text-lg font-black text-white shadow-[0_14px_30px_rgba(13,77,138,0.22)]"
                  >
                    Browse the Store
                    <ArrowRight size={20} />
                  </button>
                </div>
              )}

              {cartItems.length > 0 && (
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex items-center gap-2 text-[14px] font-black uppercase tracking-[0.08em] text-[#5c95bd] transition-colors hover:text-[#1f6dad]"
                  >
                    <ArrowRight size={16} className="rotate-180" />
                    Continue Shopping
                  </button>
                </div>
              )}
            </div>

            {savedItems.length > 0 && (
              <div className="mt-10">
                <span className="mb-4 block text-[12px] font-black uppercase tracking-[0.14em] text-[#5c95bd]">Saved for Later</span>
                <div className="space-y-4">
                  {savedItems.map((r) => {
                    const expiresAt = new Date(r.expires_at);
                    const expLabel = expiresAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
                    return (
                      <div key={r.id} className="flex flex-col gap-4 rounded-[18px] border border-amber-200 bg-amber-50/60 p-5 md:flex-row md:items-center">
                        <div className="flex-1">
                          <p className="text-[17px] font-black tracking-[-0.03em] text-[#1f6dad]">{r.variant.product?.name ?? r.variant.name}</p>
                          <p className="mt-0.5 text-[14px] italic text-[#5c95bd]">{r.variant.name}</p>
                          <p className="mt-1 text-[12px] font-mono text-[#5c95bd]">{r.variant.sku}</p>
                          <p className="mt-2 text-[12px] font-bold text-amber-700">
                            Reserved until {expLabel} · {r.quantity} unit{r.quantity !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[16px] font-black text-[#1f6dad]">{formatCurrency(parseFloat(r.subtotal))}</span>
                          <button
                            type="button"
                            onClick={() => onRestoreToCart?.(r.id)}
                            className="inline-flex items-center gap-2 rounded-[12px] bg-[linear-gradient(90deg,#0f5ca0_0%,#1d6ea9_100%)] px-4 py-2.5 text-[13px] font-black uppercase tracking-[0.05em] text-white shadow-md transition hover:brightness-110"
                          >
                            <ShoppingCart size={13} />
                            Move to Cart
                          </button>
                          <button
                            type="button"
                            onClick={() => onCancelSaved?.(r.id)}
                            className="inline-flex items-center gap-2 text-[13px] font-black uppercase tracking-[0.05em] text-[#5c95bd] transition hover:text-red-500"
                          >
                            <Trash2 size={13} />
                            Cancel
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </section>

          <aside className="h-fit rounded-[22px] border-[5px] border-[#7eb7db] bg-[rgba(255,250,241,0.92)] p-8 shadow-[0_16px_34px_rgba(107,154,187,0.16)] xl:sticky xl:top-10">
            <h2 className="mb-8 text-[32px] font-black tracking-[-0.06em] text-[#1f6dad] md:text-[58px]">Order Summary</h2>

            {cartItems.length > 0 && (
              <>
                <div className="mb-6 space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.variantId} className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-black text-[#1f6dad]">{item.productName}</p>
                        <p className="text-[12px] text-[#5c95bd]">{item.variantName} × {item.quantity}</p>
                      </div>
                      <span className="shrink-0 text-[14px] font-black text-[#1f6dad]">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="mb-8 border-t border-[#c4dcec]"></div>
              </>
            )}

            <div className="space-y-8 text-lg">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[14px] font-black uppercase tracking-[0.08em] text-[#5c95bd]">Subtotal</span>
                <span className="text-[16px] font-black text-[#1f6dad]">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[14px] font-black uppercase tracking-[0.08em] text-[#5c95bd]">Shipping</span>
                <span className="text-[15px] font-black uppercase tracking-[0.06em] text-[#1f6dad]">Calculated at next step</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[14px] font-black uppercase tracking-[0.08em] text-[#5c95bd]">Estimated Tax</span>
                <span className="text-[16px] font-black text-[#1f6dad]">
                  {formatCurrency(tax)}
                </span>
              </div>
            </div>

            <div className="my-10 border-t border-[#7eb7db]"></div>

            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="text-[20px] font-black uppercase tracking-[0.06em] text-[#5c95bd]">Total</div>
              </div>
              <div className="text-right">
                <div className="text-[44px] font-black tracking-[-0.08em] leading-none text-[#1f6dad] md:text-[72px]">
                  {formatCurrency(total)}
                </div>
                <div className="mt-2 text-[12px] font-black uppercase tracking-[0.08em] text-[#5c95bd]">Including VAT</div>
              </div>
            </div>

            <div className="mt-10">
              <label className="mb-4 block text-[14px] font-black uppercase tracking-[0.08em] text-[#5c95bd]">
                Promotional Code
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => { setPromoCode(e.target.value); setPromoError(null); }}
                  placeholder="Enter code"
                  className="min-w-0 flex-1 rounded-[16px] border border-[#d6e4ec] bg-[linear-gradient(90deg,#d7ebf5_0%,#cfe6f3_100%)] px-5 py-4 text-base font-bold text-white placeholder:text-white/80 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => { if (promoCode.trim()) setPromoError('Invalid promotional code.'); }}
                  className="rounded-[16px] bg-[linear-gradient(90deg,#63a8d5_0%,#74b4db_100%)] px-6 py-4 text-lg font-black text-white shadow-[0_10px_24px_rgba(107,154,187,0.16)] transition-colors hover:opacity-95"
                >
                  Apply
                </button>
              </div>
              {promoError && (
                <p className="mt-3 text-[13px] font-bold text-red-400">{promoError}</p>
              )}
            </div>

            <button
              type="button"
              onClick={onProceedToShipping}
              className="mt-10 w-full rounded-[16px] bg-[linear-gradient(90deg,#0f5ca0_0%,#1d6ea9_100%)] px-8 py-6 text-[20px] font-black uppercase tracking-[0.06em] text-white shadow-[0_16px_30px_rgba(13,77,138,0.24)] transition-transform hover:scale-[1.01]"
            >
              Proceed to Checkout
            </button>

            <div className="mt-12 flex items-center justify-center gap-10 text-[#1f6dad]">
              <CreditCard size={24} />
              <Wallet size={24} />
              <ShieldCheck size={24} />
            </div>
            <p className="mt-6 text-center text-[12px] font-black uppercase tracking-[0.06em] text-[#1f6dad]">
              Secure SSL encryption & data protection guaranteed
            </p>
          </aside>
        </div>
      </main>

      <footer className="bg-[#1a3f6f] px-8 py-10 text-sm uppercase tracking-[0.16em] text-white/65 md:px-16">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>© 2026 HAVTEL CORP. All Rights Reserved</div>
          <div className="flex flex-wrap gap-6">
            <button
              type="button"
              onClick={() => navigateToPath('/privacy-policy')}
              className="transition-colors hover:text-white"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => navigateToPath('/terms-of-use')}
              className="transition-colors hover:text-white"
            >
              Terms of Use
            </button>
            <span>Help Center</span>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}

function ShippingView({
  authSession,
  cartItems,
  checkoutShippingAddress,
  shippingMethod,
  deliveryType,
  selectedPickupPointId,
  isLoading = false,
  onShippingAddressChange,
  onShippingMethodChange,
  onDeliveryTypeChange,
  onPickupPointChange,
  onClose,
  onGoHome,
  onBackToCart,
  onGoToAccount,
  onProceedToPayment,
  taxRate = 0.07,
  taxExemptionInput,
  appliedExemption,
  exemptionError,
  isValidatingExemption = false,
  onTaxExemptionInputChange,
  onApplyExemption,
  onRemoveExemption,
}: {
  authSession: AuthSession;
  cartItems: CartItem[];
  checkoutShippingAddress: CheckoutShippingAddress | null;
  shippingMethod: 'priority' | 'express';
  deliveryType: 'home_delivery' | 'warehouse_pickup';
  selectedPickupPointId: string | null;
  isLoading?: boolean;
  onShippingAddressChange: (address: CheckoutShippingAddress) => void;
  onShippingMethodChange: (method: 'priority' | 'express') => void;
  onDeliveryTypeChange: (type: 'home_delivery' | 'warehouse_pickup') => void;
  onPickupPointChange: (id: string) => void;
  onClose: () => void;
  onGoHome: () => void;
  onBackToCart: () => void;
  onGoToAccount: () => void;
  onProceedToPayment: (address: CheckoutShippingAddress | null) => void;
  taxRate?: number;
  taxExemptionInput: string;
  appliedExemption: { code: string; holder: string | null } | null;
  exemptionError: string | null;
  isValidatingExemption?: boolean;
  onTaxExemptionInputChange: (value: string) => void;
  onApplyExemption: () => void;
  onRemoveExemption: () => void;
  key?: string;
}) {
  const isWarehousePickup = deliveryType === 'warehouse_pickup';
  const shippingCost = isWarehousePickup ? 0 : (shippingMethod === 'priority' ? 12 : 35);
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * taxRate;
  const total = subtotal + shippingCost + tax;
  const summaryItem = cartItems[0] ?? null;
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [pickupPoints, setPickupPoints] = useState<PickupPointPublic[]>([]);
  const [isLoadingPickupPoints, setIsLoadingPickupPoints] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const validateShippingForm = (): boolean => {
    const f = shippingForm;
    const firstNameErr = validateName(f.firstName);
    if (firstNameErr) { setFormError(`First name: ${firstNameErr}`); return false; }
    if (f.lastName.trim() && !NAME_RE.test(f.lastName.trim())) { setFormError('Last name: Only letters, spaces, hyphens, and apostrophes are allowed.'); return false; }
    const emailErr = validateEmail(f.email);
    if (emailErr) { setFormError(`Email: ${emailErr}`); return false; }
    const phoneErr = validatePhone(f.phone, true);
    if (phoneErr) { setFormError(`Phone: ${phoneErr}`); return false; }
    if (!f.street.trim()) { setFormError('Street address is required.'); return false; }
    if (!f.city.trim()) { setFormError('City is required.'); return false; }
    if (!f.country.trim()) { setFormError('Country is required.'); return false; }
    setFormError(null);
    return true;
  };

  useEffect(() => {
    if (deliveryType !== 'warehouse_pickup') return;
    setIsLoadingPickupPoints(true);
    listPickupPointsRequest()
      .then(setPickupPoints)
      .catch(() => setPickupPoints([]))
      .finally(() => setIsLoadingPickupPoints(false));
  }, [deliveryType]);
  const [shippingForm, setShippingForm] = useState<CheckoutShippingAddress>({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
  });

  const applyAddressToForm = (address: UserAddress) => {
    const { firstName, lastName } = splitFullName(address.contact_name ?? authSession?.user.full_name ?? '');
    setSelectedAddressId(address.id);
    setShippingForm({
      email: address.contact_email ?? authSession?.user.email ?? '',
      phone: address.contact_phone ?? authSession?.user.phone ?? '',
      firstName,
      lastName,
      street: address.street,
      city: address.city,
      state: address.state || 'N/A',
      postalCode: address.zip_code || 'N/A',
      country: address.country,
    });
  };

  useEffect(() => {
    if (checkoutShippingAddress) {
      setShippingForm(checkoutShippingAddress);
      return;
    }

    if (!authSession?.access_token) {
      setSavedAddresses([]);
      return;
    }

    let cancelled = false;

    const loadAddresses = async () => {
      setIsLoadingAddresses(true);
      setAddressError(null);

      try {
        const addresses = await listUserAddressesRequest(authSession.access_token);
        if (cancelled) {
          return;
        }

        setSavedAddresses(addresses);
        const preferredAddress = addresses.find((address) => address.is_default) ?? addresses[0];
        if (preferredAddress) {
          applyAddressToForm(preferredAddress);
        } else {
          const { firstName, lastName } = splitFullName(authSession.user.full_name);
          setShippingForm({
            email: authSession.user.email,
            phone: authSession.user.phone ?? '',
            firstName,
            lastName,
            street: '',
            city: '',
            state: '',
            postalCode: '',
            country: 'US',
          });
        }
      } catch (error) {
        if (!cancelled) {
          setAddressError(error instanceof ApiError ? error.message : 'Unable to load your saved shipping addresses.');
        }
      } finally {
        if (!cancelled) {
          setIsLoadingAddresses(false);
        }
      }
    };

    void loadAddresses();

    return () => {
      cancelled = true;
    };
  }, [authSession?.access_token, checkoutShippingAddress]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[linear-gradient(90deg,#ffffff_0%,#fbf7f4_72%,#fff6df_100%)] text-[#1a3f6f]"
    >
      <CheckoutHeader
        activeStep="shipping"
        onGoHome={onGoHome}
        onClose={onClose}
        onBackToCart={onBackToCart}
      />

      <main className="mx-auto max-w-[1600px] px-8 py-14 md:px-16">
        <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_400px]">
          <section>
            <div className="mb-10">
              <h1 className="text-5xl font-black uppercase tracking-[-0.08em] text-[#1f6dad] md:text-[82px] md:leading-[0.95]">Shipping Logistics</h1>
              <p className="mt-5 max-w-3xl text-[22px] italic leading-relaxed text-[#5d95bc]">
                Precision delivery for high-performance hardware. Enter your coordinates below.
              </p>
            </div>

            <div className="mb-14 flex items-center gap-4 md:gap-6">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1f6dad] text-white shadow-[0_0_0_8px_rgba(126,183,219,0.16)]">
                <div className="h-2.5 w-2.5 rounded-full bg-white"></div>
              </div>
              <div className="h-1 flex-1 rounded-full bg-[#1f6dad]"></div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-[0_0_0_8px_rgba(126,183,219,0.16)]">
                <div className="h-3 w-3 rounded-full bg-[#7eb7db]"></div>
              </div>
              <div className="h-1 flex-1 rounded-full bg-[#8ec4e3]"></div>
              <div className="h-1 flex-1 rounded-full bg-[#8ec4e3]"></div>
            </div>

            <form className="space-y-14">
              {/* Delivery Type Selector */}
              <div>
                <div className="mb-8 flex items-center gap-4">
                  <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-[linear-gradient(180deg,#7eb7db_0%,#9bc8e2_100%)] px-2 text-xs font-black text-white shadow-[0_8px_18px_rgba(107,154,187,0.16)]">1</span>
                  <h2 className="text-[30px] font-black tracking-[-0.04em] text-[#1f6dad]">Delivery Type</h2>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => onDeliveryTypeChange('home_delivery')}
                    className={`rounded-[18px] border p-6 text-left shadow-[0_12px_28px_rgba(107,154,187,0.12)] transition-all ${
                      deliveryType === 'home_delivery'
                        ? 'border-[#7eb7db] bg-[linear-gradient(90deg,#0f66a6_0%,#2c73aa_100%)] text-white'
                        : 'border-[#d6e4ec] bg-[linear-gradient(90deg,#bfdcf0_0%,#d1e7f5_100%)] text-[#1f6dad]'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <Truck size={28} className="shrink-0" />
                      <div>
                        <div className="text-2xl font-black tracking-[-0.04em]">Home Delivery</div>
                        <div className={`mt-1 text-sm ${deliveryType === 'home_delivery' ? 'text-white/80' : 'text-[#5d95bc]'}`}>Delivered to your address</div>
                      </div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeliveryTypeChange('warehouse_pickup')}
                    className={`rounded-[18px] border p-6 text-left shadow-[0_12px_28px_rgba(107,154,187,0.12)] transition-all ${
                      deliveryType === 'warehouse_pickup'
                        ? 'border-[#7eb7db] bg-[linear-gradient(90deg,#0f66a6_0%,#2c73aa_100%)] text-white'
                        : 'border-[#d6e4ec] bg-[linear-gradient(90deg,#bfdcf0_0%,#d1e7f5_100%)] text-[#1f6dad]'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <Package size={28} className="shrink-0" />
                      <div>
                        <div className="text-2xl font-black tracking-[-0.04em]">Warehouse Pickup</div>
                        <div className={`mt-1 text-sm ${deliveryType === 'warehouse_pickup' ? 'text-white/80' : 'text-[#5d95bc]'}`}>Pick up at our facility · Free</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {isWarehousePickup ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-[linear-gradient(180deg,#7eb7db_0%,#9bc8e2_100%)] px-2 text-xs font-black text-white shadow-[0_8px_18px_rgba(107,154,187,0.16)]">2</span>
                    <h2 className="text-[26px] font-black tracking-[-0.04em] text-[#1f6dad]">Select Pickup Location</h2>
                  </div>
                  {isLoadingPickupPoints ? (
                    <div className="rounded-[18px] border border-[#d6e4ec] bg-white p-6 text-[#5d95bc] shadow-[0_12px_28px_rgba(107,154,187,0.12)]">
                      Loading pickup locations...
                    </div>
                  ) : pickupPoints.length === 0 ? (
                    <div className="rounded-[18px] border border-[#d6e4ec] bg-white p-8 text-center shadow-[0_12px_28px_rgba(107,154,187,0.12)]">
                      <Package size={32} className="mx-auto mb-3 text-[#5d95bc]" />
                      <p className="font-bold text-[#1f6dad]">No pickup locations available</p>
                      <p className="mt-1 text-sm text-[#5d95bc]">Please choose home delivery or contact support.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {pickupPoints.map((point) => (
                        <button
                          key={point.id}
                          type="button"
                          onClick={() => onPickupPointChange(point.id)}
                          className={`rounded-[18px] border p-6 text-left shadow-[0_12px_28px_rgba(107,154,187,0.12)] transition-all ${
                            selectedPickupPointId === point.id
                              ? 'border-[#7eb7db] bg-[linear-gradient(90deg,#0f66a6_0%,#2c73aa_100%)] text-white'
                              : 'border-[#d6e4ec] bg-white text-[#1f6dad] hover:border-[#7eb7db]'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${selectedPickupPointId === point.id ? 'bg-white/20' : 'bg-[#eaf6ff]'}`}>
                              <Package size={18} className={selectedPickupPointId === point.id ? 'text-white' : 'text-[#1f6dad]'} />
                            </div>
                            <div className="min-w-0">
                              <div className="font-black text-base leading-tight">{point.name}</div>
                              <div className={`mt-1 text-sm leading-snug ${selectedPickupPointId === point.id ? 'text-white/80' : 'text-[#5d95bc]'}`}>
                                {point.address}, {point.city}{point.state ? `, ${point.state}` : ''} · {point.country}
                              </div>
                              {point.phone && (
                                <div className={`mt-1 text-xs ${selectedPickupPointId === point.id ? 'text-white/70' : 'text-[#5d95bc]'}`}>
                                  {point.phone}
                                </div>
                              )}
                              {point.notes && (
                                <div className={`mt-1 text-xs italic ${selectedPickupPointId === point.id ? 'text-white/60' : 'text-[#8cb8d4]'}`}>
                                  {point.notes}
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <>
              <div>
                <div className="mb-8 flex items-center gap-4">
                  <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-[linear-gradient(180deg,#7eb7db_0%,#9bc8e2_100%)] px-2 text-xs font-black text-white shadow-[0_8px_18px_rgba(107,154,187,0.16)]">2</span>
                  <h2 className="text-[30px] font-black tracking-[-0.04em] text-[#1f6dad]">Saved Addresses</h2>
                </div>
                {addressError ? (
                  <p className="mb-6 rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-600">{addressError}</p>
                ) : null}
                {isLoadingAddresses ? (
                  <div className="rounded-[18px] border border-[#d6e4ec] bg-white p-6 text-[#5d95bc] shadow-[0_12px_28px_rgba(107,154,187,0.12)]">Loading saved addresses...</div>
                ) : savedAddresses.length > 0 ? (
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {savedAddresses.map((address) => (
                      <button
                        key={address.id}
                        type="button"
                        onClick={() => applyAddressToForm(address)}
                        className={`rounded-[18px] border p-6 text-left shadow-[0_12px_28px_rgba(107,154,187,0.12)] transition-all ${
                          selectedAddressId === address.id
                            ? 'border-[#7eb7db] bg-[linear-gradient(90deg,#0f66a6_0%,#2c73aa_100%)] text-white'
                            : 'border-[#d6e4ec] bg-white text-[#1f6dad]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-xl font-black">{address.label ?? 'Saved Address'}</div>
                            <div className={`mt-2 text-sm ${selectedAddressId === address.id ? 'text-white/80' : 'text-[#5d95bc]'}`}>{address.contact_name ?? 'No contact name'}</div>
                          </div>
                          {address.is_default ? (
                            <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${selectedAddressId === address.id ? 'bg-white/20 text-white' : 'bg-[#eaf6ff] text-[#1f6dad]'}`}>
                              Default
                            </span>
                          ) : null}
                        </div>
                        <div className={`mt-4 text-sm leading-relaxed ${selectedAddressId === address.id ? 'text-white/90' : 'text-[#5d95bc]'}`}>
                          {[address.street, address.city, address.state, address.zip_code, address.country].filter(Boolean).join(', ')}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[18px] border border-[#d6e4ec] bg-white p-6 shadow-[0_12px_28px_rgba(107,154,187,0.12)]">
                    <p className="text-[#5d95bc] mb-4">You don't have any saved delivery contacts yet. Add one from your account to speed up checkout, or fill in the address manually below.</p>
                    <button
                      type="button"
                      onClick={onGoToAccount}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#1a3f6f] px-5 py-3 text-sm font-bold text-white shadow-[0_4px_14px_rgba(26,63,111,0.2)] transition-all hover:bg-[#15345c]"
                    >
                      <MapPin size={14} />
                      Add Delivery Contact
                    </button>
                  </div>
                )}
              </div>

              <div>
                <div className="mb-8 flex items-center gap-4">
                  <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-[linear-gradient(180deg,#7eb7db_0%,#9bc8e2_100%)] px-2 text-xs font-black text-white shadow-[0_8px_18px_rgba(107,154,187,0.16)]">3</span>
                  <h2 className="text-[30px] font-black tracking-[-0.04em] text-[#1f6dad]">Contact Information</h2>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <span className="mb-4 block text-[13px] font-black uppercase tracking-[0.08em] text-[#5c95bd]">Email Address</span>
                    <div className="w-full rounded-[14px] border border-[#d6e4ec] bg-[linear-gradient(90deg,#bfdcf0_0%,#d1e7f5_100%)] px-6 py-5 text-xl font-bold text-white shadow-[0_10px_24px_rgba(107,154,187,0.12)]">
                      {shippingForm.email || '—'}
                    </div>
                  </div>
                  <div>
                    <span className="mb-4 block text-[13px] font-black uppercase tracking-[0.08em] text-[#5c95bd]">Phone Number</span>
                    <div className="w-full rounded-[14px] border border-[#d6e4ec] bg-[linear-gradient(90deg,#bfdcf0_0%,#d1e7f5_100%)] px-6 py-5 text-xl font-bold text-white shadow-[0_10px_24px_rgba(107,154,187,0.12)]">
                      {shippingForm.phone || '—'}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-8 flex items-center gap-4">
                  <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-[linear-gradient(180deg,#7eb7db_0%,#9bc8e2_100%)] px-2 text-xs font-black text-white shadow-[0_8px_18px_rgba(107,154,187,0.16)]">4</span>
                  <h2 className="text-[30px] font-black tracking-[-0.04em] text-[#1f6dad]">Destination Details</h2>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <span className="mb-4 block text-[13px] font-black uppercase tracking-[0.08em] text-[#5c95bd]">First Name</span>
                    <div className="w-full rounded-[14px] border border-[#d6e4ec] bg-[linear-gradient(90deg,#bfdcf0_0%,#d1e7f5_100%)] px-6 py-5 text-xl font-bold text-white shadow-[0_10px_24px_rgba(107,154,187,0.12)]">
                      {shippingForm.firstName || '—'}
                    </div>
                  </div>
                  <div>
                    <span className="mb-4 block text-[13px] font-black uppercase tracking-[0.08em] text-[#5c95bd]">Last Name</span>
                    <div className="w-full rounded-[14px] border border-[#d6e4ec] bg-[linear-gradient(90deg,#bfdcf0_0%,#d1e7f5_100%)] px-6 py-5 text-xl font-bold text-white shadow-[0_10px_24px_rgba(107,154,187,0.12)]">
                      {shippingForm.lastName || '—'}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <span className="mb-4 block text-[13px] font-black uppercase tracking-[0.08em] text-[#5c95bd]">Street Address</span>
                    <div className="w-full rounded-[14px] border border-[#d6e4ec] bg-[linear-gradient(90deg,#bfdcf0_0%,#d1e7f5_100%)] px-6 py-5 text-xl font-bold text-white shadow-[0_10px_24px_rgba(107,154,187,0.12)]">
                      {shippingForm.street || '—'}
                    </div>
                  </div>
                  <div>
                    <span className="mb-4 block text-[13px] font-black uppercase tracking-[0.08em] text-[#5c95bd]">City</span>
                    <div className="w-full rounded-[14px] border border-[#d6e4ec] bg-[linear-gradient(90deg,#bfdcf0_0%,#d1e7f5_100%)] px-6 py-5 text-xl font-bold text-white shadow-[0_10px_24px_rgba(107,154,187,0.12)]">
                      {shippingForm.city || '—'}
                    </div>
                  </div>
                  <div>
                    <span className="mb-4 block text-[13px] font-black uppercase tracking-[0.08em] text-[#5c95bd]">State / Province</span>
                    <div className="w-full rounded-[14px] border border-[#d6e4ec] bg-[linear-gradient(90deg,#bfdcf0_0%,#d1e7f5_100%)] px-6 py-5 text-xl font-bold text-white shadow-[0_10px_24px_rgba(107,154,187,0.12)]">
                      {shippingForm.state || '—'}
                    </div>
                  </div>
                  <div>
                    <span className="mb-4 block text-[13px] font-black uppercase tracking-[0.08em] text-[#5c95bd]">Postal Code</span>
                    <div className="w-full rounded-[14px] border border-[#d6e4ec] bg-[linear-gradient(90deg,#bfdcf0_0%,#d1e7f5_100%)] px-6 py-5 text-xl font-bold text-white shadow-[0_10px_24px_rgba(107,154,187,0.12)]">
                      {shippingForm.postalCode || '—'}
                    </div>
                  </div>
                  <div>
                    <span className="mb-4 block text-[13px] font-black uppercase tracking-[0.08em] text-[#5c95bd]">Country</span>
                    <div className="w-full rounded-[14px] border border-[#d6e4ec] bg-[linear-gradient(90deg,#bfdcf0_0%,#d1e7f5_100%)] px-6 py-5 text-xl font-bold text-white shadow-[0_10px_24px_rgba(107,154,187,0.12)]">
                      {(PARSED_COUNTRIES.find((p) => p.iso2 === shippingForm.country)?.name ?? shippingForm.country) || '—'}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-8 flex items-center gap-4">
                  <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-[linear-gradient(180deg,#7eb7db_0%,#9bc8e2_100%)] px-2 text-xs font-black text-white shadow-[0_8px_18px_rgba(107,154,187,0.16)]">5</span>
                  <h2 className="text-[30px] font-black tracking-[-0.04em] text-[#1f6dad]">Delivery Speed</h2>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => onShippingMethodChange('priority')}
                    className={`rounded-[18px] border p-6 text-left shadow-[0_12px_28px_rgba(107,154,187,0.12)] transition-all ${
                      shippingMethod === 'priority'
                        ? 'border-[#7eb7db] bg-[linear-gradient(90deg,#0f66a6_0%,#2c73aa_100%)] text-white'
                        : 'border-[#d6e4ec] bg-[linear-gradient(90deg,#bfdcf0_0%,#d1e7f5_100%)] text-[#1f6dad]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-3xl font-black tracking-[-0.04em]">Priority Tech-Ship</div>
                        <div className={`mt-2 text-xl ${shippingMethod === 'priority' ? 'text-white/85' : 'text-[#5d95bc]'}`}>2-3 Business Days</div>
                      </div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => onShippingMethodChange('express')}
                    className={`rounded-[18px] border p-6 text-left shadow-[0_12px_28px_rgba(107,154,187,0.12)] transition-all ${
                      shippingMethod === 'express'
                        ? 'border-[#7eb7db] bg-[linear-gradient(90deg,#0f66a6_0%,#2c73aa_100%)] text-white'
                        : 'border-[#d6e4ec] bg-[linear-gradient(90deg,#bfdcf0_0%,#d1e7f5_100%)] text-[#1f6dad]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-3xl font-black tracking-[-0.04em]">Quantum Express</div>
                        <div className={`mt-2 text-xl ${shippingMethod === 'express' ? 'text-white/85' : 'text-[#5d95bc]'}`}>Next Day Guaranteed</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
                </>
              )}

              {formError && (
                <p className="mb-3 rounded-[10px] bg-red-50 px-4 py-2 text-sm font-semibold text-red-600">{formError}</p>
              )}
              <div className="flex flex-col gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={onBackToCart}
                  className="rounded-[16px] bg-[linear-gradient(90deg,#6eaed4_0%,#78b5da_100%)] px-10 py-5 text-[20px] font-black text-white shadow-[0_14px_28px_rgba(107,154,187,0.18)]"
                >
                  Back to Cart
                </button>
                <button
                  type="button"
                  disabled={isLoading || (isWarehousePickup && !selectedPickupPointId)}
                  onClick={() => {
                    if (!isWarehousePickup && !validateShippingForm()) return;
                    onProceedToPayment(isWarehousePickup ? null : shippingForm);
                  }}
                  className="rounded-[16px] bg-[linear-gradient(90deg,#0f5ca0_0%,#1d6ea9_100%)] px-10 py-5 text-[20px] font-black text-white shadow-[0_16px_30px_rgba(13,77,138,0.24)] transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                >
                  {isLoading ? 'Preparing Order…' : isWarehousePickup && !selectedPickupPointId ? 'Select a Pickup Location' : 'Proceed to Payment'}
                </button>
              </div>
            </form>
          </section>

          <aside className="space-y-8">
            <div className="rounded-[22px] border-[5px] border-[#7eb7db] bg-[rgba(255,250,241,0.92)] p-6 shadow-[0_16px_34px_rgba(107,154,187,0.16)]">
              <div className="mb-6 text-[14px] font-black uppercase tracking-[0.08em] text-[#5c95bd]">Cart Configuration</div>
              {summaryItem && (
                <>
                  <div className="flex gap-5">
                    <div className="h-24 w-24 overflow-hidden rounded-[12px] bg-[linear-gradient(180deg,#8ec4e3_0%,#7db8dd_100%)]">
                      {summaryItem.img ? <img src={summaryItem.img} alt={summaryItem.productName} className="h-full w-full object-contain p-2" referrerPolicy="no-referrer" /> : null}
                    </div>
                    <div>
                      <h3 className="text-[22px] font-black tracking-[-0.04em] text-[#1f6dad]">{summaryItem.productName}</h3>
                      <p className="mt-2 text-base italic text-[#5d95bc]">{summaryItem.variantName}</p>
                      <p className="mt-3 text-[22px] font-black text-[#1f6dad]">{formatCurrency(summaryItem.price * summaryItem.quantity)}</p>
                    </div>
                  </div>
                  <div className="my-7 border-t border-[#7eb7db]"></div>
                </>
              )}

              <div className="space-y-4 text-lg">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-black uppercase tracking-[0.08em] text-[#5c95bd]">Subtotal</span>
                  <span className="font-black text-[#1f6dad]">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-black uppercase tracking-[0.08em] text-[#5c95bd]">Shipping</span>
                  <span className="font-black text-[#1f6dad]">{formatCurrency(shippingCost)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-black uppercase tracking-[0.08em] text-[#5c95bd]">
                    {appliedExemption ? 'Tax (Exempt)' : 'Tax (Est.)'}
                  </span>
                  <span className="font-black text-[#1f6dad]">{formatCurrency(tax)}</span>
                </div>
              </div>

              <div className="mt-6 rounded-[14px] border border-[#bcdcef] bg-white/60 p-4">
                <span className="mb-2 block text-[12px] font-black uppercase tracking-[0.08em] text-[#5c95bd]">
                  Tax Exemption Code
                </span>
                {appliedExemption ? (
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[13px] font-bold text-[#1f6dad]">
                      <span className="rounded bg-[#d8effb] px-2 py-1 font-black uppercase tracking-[0.04em]">{appliedExemption.code}</span>
                      {appliedExemption.holder ? <span className="ml-2 text-[#5c95bd]">{appliedExemption.holder}</span> : null}
                    </div>
                    <button
                      type="button"
                      onClick={onRemoveExemption}
                      className="text-[12px] font-black uppercase tracking-[0.06em] text-[#1f6dad] hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={taxExemptionInput}
                        onChange={(e) => onTaxExemptionInputChange(e.target.value)}
                        placeholder="Enter certificate code"
                        className="w-full rounded-[10px] border border-[#bcdcef] bg-white px-3 py-2 text-[14px] font-semibold text-[#1f6dad] outline-none focus:border-[#7eb7db]"
                      />
                      <button
                        type="button"
                        onClick={onApplyExemption}
                        disabled={isValidatingExemption || !taxExemptionInput.trim()}
                        className="shrink-0 rounded-[10px] bg-[linear-gradient(90deg,#0f66a6_0%,#2c73aa_100%)] px-4 py-2 text-[13px] font-black uppercase tracking-[0.06em] text-white transition-opacity disabled:opacity-50"
                      >
                        {isValidatingExemption ? '...' : 'Apply'}
                      </button>
                    </div>
                    {exemptionError ? (
                      <p className="mt-2 text-[12px] font-bold text-red-600">{exemptionError}</p>
                    ) : null}
                  </>
                )}
              </div>

              <div className="my-7 border-t border-[#7eb7db]"></div>

              <div className="flex items-end justify-between gap-4">
                <span className="text-[14px] font-black uppercase tracking-[0.08em] text-[#5c95bd]">Grand Total</span>
                <span className="text-[56px] font-black tracking-[-0.06em] text-[#1f6dad]">{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="rounded-[18px] bg-[linear-gradient(90deg,#6eaed4_0%,#78b5da_100%)] p-7 text-white shadow-[0_16px_30px_rgba(107,154,187,0.18)]">
              <div className="flex items-center gap-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-white">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <div className="text-xl font-black">Encrypted Transaction</div>
                  <div className="mt-1 text-sm text-white/85">Havtel Secure Gate v2.4 Active</div>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[22px] min-h-[250px] bg-[#c9e2f0] shadow-[0_16px_30px_rgba(107,154,187,0.16)]">
              <img
                src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80"
                alt="Hardware ecosystem"
                className="absolute inset-0 h-full w-full object-cover opacity-80"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(95,149,188,0.12),rgba(15,65,101,0.45))]"></div>
              <div className="absolute bottom-6 left-6 text-sm font-black uppercase tracking-[0.18em] text-white">
                Hardware Ecosystem
              </div>
            </div>
          </aside>
        </div>
      </main>

      <footer className="bg-[#1a3f6f] px-8 py-10 text-sm uppercase tracking-[0.16em] text-white/65 md:px-16">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>© 2026 HAVTEL CORP. All Rights Reserved</div>
          <div className="flex flex-wrap gap-6">
            <button
              type="button"
              onClick={() => navigateToPath('/privacy-policy')}
              className="transition-colors hover:text-white"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => navigateToPath('/terms-of-use')}
              className="transition-colors hover:text-white"
            >
              Terms of Use
            </button>
            <span>Help Center</span>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}


function StripePaymentForm({ total, onPaymentSuccess }: { total: number; onPaymentSuccess: () => Promise<void> }) {
  const checkoutState = useCheckout();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (checkoutState.type !== 'success') return;

    setIsSubmitting(true);
    setStripeError(null);

    try {
      const result = await checkoutState.checkout.confirm();

      if (result.type === 'error') {
        setStripeError(result.error.message ?? 'Payment failed. Please try again.');
        setIsSubmitting(false);
        return;
      }

      await onPaymentSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unexpected payment error';
      setStripeError(message);
      // Surface the raw error in the console so the integration can be diagnosed.
      // eslint-disable-next-line no-console
      console.error('[stripe confirm] threw:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (checkoutState.type === 'loading') {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1f6dad] border-t-transparent" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-[18px] border border-[#c8dff0] bg-white p-6 shadow-[0_8px_24px_rgba(107,154,187,0.10)]">
        <p className="mb-5 text-[13px] font-black uppercase tracking-[0.08em] text-[#5c95bd]">Card Details</p>
        <PaymentElement options={{ layout: 'tabs' }} />
      </div>

      {stripeError && (
        <div className="rounded-[14px] border border-red-300 bg-red-50 px-5 py-4 text-[15px] text-red-700">
          {stripeError}
        </div>
      )}

      <button
        type="submit"
        disabled={checkoutState.type !== 'success' || isSubmitting}
        className="w-full rounded-[16px] bg-[linear-gradient(90deg,#0f5ca0_0%,#1d6ea9_100%)] px-8 py-5 text-[20px] font-black uppercase tracking-[0.06em] text-white shadow-[0_16px_30px_rgba(13,77,138,0.24)] transition-all hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {isSubmitting ? 'Processing…' : `Pay ${formatCurrency(total)}`}
      </button>

      <p className="text-center text-[12px] font-black uppercase tracking-[0.06em] text-[#5d95bc]">
        By clicking, you agree to Havtel's Terms of Service and Privacy Policy.
      </p>

      <div className="rounded-[14px] bg-[linear-gradient(90deg,#bfdcf0_0%,#d1e7f5_100%)] p-5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-white text-[#1f6dad] shadow-[0_10px_20px_rgba(107,154,187,0.12)]">
            <ShieldCheck size={16} />
          </div>
          <p className="text-[15px] leading-relaxed text-white">
            Secure checkout with AES-256 encryption. Your payment information is never stored on our servers.
          </p>
        </div>
      </div>
    </form>
  );
}

function PaymentView({
  cartItems,
  checkoutShippingAddress,
  shippingMethod,
  deliveryType,
  onClose,
  onGoHome,
  onBackToShipping,
  onBackToCart,
  onPaymentSuccess,
  taxRate = 0.07,
  appliedExemption,
}: {
  cartItems: CartItem[];
  checkoutShippingAddress: CheckoutShippingAddress | null;
  shippingMethod: 'priority' | 'express';
  deliveryType: 'home_delivery' | 'warehouse_pickup';
  onClose: () => void;
  onGoHome: () => void;
  onBackToShipping: () => void;
  onBackToCart: () => void;
  onPaymentSuccess: () => Promise<void>;
  taxRate?: number;
  appliedExemption?: { code: string; holder: string | null } | null;
  key?: string;
}) {
  const isWarehousePickup = deliveryType === 'warehouse_pickup';
  const shippingCost = isWarehousePickup ? 0 : (shippingMethod === 'priority' ? 12 : 35);
  const shippingLabel = isWarehousePickup ? 'WAREHOUSE PICKUP (FREE)' : (shippingMethod === 'priority' ? 'STANDARD EXPRESS (2-3 BUSINESS DAYS)' : 'QUANTUM EXPRESS (NEXT DAY)');
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * taxRate;
  const total = subtotal + shippingCost + tax;
  const shippingName = [checkoutShippingAddress?.firstName, checkoutShippingAddress?.lastName].filter(Boolean).join(' ').trim();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[linear-gradient(90deg,#ffffff_0%,#fbf7f4_72%,#fff6df_100%)] text-[#1a3f6f]"
    >
      <CheckoutHeader
        activeStep="payment"
        onGoHome={onGoHome}
        onClose={onClose}
        onBackToCart={onBackToCart}
        onBackToShipping={onBackToShipping}
      />

      <main className="mx-auto max-w-[1600px] px-8 py-14 md:px-16">
        <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_520px]">
          <section>
            <div className="mb-10 max-w-4xl">
              <h1 className="text-5xl font-black uppercase tracking-[-0.08em] text-[#1f6dad] md:text-[82px] md:leading-[0.95]">Payment</h1>
              <p className="mt-4 max-w-4xl text-[22px] italic leading-relaxed text-[#5d95bc]">
                Review your order and complete your purchase securely with Stripe.
              </p>
            </div>

            <div className="mb-6 flex items-center justify-between gap-4">
              <span className="text-[13px] font-black uppercase tracking-[0.08em] text-[#5c95bd]">Items in Shipment</span>
              <button type="button" onClick={onBackToCart} className="text-[13px] font-black uppercase tracking-[0.08em] text-[#1f6dad] hover:underline">Edit Cart</button>
            </div>

            <div className="space-y-5">
              {cartItems.map((item) => {
                return (
                  <div key={item.variantId} className="rounded-[22px] bg-[linear-gradient(90deg,#0f66a6_0%,#2c73aa_100%)] p-6 text-white shadow-[0_16px_34px_rgba(62,117,162,0.22)]">
                    <div className="flex flex-col gap-5 md:flex-row">
                      <div className="h-32 w-32 shrink-0 overflow-hidden rounded-[14px] bg-[linear-gradient(180deg,#8ec4e3_0%,#7db8dd_100%)]">
                        {item.img ? (
                          <img src={item.img} alt={item.productName} className="h-full w-full object-contain p-3" referrerPolicy="no-referrer" />
                        ) : null}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col gap-3 md:flex-row md:justify-between">
                          <div>
                            <h2 className="text-[32px] font-black tracking-[-0.04em] text-white">{item.productName}</h2>
                            <p className="mt-1 text-[18px] italic text-white/80">{item.variantName}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-[32px] font-black tracking-[-0.04em] text-white">{formatCurrency(item.price * item.quantity)}</div>
                            <div className="mt-1 text-[16px] italic text-white/80">Qty:{item.quantity}</div>
                          </div>
                        </div>
                        <div className="mt-5 flex flex-wrap gap-2">
                          <span className="rounded-[10px] bg-white/18 px-4 py-2 text-[12px] font-black text-white">In Stock</span>
                          <span className="rounded-[10px] bg-white/18 px-4 py-2 text-[12px] font-black text-white">
                            {shippingMethod === 'priority' ? 'Expedited Shipping' : 'Ships Next Day'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-[18px] bg-[linear-gradient(90deg,#bfdcf0_0%,#d1e7f5_100%)] p-7 shadow-[0_16px_30px_rgba(107,154,187,0.12)]">
                <div className="mb-6 flex items-center justify-between">
                  <span className="text-[13px] font-black uppercase tracking-[0.08em] text-[#5c95bd]">Shipping Address</span>
                  <button type="button" onClick={onBackToShipping} className="text-[13px] font-black text-[#1f6dad] hover:underline">Edit</button>
                </div>
                <div className="space-y-1">
                  <p className="text-[22px] font-black text-white">{shippingName || 'Shipping contact not set'}</p>
                  <p className="text-[18px] text-white/90">{checkoutShippingAddress?.street || 'Street address not set'}</p>
                  <p className="text-[18px] text-white/90">
                    {[checkoutShippingAddress?.city, checkoutShippingAddress?.state, checkoutShippingAddress?.postalCode].filter(Boolean).join(', ') || 'City / region not set'}
                  </p>
                  <p className="text-[18px] text-white/90">{checkoutShippingAddress?.country || 'Country not set'}</p>
                </div>
                <div className="mt-6 border-t border-[#7eb7db] pt-5">
                  <div className="inline-flex items-center gap-3 text-[14px] font-black uppercase tracking-[0.08em] text-[#1f6dad]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-white text-[#1f6dad] shadow-[0_10px_20px_rgba(107,154,187,0.12)]">
                      <Truck size={18} />
                    </div>
                    {shippingLabel}
                  </div>
                </div>
              </div>

            </div>
          </section>

          <aside className="h-fit rounded-[22px] border-[5px] border-[#7eb7db] bg-[rgba(255,250,241,0.92)] p-7 shadow-[0_16px_34px_rgba(107,154,187,0.16)]">
            <h2 className="mb-8 text-[32px] font-black tracking-[-0.06em] text-[#1f6dad] md:text-[56px]">Order Summary</h2>
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between"><span className="text-[14px] font-black uppercase tracking-[0.08em] text-[#5c95bd]">Subtotal</span><span className="font-black text-[#1f6dad]">{formatCurrency(subtotal)}</span></div>
              <div className="flex items-center justify-between"><span className="text-[14px] font-black uppercase tracking-[0.08em] text-[#5c95bd]">Shipping</span><span className="font-black text-[#1f6dad]">{formatCurrency(shippingCost)}</span></div>
              <div className="flex items-center justify-between"><span className="text-[14px] font-black uppercase tracking-[0.08em] text-[#5c95bd]">{appliedExemption ? 'Tax (Exempt)' : 'Estimated Tax'}</span><span className="font-black text-[#1f6dad]">{formatCurrency(tax)}</span></div>
            </div>
            <div className="my-6 border-t border-[#7eb7db]"></div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-[20px] font-black uppercase tracking-[0.06em] text-[#5c95bd]">Total</span>
              <span className="text-[44px] font-black tracking-[-0.08em] leading-none text-[#1f6dad] md:text-[64px]">{formatCurrency(total)}</span>
            </div>
            <div className="mt-8">
              <StripePaymentForm total={total} onPaymentSuccess={onPaymentSuccess} />
            </div>
          </aside>
        </div>
      </main>

      <footer className="bg-[#1a3f6f] px-8 py-10 md:px-16">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-white/50">© 2026 HAVTEL CORP. All Rights Reserved</div>
          <div className="flex flex-wrap gap-6 text-xs font-bold uppercase tracking-[0.16em] text-white/50">
            <button
              type="button"
              onClick={() => navigateToPath('/privacy-policy')}
              className="transition-colors hover:text-white"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => navigateToPath('/terms-of-use')}
              className="transition-colors hover:text-white"
            >
              Terms of Use
            </button>
            <span>Help Center</span>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}

function OrderConfirmedView({
  cartItems,
  order,
  checkoutShippingAddress,
  shippingMethod,
  onClose,
  onGoHome,
  onTrackOrder,
  onContinueShopping,
}: {
  cartItems: CartItem[];
  order: Order | null;
  checkoutShippingAddress: CheckoutShippingAddress | null;
  shippingMethod: 'priority' | 'express';
  onClose: () => void;
  onGoHome: () => void;
  onTrackOrder: () => void;
  onContinueShopping: () => void;
  key?: string;
}) {
  const shippingCost = Number(order?.shipping_amount ?? (shippingMethod === 'priority' ? 12 : 35));
  const subtotal = Number(order?.subtotal_amount ?? 0);
  const tax = Number(order?.tax_amount ?? subtotal * 0.08);
  const total = Number(order?.total_amount ?? subtotal + shippingCost + tax);
  const shippingName = order?.shipping_address.contact_name
    ?? [checkoutShippingAddress?.firstName, checkoutShippingAddress?.lastName].filter(Boolean).join(' ').trim();
  const orderItems = order?.items ?? [];
  const orderShippingMethod = order?.shipping_method ?? shippingMethod;
  // While the order is still `confirmed`, the payment webhook has not yet
  // reached the backend — show "awaiting confirmation" copy instead of the
  // success message. Once the webhook moves the order to `processing` (or any
  // later state) we switch to the regular confirmation view.
  const isAwaitingPaymentConfirmation = order?.status === 'confirmed';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[linear-gradient(90deg,#ffffff_0%,#fbf7f4_72%,#fff6df_100%)] text-[#1a3f6f]"
    >
      <CheckoutHeader
        activeStep="payment"
        onGoHome={onGoHome}
        onClose={onClose}
      />

      <main className="mx-auto max-w-[1600px] px-8 py-14 md:px-16">
        <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_520px]">
          <section className="pt-8">
            <div className="mb-10 flex h-28 w-28 items-center justify-center rounded-full bg-[#deeef7] shadow-[0_0_40px_rgba(31,109,173,0.15)]">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(90deg,#0f5ca0_0%,#1d6ea9_100%)] text-white shadow-[0_8px_20px_rgba(13,77,138,0.3)]">
                {isAwaitingPaymentConfirmation ? <LoaderCircle size={32} className="animate-spin" /> : <Check size={32} />}
              </div>
            </div>

            <span className="mb-4 block text-[12px] font-black uppercase tracking-[0.14em] text-[#5c95bd]">
              {isAwaitingPaymentConfirmation ? 'Order Placed' : 'Purchase Complete'}
            </span>
            <h1 className="text-5xl font-black uppercase tracking-[-0.08em] text-[#1f6dad] md:text-7xl md:leading-none">
              {isAwaitingPaymentConfirmation ? 'Awaiting confirmation.' : 'Order Confirmed.'}
            </h1>
            <p className="mt-6 max-w-3xl text-[20px] italic leading-relaxed text-[#5d95bc]">
              {isAwaitingPaymentConfirmation
                ? "Your order is registered and we're waiting for the payment processor to confirm it. You'll receive a receipt by email once the payment is verified — usually within a few seconds."
                : "Your high-performance setup is now in the queue. We've sent a detailed receipt to your registered email address."}
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <button
                type="button"
                onClick={onTrackOrder}
                className="inline-flex items-center justify-center gap-3 rounded-[14px] bg-[linear-gradient(90deg,#0f5ca0_0%,#1d6ea9_100%)] px-10 py-5 text-lg font-black text-white shadow-[0_14px_30px_rgba(13,77,138,0.22)] transition-transform hover:scale-[1.01]"
              >
                Track Order
              </button>
              <button
                type="button"
                onClick={onContinueShopping}
                className="inline-flex items-center justify-center rounded-[14px] border-2 border-[#7eb7db] px-10 py-5 text-lg font-black text-[#1f6dad] transition-colors hover:bg-[#deeef7]"
              >
                Continue Shopping
              </button>
            </div>

            <div className="mt-16">
              <span className="block text-[12px] font-black uppercase tracking-[0.14em] text-[#5c95bd] mb-6">Estimated Arrival</span>
              <div className="rounded-[22px] border border-[#d6e4ec] bg-white p-7 shadow-[0_16px_34px_rgba(107,154,187,0.12)]">
                <div className="flex items-center gap-6">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[14px] bg-[linear-gradient(180deg,#8ec4e3_0%,#7db8dd_100%)] text-white">
                    <Truck size={34} />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-[#1f6dad]">
                      {orderShippingMethod === 'priority' ? 'Priority delivery window confirmed' : 'Express delivery window confirmed'}
                    </div>
                    <div className="mt-2 text-lg italic text-[#5d95bc]">
                      {orderShippingMethod === 'priority' ? 'Standard High-Priority Logistics' : 'Quantum Express Priority Lane'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="h-fit rounded-[22px] border-[5px] border-[#7eb7db] bg-[rgba(255,250,241,0.92)] p-8 shadow-[0_16px_34px_rgba(107,154,187,0.16)] xl:sticky xl:top-10">
            <div className="mb-8 flex items-center justify-between gap-4">
              <h2 className="text-[28px] font-black tracking-[-0.06em] text-[#1f6dad] md:text-[38px]">Order Summary</h2>
              <span className="rounded-full bg-[#e8f4fc] px-3 py-1.5 text-[11px] font-black text-[#1f6dad]">{order?.order_number ?? 'Pending'}</span>
            </div>

            <div className="space-y-5">
              {orderItems.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-[14px] bg-[linear-gradient(180deg,#8ec4e3_0%,#7db8dd_100%)]">
                    {item.product_image_url ? (
                      <img src={item.product_image_url} alt={item.product_name} className="h-full w-full object-contain p-2" referrerPolicy="no-referrer" />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-[15px] font-black text-[#1f6dad]">{item.product_name}</h3>
                        <p className="mt-1 text-[13px] italic text-[#5c95bd]">{item.variant_name} × {item.quantity}</p>
                      </div>
                      <span className="shrink-0 text-[15px] font-black text-[#1f6dad]">{formatCurrency(Number(item.unit_price) * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="my-6 border-t border-[#c4dcec]"></div>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4"><span className="text-[14px] font-black uppercase tracking-[0.08em] text-[#5c95bd]">Subtotal</span><span className="text-[15px] font-black text-[#1f6dad]">{formatCurrency(subtotal)}</span></div>
              <div className="flex items-center justify-between gap-4"><span className="text-[14px] font-black uppercase tracking-[0.08em] text-[#5c95bd]">Shipping</span><span className="text-[15px] font-black text-[#1f6dad]">{formatCurrency(shippingCost)}</span></div>
              <div className="flex items-center justify-between gap-4"><span className="text-[14px] font-black uppercase tracking-[0.08em] text-[#5c95bd]">Tax (EST)</span><span className="text-[15px] font-black text-[#1f6dad]">{formatCurrency(tax)}</span></div>
            </div>
            <div className="my-6 border-t border-[#7eb7db]"></div>
            <div className="flex items-end justify-between gap-4">
              <span className="text-[20px] font-black uppercase tracking-[0.06em] text-[#5c95bd]">Total</span>
              <div className="text-right">
                <div className="text-[44px] font-black tracking-[-0.08em] leading-none text-[#1f6dad] md:text-[56px]">{formatCurrency(total)}</div>
                <div className="mt-2 text-[12px] font-black uppercase tracking-[0.08em] text-[#5c95bd]">Including VAT</div>
              </div>
            </div>

            <div className="mt-8 border-t border-[#c4dcec] pt-6">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 shrink-0 text-[#5c95bd]" />
                <div className="text-[14px] leading-relaxed text-[#1a3f6f]">
                  <div className="font-black text-[#1f6dad]">Shipping To</div>
                  <div className="mt-2">{shippingName || 'Shipping contact not set'}</div>
                  <div>{order?.shipping_address.street ?? checkoutShippingAddress?.street ?? 'Street address not set'}</div>
                  <div>{[
                    order?.shipping_address.city ?? checkoutShippingAddress?.city,
                    order?.shipping_address.state ?? checkoutShippingAddress?.state,
                    order?.shipping_address.postal_code ?? checkoutShippingAddress?.postalCode,
                  ].filter(Boolean).join(', ') || 'City / region not set'}</div>
                  <div>{order?.shipping_address.country ?? checkoutShippingAddress?.country ?? 'Country not set'}</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <footer className="bg-[#1a3f6f] px-8 py-10 md:px-16">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-white/50">© 2026 HAVTEL CORP. All Rights Reserved</div>
          <div className="flex flex-wrap gap-6 text-xs font-bold uppercase tracking-[0.16em] text-white/50">
            <button
              type="button"
              onClick={() => navigateToPath('/privacy-policy')}
              className="transition-colors hover:text-white"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => navigateToPath('/terms-of-use')}
              className="transition-colors hover:text-white"
            >
              Terms of Use
            </button>
            <span>Help Center</span>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}

function TrackOrderView({
  authSession,
  cartItems,
  trackedOrderId,
  shippingMethod,
  onClose,
  onGoHome,
  onBackToOrders,
  onContinueShopping,
}: {
  authSession: AuthSession;
  cartItems: CartItem[];
  trackedOrderId: string | null;
  shippingMethod: 'priority' | 'express';
  onClose: () => void;
  onGoHome: () => void;
  onBackToOrders: () => void;
  onContinueShopping: () => void;
  key?: string;
}) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const PIPELINE_STEPS = [
    { key: 'confirmed', label: 'Order Confirmed' },
    { key: 'processing', label: 'Processing' },
    { key: 'in_transit', label: 'In Transit' },
    { key: 'delivered', label: 'Delivered' },
  ] as const;

  useEffect(() => {
    if (!authSession?.access_token || !trackedOrderId) {
      setOrder(null);
      setOrderError(null);
      return;
    }

    let cancelled = false;

    const loadOrder = async () => {
      setIsLoadingOrder(true);
      setOrderError(null);
      try {
        const nextOrder = await getOrderRequest(authSession.access_token, trackedOrderId);
        if (!cancelled) {
          setOrder(nextOrder);
        }
      } catch (error) {
        if (!cancelled) {
          setOrderError(error instanceof ApiError ? error.message : 'Unable to load this order right now.');
        }
      } finally {
        if (!cancelled) {
          setIsLoadingOrder(false);
        }
      }
    };

    void loadOrder();

    return () => {
      cancelled = true;
    };
  }, [authSession?.access_token, trackedOrderId]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[linear-gradient(90deg,#ffffff_0%,#fbf7f4_72%,#fff6df_100%)] text-[#1a3f6f]"
    >
      <CheckoutHeader
        activeStep="tracking"
        mode="tracking"
        onGoHome={onGoHome}
        onClose={onClose}
      />

      <main className="mx-auto max-w-[1600px] px-8 py-14 md:px-16">
        <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_440px]">
          <section>
            <div className="mb-10">
              <span className="mb-4 block text-[12px] font-black uppercase tracking-[0.14em] text-[#5c95bd]">Shipment Tracking</span>
              <h1 className="text-5xl font-black uppercase tracking-[-0.08em] text-[#1f6dad] md:text-[72px] md:leading-none">Track Your Order</h1>
              <p className="mt-5 max-w-3xl text-[20px] italic leading-relaxed text-[#5d95bc]">
                Follow your hardware package in real time and review the latest fulfillment milestones for order {order?.order_number ?? '...'}.
              </p>
            </div>

            <div className="rounded-[22px] border border-[#d6e4ec] bg-white p-7 shadow-[0_16px_34px_rgba(107,154,187,0.12)] md:p-10">
              {isLoadingOrder ? (
                <p className="mb-6 rounded-[14px] border border-[#7eb7db] bg-[#deeef7] px-4 py-3 text-sm font-bold text-[#1f6dad]">
                  Loading your latest tracking details...
                </p>
              ) : null}
              {orderError ? (
                <p className="mb-6 rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{orderError}</p>
              ) : null}

              {/* Status header */}
              <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="text-[12px] font-black uppercase tracking-[0.14em] text-[#5c95bd]">Current Status</div>
                  <div className="mt-2 text-4xl font-black capitalize text-[#1f6dad]">{order?.status?.replaceAll('_', ' ') ?? 'Loading'}</div>
                </div>
                {order?.carrier_tracking_number ? (
                  <div className="text-left md:text-right">
                    <div className="text-[12px] font-black uppercase tracking-[0.08em] text-[#5c95bd]">{order.carrier ?? 'Carrier'}</div>
                    <div className="font-mono text-xl font-bold text-[#1f6dad]">{order.carrier_tracking_number}</div>
                  </div>
                ) : (
                  <div className="text-base font-bold text-[#5c95bd]">{order?.tracking_code ? `Ref: ${order.tracking_code}` : 'Tracking pending'}</div>
                )}
              </div>

              {/* Progress pipeline */}
              <div className="mb-10 flex items-center gap-0">
                {PIPELINE_STEPS.map((step, index) => {
                  const statusOrder = ['confirmed', 'processing', 'in_transit', 'delivered'];
                  const currentIdx = statusOrder.indexOf(order?.status ?? 'confirmed');
                  const stepIdx = statusOrder.indexOf(step.key);
                  const done = stepIdx < currentIdx;
                  const current = stepIdx === currentIdx;
                  return (
                    <div key={step.key} className="flex flex-1 items-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-black transition-colors ${done ? 'bg-[linear-gradient(90deg,#0f5ca0_0%,#1d6ea9_100%)] text-white' : current ? 'bg-[#deeef7] text-[#1f6dad] ring-2 ring-[#7eb7db]' : 'bg-[#f0f5fb] text-[#c4dcec]'}`}>
                          {done ? <Check size={16} /> : <span>{index + 1}</span>}
                        </div>
                        <span className={`text-center text-[10px] font-bold uppercase tracking-wide ${done || current ? 'text-[#1f6dad]' : 'text-[#b0c8dc]'}`}>
                          {step.label}
                        </span>
                      </div>
                      {index < PIPELINE_STEPS.length - 1 && (
                        <div className={`mb-5 h-[2px] flex-1 ${done ? 'bg-[#7eb7db]' : 'bg-[#e8f1f7]'}`} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Activity log */}
              <div>
                <div className="mb-4 text-[11px] font-black uppercase tracking-[0.2em] text-[#5c95bd]">Activity Log</div>
                {(order?.status_history ?? []).length === 0 ? (
                  <p className="text-[15px] text-[#5c95bd]">No activity recorded yet.</p>
                ) : (
                  <div className="space-y-5">
                    {(order?.status_history ?? []).map((entry) => (
                      <div key={entry.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="h-3 w-3 flex-shrink-0 rounded-full bg-[#7eb7db] ring-4 ring-[#deeef7]" />
                          <div className="mt-2 w-[1px] flex-1 bg-[#c4dcec]" />
                        </div>
                        <div className="pb-4">
                          <div className="text-[15px] font-black capitalize text-[#1f6dad]">
                            {entry.new_status.replaceAll('_', ' ')}
                          </div>
                          {entry.note ? (
                            <p className="mt-1 text-sm text-[#5c95bd]">{entry.note}</p>
                          ) : null}
                          <p className="mt-1 text-xs text-[#8cb8d4]">
                            {new Date(entry.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <button
                type="button"
                onClick={onBackToOrders}
                className="inline-flex items-center justify-center rounded-[14px] border-2 border-[#7eb7db] px-8 py-5 text-lg font-black text-[#1f6dad] transition-colors hover:bg-[#deeef7]"
              >
                Back to Orders
              </button>
              <button
                type="button"
                onClick={onContinueShopping}
                className="inline-flex items-center justify-center rounded-[14px] bg-[linear-gradient(90deg,#0f5ca0_0%,#1d6ea9_100%)] px-8 py-5 text-lg font-black text-white shadow-[0_14px_30px_rgba(13,77,138,0.22)] transition-transform hover:scale-[1.01]"
              >
                Continue Shopping
              </button>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="h-fit rounded-[22px] border-[5px] border-[#7eb7db] bg-[rgba(255,250,241,0.92)] p-7 shadow-[0_16px_34px_rgba(107,154,187,0.16)] xl:sticky xl:top-10">
              <div className="mb-6 flex items-center justify-between gap-4">
                <h2 className="text-[24px] font-black tracking-[-0.06em] text-[#1f6dad] md:text-[30px]">Tracking Summary</h2>
                <span className="rounded-full bg-[#e8f4fc] px-3 py-1.5 text-[11px] font-black text-[#1f6dad]">{order?.tracking_code ?? 'Pending'}</span>
              </div>
              <div className="space-y-4">
                {(order?.items ?? []).length > 0 ? (
                  (order?.items ?? []).map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-[10px] bg-[linear-gradient(180deg,#8ec4e3_0%,#7db8dd_100%)]">
                          {item.product_image_url ? (
                            <img src={item.product_image_url} alt={item.product_name} className="h-full w-full object-contain p-1" referrerPolicy="no-referrer" />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-[14px] font-black text-[#1f6dad]">{item.product_name}</div>
                          <div className="text-[12px] text-[#5c95bd]">Qty: {item.quantity}</div>
                        </div>
                      </div>
                      <span className="shrink-0 text-[14px] font-black text-[#1f6dad]">{formatCurrency(Number(item.unit_price) * item.quantity)}</span>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[14px] border border-[#d6e4ec] bg-white px-4 py-4 text-[14px] text-[#5c95bd]">
                    Order items will appear here once details finish loading.
                  </div>
                )}
              </div>
              <div className="my-5 border-t border-[#c4dcec]"></div>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4"><span className="text-[13px] font-black uppercase tracking-[0.08em] text-[#5c95bd]">Subtotal</span><span className="text-[14px] font-black text-[#1f6dad]">{formatCurrency(Number(order?.subtotal_amount ?? 0))}</span></div>
                <div className="flex items-center justify-between gap-4"><span className="text-[13px] font-black uppercase tracking-[0.08em] text-[#5c95bd]">Shipping</span><span className="text-[14px] font-black text-[#1f6dad]">{formatCurrency(Number(order?.shipping_amount ?? 0))}</span></div>
                <div className="flex items-center justify-between gap-4"><span className="text-[13px] font-black uppercase tracking-[0.08em] text-[#5c95bd]">Tax</span><span className="text-[14px] font-black text-[#1f6dad]">{formatCurrency(Number(order?.tax_amount ?? 0))}</span></div>
              </div>
              <div className="my-5 border-t border-[#7eb7db]"></div>
              <div className="flex items-end justify-between gap-4">
                <span className="text-[18px] font-black uppercase tracking-[0.06em] text-[#5c95bd]">Total</span>
                <div className="text-right">
                  <div className="text-[40px] font-black tracking-[-0.08em] leading-none text-[#1f6dad] md:text-[48px]">{formatCurrency(Number(order?.total_amount ?? 0))}</div>
                  <div className="mt-1 text-[11px] font-black uppercase tracking-[0.08em] text-[#5c95bd]">Including VAT</div>
                </div>
              </div>
            </div>

            <div className="rounded-[22px] border border-[#d6e4ec] bg-white p-7 shadow-[0_16px_34px_rgba(107,154,187,0.12)]">
              <div className="mb-4 flex items-center gap-3">
                <MapPin size={18} className="shrink-0 text-[#5c95bd]" />
                <span className="text-[12px] font-black uppercase tracking-[0.14em] text-[#5c95bd]">Destination</span>
              </div>
              <div className="space-y-1 text-[15px] leading-relaxed text-[#1a3f6f]">
                <div className="font-black text-[#1f6dad]">{order?.shipping_address.contact_name ?? 'Shipping contact pending'}</div>
                <div>{order?.shipping_address.street ?? 'Street pending'}</div>
                <div>{[order?.shipping_address.city, order?.shipping_address.state, order?.shipping_address.postal_code].filter(Boolean).join(', ') || 'Location pending'}</div>
                <div>{order?.shipping_address.country ?? 'Country pending'}</div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <footer className="bg-[#1a3f6f] px-8 py-10 md:px-16">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-white/50">© 2026 HAVTEL CORP. All Rights Reserved</div>
          <div className="flex flex-wrap gap-6 text-xs font-bold uppercase tracking-[0.16em] text-white/50">
            <button
              type="button"
              onClick={() => navigateToPath('/privacy-policy')}
              className="transition-colors hover:text-white"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => navigateToPath('/terms-of-use')}
              className="transition-colors hover:text-white"
            >
              Terms of Use
            </button>
            <span>Help Center</span>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}

function ProductDetailView({
  productSlug,
  authToken,
  customerType,
  allProducts,
  onAddToCart,
  onBackToShop,
  onProductSelect,
}: {
  productSlug: string;
  authToken?: string;
  customerType: 'b2c' | 'b2b' | null;
  allProducts: Product[];
  onAddToCart: (slug: string, variantId?: string) => void;
  onBackToShop: () => void;
  onProductSelect: (slug: string) => void;
  key?: string;
}) {
  const [apiProduct, setApiProduct] = useState<ProductDetail | null>(null);
  const [selectedTab, setSelectedTab] = useState<'description' | 'specs' | 'reviews'>('description');
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [productSlug]);

  useEffect(() => {
    if (!productSlug) return;
    setApiProduct(null);
    setSelectedVariantId('');
    setSelectedImage(0);
    getProductRequest(productSlug, authToken)
      .then(setApiProduct)
      .catch(() => {});
  }, [productSlug, authToken]);

  const variantOptions = apiProduct?.variants ?? [];
  const firstVariant =
    variantOptions.find((v) => v.is_active && (v.inventory?.qty_available ?? 0) > 0) ??
    variantOptions.find((v) => v.is_active) ??
    variantOptions[0];

  useEffect(() => {
    if (!selectedVariantId && firstVariant) {
      setSelectedVariantId(firstVariant.id);
    }
  }, [firstVariant, selectedVariantId]);

  const selectedVariant = variantOptions.find((variant) => variant.id === selectedVariantId) ?? firstVariant ?? null;
  const gallerySource = [
    ...(selectedVariant?.images ?? []),
    ...(apiProduct?.images ?? []),
  ];
  const gallery = gallerySource
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((img) => img.url)
    .filter(Boolean)
    .filter((url, index, arr) => arr.indexOf(url) === index);
  const heroImage = gallery[selectedImage] ?? gallery[0] ?? null;
  const priceString = selectedVariant
    ? formatCurrency(parseFloat(selectedVariant.price))
    : 'N/A';
  const productName = apiProduct?.name ?? 'Product';
  const inStock = (selectedVariant?.inventory?.qty_available ?? 0) > 0;
  const selectedVariantLabel = selectedVariant?.name ?? 'Standard Configuration';
  const productDescription = apiProduct?.description ?? null;
  const localProduct = allProducts.find((p) => p.slug === productSlug);
  const categoryLabel = localProduct?.category
    ? localProduct.category.charAt(0) + localProduct.category.slice(1).toLowerCase()
    : null;
  const relatedProducts = allProducts.filter((p) => p.slug !== productSlug).slice(0, 4);

  usePageMeta({
    title: apiProduct?.name ?? '',
    description: productDescription,
    ogImage: heroImage ?? undefined,
  });

  const jsonLd = apiProduct ? JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: apiProduct.name,
    description: productDescription,
    image: heroImage,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: selectedVariant?.price ?? '0',
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  }) : null;

  if (!apiProduct) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-20 min-h-screen flex items-center justify-center bg-[linear-gradient(90deg,#ffffff_0%,#fbf7f4_72%,#fff6df_100%)]">
        <div className="text-[#5d95bc] text-lg">Loading product…</div>
      </motion.div>
    );
  }

  const attrs = apiProduct.attributes as Record<string, unknown> | null | undefined;
  const specifications: [string, string][] =
    Array.isArray(attrs?.technical_specifications)
      ? (attrs.technical_specifications as { label: string; value: string }[]).map((s) => [s.label, s.value])
      : [];
  const longDescription = (attrs?.long_description as string | undefined) || null;
  const descriptionEnabled = Boolean((attrs?.description_enabled as boolean | undefined) ?? true) && Boolean(longDescription ?? productDescription);
  const specsEnabled = (attrs?.specs_enabled as boolean | undefined) ?? true;
  const specPdfUrl = attrs?.spec_pdf_url as string | undefined;
  const specPdfFilename = attrs?.spec_pdf_filename as string | undefined;
  const specPdfEnabled = Boolean(attrs?.spec_pdf_enabled) && Boolean(specPdfUrl);

  const effectiveTab: 'description' | 'specs' =
    selectedTab === 'description' && !descriptionEnabled
      ? (specsEnabled ? 'specs' : 'description')
      : selectedTab === 'specs' && !specsEnabled
        ? 'description'
        : (selectedTab as 'description' | 'specs');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[linear-gradient(90deg,#ffffff_0%,#fbf7f4_72%,#fff6df_100%)] pt-20"
    >
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />}
      <section className="relative overflow-hidden px-6 py-10 md:px-12 xl:px-20 xl:py-14">
        <div className="absolute inset-0">
          <div className="absolute left-[-8%] top-[9%] h-[420px] w-[420px] rounded-full bg-[#e4f3fb] blur-[120px]"></div>
          <div className="absolute right-[1%] top-[6%] h-[520px] w-[520px] rounded-full bg-[#f8f1eb] blur-[140px]"></div>
          <div className="absolute left-[22%] bottom-[18%] h-[320px] w-[320px] rounded-full bg-[#fff3db] blur-[120px]"></div>
        </div>

        <div className="relative z-10 mx-auto max-w-[1720px]">
          <div className="mb-6 flex items-center gap-4">
            {categoryLabel && (
              <span className="inline-flex rounded-full border border-[#d6e4ec] bg-white px-4 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-[#7aa5c2] shadow-[0_8px_18px_rgba(107,154,187,0.12)]">
                {categoryLabel}
              </span>
            )}
            <button type="button" onClick={onBackToShop} className="text-sm font-bold text-[#5d95bc] hover:text-[#1d67a7]">
              Back to Catalog
            </button>
          </div>

          <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,0.96fr)_560px] xl:items-start">
            <div>
              <div className="rounded-[30px] border-[5px] border-[#c4dcec] bg-white p-6 shadow-[0_16px_38px_rgba(107,154,187,0.14)] xl:max-w-[760px]">
                <div className="aspect-[0.98/0.82] overflow-hidden rounded-[22px] bg-white">
                  {heroImage ? (
                    <img src={heroImage} alt={productName} className="h-full w-full object-contain p-6" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-[#7f9db5]">No image available</div>
                  )}
                </div>
              </div>

              {gallery.length > 1 ? (
                <div className="mt-5 flex gap-4 overflow-x-auto pb-2">
                  {gallery.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() => setSelectedImage(index)}
                      className={`h-24 min-w-24 overflow-hidden rounded-[18px] border-[3px] bg-white p-1.5 shadow-[0_10px_24px_rgba(107,154,187,0.12)] transition-all ${
                        selectedImage === index ? 'border-[#7eb7db]' : 'border-[#d6e4ec]'
                      }`}
                    >
                      <img src={image} alt={`${productName} preview ${index + 1}`} className="h-full w-full rounded-[12px] object-contain bg-white" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="xl:pt-7">
              {categoryLabel && (
                <span className="inline-flex rounded-full border border-[#d6e4ec] bg-white px-4 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-[#7aa5c2] shadow-[0_8px_18px_rgba(107,154,187,0.12)]">
                  {categoryLabel}
                </span>
              )}
              <h1 className="mt-4 text-5xl font-black uppercase tracking-[-0.08em] text-[#1f6dad] md:text-[78px] leading-[0.94]">{productName}</h1>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="text-[46px] font-black tracking-[-0.06em] text-[#1f6dad]">{priceString}</span>
                <span className={`text-[14px] font-black uppercase tracking-[0.08em] ${inStock ? 'text-[#3a9a34]' : 'text-[#bb5a42]'}`}>
                  {inStock ? 'In Stock - Limited Edition' : 'Out of Stock'}
                </span>
              </div>
              <div className="mt-2">
                <span className="inline-flex rounded-full border border-[#d6e4ec] bg-[linear-gradient(90deg,#eaf4fb_0%,#f0f8fd_100%)] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#5a8dae]">
                  {customerType === 'b2b' ? 'B2B Price' : 'B2C Price'}
                </span>
              </div>
              <p className="mt-9 max-w-[600px] text-[21px] italic leading-[1.65] text-[#5d95bc]">
                {productDescription}
              </p>

              <div className="mt-10">
                <div className="mb-4 text-[12px] font-black uppercase tracking-[0.1em] text-[#5c95bd]">Select Configuration</div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {variantOptions.map((variant) => (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => {
                        setSelectedVariantId(variant.id);
                        setSelectedImage(0);
                      }}
                      className={`rounded-[16px] border px-5 py-4 text-left shadow-[0_10px_24px_rgba(107,154,187,0.12)] transition-all ${
                        selectedVariant?.id === variant.id
                          ? 'border-[#7eb7db] bg-[linear-gradient(90deg,#70b2db_0%,#7fb8dd_100%)] text-white'
                          : 'border-[#d6e4ec] bg-[linear-gradient(90deg,#bfdcf0_0%,#d4e8f6_100%)] text-[#43779d]'
                      }`}
                    >
                      <div className="text-sm font-black">{variant.name}</div>
                      <div className={`mt-1 text-xs ${selectedVariant?.id === variant.id ? 'text-white/90' : 'text-[#5e88a7]'}`}>
                        {formatCurrency(parseFloat(variant.price))}
                        {(variant.inventory?.qty_available ?? 0) > 0 ? ` • ${variant.inventory?.qty_available} available` : ' • Out of stock'}
                      </div>
                    </button>
                  ))}
                </div>
                {variantOptions.length === 0 && (
                  <div className="rounded-[18px] border border-[#d9c9a4] bg-[#fff7e8] px-5 py-4 text-sm text-[#9a7c3f]">
                    This product does not have any active variants configured yet.
                  </div>
                )}
              </div>

              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  onClick={() => onAddToCart(apiProduct.slug, selectedVariant?.id)}
                  disabled={!selectedVariant || !inStock}
                  className="w-full rounded-[16px] bg-[linear-gradient(90deg,#0f5ca0_0%,#1d6ea9_100%)] px-8 py-5 text-lg font-black text-white shadow-[0_16px_30px_rgba(13,77,138,0.22)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Add to cart
                </button>
                <button type="button" className="w-full rounded-[16px] bg-[linear-gradient(90deg,#b7dcef_0%,#a7d2ea_100%)] px-8 py-5 text-lg font-black text-white shadow-[0_14px_28px_rgba(107,154,187,0.18)]">
                  Pre-order now
                </button>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-4 text-center text-[11px] font-black uppercase tracking-[0.08em] text-[#5c95bd]">
                <div className="rounded-[16px] border border-[#d6e4ec] bg-white px-3 py-4 shadow-[0_10px_24px_rgba(107,154,187,0.12)]">Secure Payment</div>
                <div className="rounded-[16px] border border-[#d6e4ec] bg-white px-3 py-4 shadow-[0_10px_24px_rgba(107,154,187,0.12)]">Warranty</div>
                <div className="rounded-[16px] border border-[#d6e4ec] bg-white px-3 py-4 shadow-[0_10px_24px_rgba(107,154,187,0.12)]">Global Priority</div>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-[20px] bg-[linear-gradient(90deg,#a9cee5_0%,#b8d7ea_100%)] px-4 py-4 shadow-[0_16px_32px_rgba(107,154,187,0.16)] md:px-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 overflow-hidden rounded-[12px] border border-white/60 bg-white p-1 shadow-[0_8px_18px_rgba(107,154,187,0.16)]">
                  {heroImage ? <img src={heroImage} alt={productName} className="h-full w-full object-contain" referrerPolicy="no-referrer" /> : null}
                </div>
                <div>
                  <div className="text-sm font-black text-white">{productName}</div>
                  <div className="text-[11px] uppercase tracking-[0.08em] text-white/90">{selectedVariantLabel}</div>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <div className="text-right">
                  <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/85">Subtotal</div>
                  <div className="text-[34px] font-black tracking-[-0.05em] text-white">{priceString}</div>
                </div>
                <button
                  type="button"
                  onClick={() => onAddToCart(apiProduct.slug, selectedVariant?.id)}
                  disabled={!selectedVariant || !inStock}
                  className="rounded-[14px] bg-[linear-gradient(90deg,#0f5ca0_0%,#1d6ea9_100%)] px-8 py-4 text-base font-black text-white shadow-[0_14px_28px_rgba(13,77,138,0.22)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Add to cart
                </button>
              </div>
            </div>
          </div>

          <div className="mt-14 border-b border-[#b9d4e7]">
            <div className="flex gap-8 overflow-x-auto">
            {([
              ...(descriptionEnabled ? [['description', 'Description']] : []),
              ...(specsEnabled ? [['specs', 'Technical Specifications']] : []),
            ] as [string, string][]).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedTab(id as 'description' | 'specs' | 'reviews')}
                className={`border-b-[3px] px-1 py-4 text-sm font-black ${
                  effectiveTab === id ? 'border-[#76b7db] text-[#1f6dad]' : 'border-transparent text-[#7ca0b8]'
                }`}
              >
                {label}
              </button>
            ))}
            </div>
          </div>

          <div className="mt-10">
            {effectiveTab === 'description' && (
              <p className="max-w-4xl text-[18px] leading-[1.8] text-[#5d95bc] whitespace-pre-wrap">
                {longDescription ?? productDescription}
              </p>
            )}

            {effectiveTab === 'specs' && (
              <>
                <h2 className="text-4xl font-black tracking-[-0.06em] text-[#1f6dad] md:text-[58px]">Technical Specifications</h2>
                <div className="mt-8 flex flex-col gap-y-4">
                  {specifications.map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between gap-6 border-b border-[#b9d4e7] py-4">
                      <span className="text-sm font-black uppercase tracking-[0.08em] text-[#5d95bc]">{label}</span>
                      <span className="text-sm font-black text-[#1f6dad]">{value}</span>
                    </div>
                  ))}
                </div>
                {specPdfEnabled && specPdfUrl && (
                  <div className="mt-8">
                    <a
                      href={specPdfUrl}
                      download={specPdfFilename || 'specifications.pdf'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 rounded-[14px] bg-[linear-gradient(90deg,#0f5ca0_0%,#1d6ea9_100%)] px-7 py-4 text-sm font-black uppercase tracking-[0.14em] text-white shadow-[0_14px_30px_rgba(13,77,138,0.24)] transition-transform hover:scale-[1.01]"
                    >
                      <Download size={18} />
                      Download Specifications
                    </a>
                  </div>
                )}
              </>
            )}
          </div>

          <section className="mt-20">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-4xl font-black tracking-[-0.06em] text-[#1f6dad] md:text-[56px]">Complete Your Build</h2>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {relatedProducts.map((related) => (
                <button
                  key={related.id}
                  type="button"
                  onClick={() => onProductSelect(related.slug)}
                  className="rounded-[18px] border border-[#7eb7db] bg-[linear-gradient(180deg,#ffffff_0%,#ffffff_63%,#71b2db_63%,#75b3db_100%)] p-4 text-left shadow-[0_16px_30px_rgba(107,154,187,0.16)] transition-all hover:-translate-y-1 hover:shadow-[0_20px_36px_rgba(107,154,187,0.2)]"
                >
                  <div className="aspect-[0.92/0.86] overflow-hidden rounded-[12px] border border-[#d6e4ec] bg-white">
                    <img src={related.img} alt={related.name} className="h-full w-full object-contain p-3" referrerPolicy="no-referrer" />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-[22px] font-black tracking-[-0.04em] text-white">{related.name}</h3>
                    <p className="mt-1 text-[12px] font-black uppercase tracking-[0.08em] text-white/85">{related.series}</p>
                  </div>
                  <div className="mt-4 flex items-end justify-between gap-3">
                    <span className="text-[32px] font-black tracking-[-0.05em] text-white">{related.priceString}</span>
                    <span className="rounded-[10px] bg-white/20 px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-white">View</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      </section>
    </motion.div>
  );
}

function NotFoundView({ onGoHome }: { onGoHome: () => void; key?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-20 min-h-screen bg-[#0f141b]"
    >
      <section className="relative overflow-hidden px-8 py-24 md:px-16 md:py-32">
        <div className="absolute inset-0">
          <div className="absolute left-[-10%] top-[10%] h-[420px] w-[420px] rounded-full bg-[#aac7ff]/10 blur-[130px]"></div>
          <div className="absolute right-[-8%] bottom-[10%] h-[360px] w-[360px] rounded-full bg-[#3e90ff]/8 blur-[110px]"></div>
        </div>

        <div className="relative z-10 mx-auto max-w-5xl">
          <span className="mb-6 block text-xs font-bold uppercase tracking-[0.34em] text-[#aac7ff]">Error State</span>
          <div className="text-[7rem] font-black leading-none tracking-tighter text-[#d8e7ff] md:text-[10rem]">404</div>
          <h1 className="mt-6 text-5xl font-black tracking-tighter text-slate-100 md:text-7xl">Page Not Found</h1>
          <p className="mt-8 max-w-3xl text-xl leading-relaxed text-slate-400 md:text-2xl">
            The destination you requested does not exist in the current Havtel interface, or the route has not been configured yet.
          </p>

          <div className="mt-12 flex flex-col gap-4 sm:flex-row">
            <button
              type="button"
              onClick={onGoHome}
              className="rounded-[22px] bg-gradient-to-r from-[#a9c7ff] to-[#4d93f7] px-10 py-6 text-xl font-bold text-[#03192f] shadow-[0_24px_60px_rgba(77,147,247,0.35)]"
            >
              Return Home
            </button>
            <button
              type="button"
              onClick={onGoHome}
              className="rounded-[22px] border border-white/10 px-10 py-6 text-xl font-bold text-[#b9d1ff] transition-colors hover:bg-white/5"
            >
              Return Home
            </button>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              ['Go to Shop', 'Browse the available hardware catalog and continue exploring the storefront.'],
              ['Use Account Center', 'Review saved contacts, personal information, and historical orders.'],
              ['Resume Checkout', 'Jump back into your current cart, shipping, payment, or review flow.'],
            ].map(([title, description]) => (
              <div key={title} className="rounded-[26px] border border-white/5 bg-[#161c24] p-6">
                <h2 className="text-2xl font-bold tracking-tight text-slate-100">{title}</h2>
                <p className="mt-3 text-slate-400 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Shared validation helpers
// ---------------------------------------------------------------------------
const NAME_RE = /^[a-zA-ZÀ-ÿñÑ\s'\-]+$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateName(value: string): string | undefined {
  if (!value.trim()) return 'This field is required.';
  if (value.trim().length < 2) return 'Must be at least 2 characters.';
  if (!NAME_RE.test(value.trim())) return 'Only letters, spaces, hyphens, and apostrophes are allowed.';
}

function validatePhone(value: string, required = false): string | undefined {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 1) return required ? 'Phone is required.' : undefined;
  try {
    if (!isValidPhoneNumber(value)) return 'Enter a valid phone number for the selected country.';
  } catch {
    return 'Enter a valid phone number.';
  }
}

function validateEmail(value: string, required = true): string | undefined {
  if (!value.trim()) return required ? 'Email is required.' : undefined;
  if (!EMAIL_RE.test(value)) return 'Enter a valid email address.';
}

// ---------------------------------------------------------------------------
// PhoneField — country selector + validated phone input
// ---------------------------------------------------------------------------
function flagEmoji(iso2: string): string {
  return String.fromCodePoint(...[...iso2.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

function PhoneField({
  value,
  onChange,
  variant = 'light',
  hasError = false,
  placeholder = 'Phone number',
}: {
  value: string;
  onChange: (phone: string) => void;
  variant?: 'dark' | 'light' | 'cream';
  hasError?: boolean;
  placeholder?: string;
}) {
  const { inputValue, handlePhoneValueChange, inputRef, country, setCountry } = usePhoneInput({
    defaultCountry: 'us',
    value,
    countries: defaultCountries,
    onChange: ({ phone }) => onChange(phone),
  });

  const borderClass = hasError
    ? 'border-red-400'
    : variant === 'dark'
    ? 'border-[#d6e4ec] focus-within:border-white/40'
    : 'border-[#d5e0ec] focus-within:border-[#1a3f6f]/40';

  const bgClass =
    variant === 'dark'
      ? 'bg-[linear-gradient(90deg,#bfdcf0_0%,#d1e7f5_100%)]'
      : variant === 'cream'
      ? 'bg-[#f7f1e8]'
      : 'bg-white';

  const textClass = variant === 'dark' ? 'text-white font-bold text-xl' : 'text-[#1a3f6f]';
  const placeholderClass = variant === 'dark' ? 'placeholder:text-white/70' : 'placeholder:text-[#9aabbe]';
  const dividerClass = variant === 'dark' ? 'bg-white/30' : 'bg-[#d5e0ec]';
  const radiusClass = variant === 'dark' ? 'rounded-[14px]' : 'rounded-xl';
  const paddingClass = variant === 'dark' ? 'px-4 py-5' : 'px-4 py-4';

  return (
    <div className={`flex overflow-hidden ${radiusClass} border ${borderClass} ${bgClass} transition-all shadow-[0_10px_24px_rgba(107,154,187,0.08)] focus-within:shadow-[0_0_0_3px_rgba(26,63,111,0.08)]`}>
      <select
        value={country.iso2}
        onChange={(e) => setCountry(e.target.value)}
        className={`shrink-0 cursor-pointer appearance-none bg-transparent ${paddingClass} ${textClass} outline-none`}
        title="Select country code"
      >
        {defaultCountries.map((c) => {
          const p = parseCountry(c);
          return (
            <option key={p.iso2} value={p.iso2}>
              {flagEmoji(p.iso2)} {p.name}
            </option>
          );
        })}
      </select>
      <div className={`my-3 w-px shrink-0 ${dividerClass}`} />
      <input
        ref={inputRef}
        value={inputValue}
        onChange={handlePhoneValueChange}
        type="tel"
        placeholder={placeholder}
        className={`min-w-0 flex-1 bg-transparent ${paddingClass} ${textClass} ${placeholderClass} outline-none`}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// CountrySelect — validated country picker reusing react-international-phone data
// ---------------------------------------------------------------------------
const PARSED_COUNTRIES = defaultCountries.map((c) => parseCountry(c));

function resolveCountryIso2(value: string): string {
  if (!value) return 'us';
  const v = value.trim().toLowerCase();
  const byIso2 = PARSED_COUNTRIES.find((p) => p.iso2 === v);
  if (byIso2) return byIso2.iso2;
  const byName = PARSED_COUNTRIES.find((p) => p.name.toLowerCase() === v);
  return byName?.iso2 ?? 'us';
}

function CountrySelect({
  value,
  onChange,
  variant = 'light',
  hasError = false,
}: {
  value: string;
  onChange: (countryName: string) => void;
  variant?: 'dark' | 'light' | 'cream';
  hasError?: boolean;
}) {
  const selectedIso2 = resolveCountryIso2(value);

  const handleChange = (iso2: string) => {
    const p = PARSED_COUNTRIES.find((c) => c.iso2 === iso2);
    onChange(p?.name ?? iso2);
  };

  const borderClass = hasError
    ? 'border-red-400'
    : variant === 'dark'
    ? 'border-[#d6e4ec] focus:border-white/40'
    : 'border-[#d5e0ec] focus:border-[#1a3f6f]/40';

  const bgClass =
    variant === 'dark'
      ? 'bg-[linear-gradient(90deg,#bfdcf0_0%,#d1e7f5_100%)]'
      : variant === 'cream'
      ? 'bg-[#f7f1e8]'
      : 'bg-white';

  const textClass = variant === 'dark' ? 'text-white font-bold text-xl' : 'text-[#1a3f6f]';
  const radiusClass = variant === 'dark' ? 'rounded-[14px]' : 'rounded-xl';
  const paddingClass = variant === 'dark' ? 'px-6 py-5' : 'px-5 py-4';

  return (
    <select
      value={selectedIso2}
      onChange={(e) => handleChange(e.target.value)}
      className={`w-full cursor-pointer appearance-none ${radiusClass} border ${borderClass} ${bgClass} ${paddingClass} ${textClass} shadow-[0_10px_24px_rgba(107,154,187,0.08)] outline-none transition-all focus:shadow-[0_0_0_3px_rgba(26,63,111,0.08)]`}
    >
      {PARSED_COUNTRIES.map((p) => (
        <option key={p.iso2} value={p.iso2}>
          {p.name} {flagEmoji(p.iso2)}
        </option>
      ))}
    </select>
  );
}

function AuthLoginView({
  onLogin,
  onGoHome,
  onGoToSignup,
  onGoToForgot,
  errorMessage,
  isSubmitting,
}: {
  onLogin: (payload: { email: string; password: string }) => Promise<void>;
  onGoHome: () => void;
  onGoToSignup: () => void;
  onGoToForgot: () => void;
  errorMessage: string | null;
  isSubmitting: boolean;
  key?: string;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  function validate(): boolean {
    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Enter a valid email address.';
    }
    if (!password) errors.password = 'Password is required.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-[linear-gradient(90deg,#ffffff_0%,#fbf7f4_70%,#fff6df_100%)] pt-20">
      <section className="relative overflow-hidden px-8 py-20 md:px-16 md:py-24">
        <div className="absolute inset-0">
          <div className="absolute left-[-6%] top-[14%] h-[420px] w-[420px] rounded-full bg-[#e4f3fb] blur-[140px]"></div>
          <div className="absolute right-[2%] bottom-[8%] h-[360px] w-[360px] rounded-full bg-[#fff2d8] blur-[120px]"></div>
        </div>
        <div className="relative z-10 mx-auto grid max-w-[1240px] grid-cols-1 gap-12 xl:grid-cols-[0.92fr_580px]">
          <div className="pt-8 md:pt-12">
            <span className="text-[12px] font-black uppercase tracking-[0.18em] text-[#5c95bd]">Account Center</span>
            <h1 className="mt-7 text-6xl font-black uppercase tracking-[-0.08em] text-[#1f6dad] md:text-[86px]">Welcome Back</h1>
            <p className="mt-7 max-w-[720px] text-[24px] italic leading-[1.6] text-[#5d95bc]">
              Sign in to manage your account center, delivery contacts, order history, and saved checkout flow.
            </p>
            <button type="button" onClick={onGoHome} className="mt-14 text-[18px] font-black text-[#1d67a7] hover:text-[#0d4d8a]">
              Return Home
            </button>
          </div>
          <div className="rounded-[16px] bg-[linear-gradient(90deg,#64add9_0%,#73b4db_100%)] p-8 shadow-[0_20px_50px_rgba(95,168,215,0.24)] md:p-12">
            <h2 className="text-[58px] font-black tracking-[-0.06em] text-white">Login</h2>
            <form
              noValidate
              onSubmit={async (event) => {
                event.preventDefault();
                if (!validate()) return;
                await onLogin({ email, password });
              }}
              className="mt-10 space-y-7"
            >
              <label className="block">
                <span className="mb-4 block text-[12px] font-black uppercase tracking-[0.08em] text-white">Email Address</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => { setEmail(event.target.value); if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined })); }}
                  placeholder="name@domain.tech"
                  className={`w-full rounded-[14px] border ${fieldErrors.email ? 'border-red-300' : 'border-[#d6e4ec]'} bg-[linear-gradient(180deg,#fffefb_0%,#fbfbfd_100%)] px-7 py-5 text-[18px] text-[#1f5078] shadow-[0_8px_20px_rgba(22,71,104,0.18)] outline-none placeholder:text-[#5c85a2] focus:border-[#8dbbda]`}
                />
                {fieldErrors.email && <p className="mt-2 text-[13px] font-semibold text-white/90">{fieldErrors.email}</p>}
              </label>
              <label className="block">
                <span className="mb-4 block text-[12px] font-black uppercase tracking-[0.08em] text-white">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => { setPassword(event.target.value); if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined })); }}
                  placeholder="Enter your password"
                  className={`w-full rounded-[14px] border ${fieldErrors.password ? 'border-red-300' : 'border-[#d6e4ec]'} bg-[linear-gradient(180deg,#fffefb_0%,#fbfbfd_100%)] px-7 py-5 text-[18px] text-[#1f5078] shadow-[0_8px_20px_rgba(22,71,104,0.18)] outline-none placeholder:text-[#5c85a2] focus:border-[#8dbbda]`}
                />
                {fieldErrors.password && <p className="mt-2 text-[13px] font-semibold text-white/90">{fieldErrors.password}</p>}
              </label>
              {errorMessage ? (
                <p className="rounded-[12px] border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-white">{errorMessage}</p>
              ) : null}
              <div className="flex items-center justify-between gap-4 text-[16px] font-black text-white">
                <button type="button" onClick={onGoToForgot} className="hover:text-[#eaf6ff]">Forgot password?</button>
                <button type="button" onClick={onGoToSignup} className="hover:text-[#eaf6ff]">Create account</button>
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full rounded-[12px] bg-[linear-gradient(90deg,#0f5ca0_0%,#1d6ea9_100%)] px-8 py-5 text-[18px] font-black text-white shadow-[0_14px_30px_rgba(13,77,138,0.24)] disabled:cursor-not-allowed disabled:opacity-70">
                {isSubmitting ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </motion.div>
  );
}

function AuthSignupView({
  onSignup,
  onGoHome,
  onGoToLogin,
  errorMessage,
  isSubmitting,
}: {
  onSignup: (payload: {
    accountType: 'b2c' | 'b2b';
    firstName: string;
    lastName: string;
    companyName: string;
    email: string;
    password: string;
  }) => Promise<void>;
  onGoHome: () => void;
  onGoToLogin: () => void;
  errorMessage: string | null;
  isSubmitting: boolean;
  key?: string;
}) {
  const [accountType, setAccountType] = useState<'b2c' | 'b2b'>('b2c');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    firstName?: string;
    lastName?: string;
    companyName?: string;
    email?: string;
    password?: string;
  }>({});

  function validate(): boolean {
    const errors: typeof fieldErrors = {};
    if (accountType === 'b2b') {
      if (!companyName.trim()) errors.companyName = 'Company name is required.';
      else if (companyName.trim().length < 2) errors.companyName = 'Must be at least 2 characters.';
    } else {
      errors.firstName = validateName(firstName);
      errors.lastName = validateName(lastName);
    }
    errors.email = validateEmail(email);
    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    }
    const clean = Object.fromEntries(Object.entries(errors).filter(([, v]) => v != null));
    setFieldErrors(clean);
    return Object.keys(clean).length === 0;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-[linear-gradient(90deg,#ffffff_0%,#fbf7f4_70%,#fff6df_100%)] pt-20">
      <section className="relative overflow-hidden px-8 py-20 md:px-16 md:py-24">
        <div className="absolute inset-0">
          <div className="absolute left-[2%] top-[14%] h-[320px] w-[320px] rounded-full bg-[#e4f3fb] blur-[120px]"></div>
          <div className="absolute right-[0%] bottom-[10%] h-[380px] w-[380px] rounded-full bg-[#fff2d8] blur-[120px]"></div>
        </div>
        <div className="relative z-10 mx-auto grid max-w-[1320px] grid-cols-1 gap-12 xl:grid-cols-[0.92fr_620px]">
          <div className="pt-8 md:pt-12">
            <span className="text-[12px] font-black uppercase tracking-[0.18em] text-[#5c95bd]">Identity Setup</span>
            <h1 className="mt-7 text-6xl font-black uppercase tracking-[-0.08em] text-[#1f6dad] md:text-[86px]">Create Account</h1>
            <p className="mt-7 max-w-[760px] text-[24px] italic leading-[1.6] text-[#5d95bc]">
              Join the Havtel ecosystem to save addresses, review orders, track shipments, and streamline future purchases.
            </p>
            <button type="button" onClick={onGoHome} className="mt-14 text-[18px] font-black text-[#1d67a7] hover:text-[#0d4d8a]">
              Return Home
            </button>
          </div>
          <div className="rounded-[16px] bg-[linear-gradient(90deg,#64add9_0%,#73b4db_100%)] p-8 shadow-[0_20px_50px_rgba(95,168,215,0.24)] md:p-12">
            <h2 className="text-[58px] font-black tracking-[-0.06em] text-white">Sign Up</h2>
            <form
              noValidate
              onSubmit={async (event) => {
                event.preventDefault();
                if (!validate()) return;
                await onSignup({ accountType, firstName, lastName, companyName, email, password });
              }}
              className="mt-10 grid grid-cols-1 gap-6"
            >
              <div className="grid grid-cols-1 gap-3 rounded-[16px] bg-white/10 p-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => { setAccountType('b2c'); setFieldErrors({}); }}
                  className={`rounded-[12px] px-5 py-4 text-left transition-all ${
                    accountType === 'b2c'
                      ? 'bg-[linear-gradient(180deg,#f7fbff_0%,#d7ecfa_100%)] text-[#0f5ca0]'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-[12px] ${accountType === 'b2c' ? 'bg-[#0f5ca0]/10' : 'bg-white/20'}`}>
                    <CircleUserRound size={22} />
                  </div>
                  <div className="text-sm font-black uppercase tracking-[0.16em]">Personal</div>
                  <div className={`mt-2 text-sm ${accountType === 'b2c' ? 'text-[#1f5078]' : 'text-white/80'}`}>
                    Create an individual account for personal purchases and saved preferences.
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => { setAccountType('b2b'); setFieldErrors({}); }}
                  className={`rounded-[12px] px-5 py-4 text-left transition-all ${
                    accountType === 'b2b'
                      ? 'bg-[linear-gradient(180deg,#f7fbff_0%,#d7ecfa_100%)] text-[#0f5ca0]'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-[12px] ${accountType === 'b2b' ? 'bg-[#0f5ca0]/10' : 'bg-white/20'}`}>
                    <Building2 size={22} />
                  </div>
                  <div className="text-sm font-black uppercase tracking-[0.16em]">Company</div>
                  <div className={`mt-2 text-sm ${accountType === 'b2b' ? 'text-[#1f5078]' : 'text-white/80'}`}>
                    Create a business account for B2B orders, procurement teams, and corporate checkout flows.
                  </div>
                </button>
              </div>

              {accountType === 'b2b' ? (
                <div>
                  <input
                    value={companyName}
                    onChange={(event) => { setCompanyName(event.target.value); if (fieldErrors.companyName) setFieldErrors((prev) => ({ ...prev, companyName: undefined })); }}
                    placeholder="Company name"
                    className={`w-full rounded-[14px] border ${fieldErrors.companyName ? 'border-red-300' : 'border-[#d6e4ec]'} bg-[linear-gradient(180deg,#fffefb_0%,#fbfbfd_100%)] px-7 py-5 text-[18px] text-[#1f5078] shadow-[0_8px_20px_rgba(22,71,104,0.18)] outline-none placeholder:text-[#5c85a2] focus:border-[#8dbbda]`}
                  />
                  {fieldErrors.companyName && <p className="mt-2 text-[13px] font-semibold text-white/90">{fieldErrors.companyName}</p>}
                </div>
              ) : (
                <>
                  <div>
                    <input value={firstName} onChange={(event) => { setFirstName(event.target.value); if (fieldErrors.firstName) setFieldErrors((prev) => ({ ...prev, firstName: undefined })); }} placeholder="First name" className={`w-full rounded-[14px] border ${fieldErrors.firstName ? 'border-red-300' : 'border-[#d6e4ec]'} bg-[linear-gradient(180deg,#fffefb_0%,#fbfbfd_100%)] px-7 py-5 text-[18px] text-[#1f5078] shadow-[0_8px_20px_rgba(22,71,104,0.18)] outline-none placeholder:text-[#5c85a2] focus:border-[#8dbbda]`} />
                    {fieldErrors.firstName && <p className="mt-2 text-[13px] font-semibold text-white/90">{fieldErrors.firstName}</p>}
                  </div>
                  <div>
                    <input value={lastName} onChange={(event) => { setLastName(event.target.value); if (fieldErrors.lastName) setFieldErrors((prev) => ({ ...prev, lastName: undefined })); }} placeholder="Last name" className={`w-full rounded-[14px] border ${fieldErrors.lastName ? 'border-red-300' : 'border-[#d6e4ec]'} bg-[linear-gradient(180deg,#fffefb_0%,#fbfbfd_100%)] px-7 py-5 text-[18px] text-[#1f5078] shadow-[0_8px_20px_rgba(22,71,104,0.18)] outline-none placeholder:text-[#5c85a2] focus:border-[#8dbbda]`} />
                    {fieldErrors.lastName && <p className="mt-2 text-[13px] font-semibold text-white/90">{fieldErrors.lastName}</p>}
                  </div>
                </>
              )}
              <div>
                <input type="email" value={email} onChange={(event) => { setEmail(event.target.value); if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined })); }} placeholder="Email address" className={`w-full rounded-[14px] border ${fieldErrors.email ? 'border-red-300' : 'border-[#d6e4ec]'} bg-[linear-gradient(180deg,#fffefb_0%,#fbfbfd_100%)] px-7 py-5 text-[18px] text-[#1f5078] shadow-[0_8px_20px_rgba(22,71,104,0.18)] outline-none placeholder:text-[#5c85a2] focus:border-[#8dbbda]`} />
                {fieldErrors.email && <p className="mt-2 text-[13px] font-semibold text-white/90">{fieldErrors.email}</p>}
              </div>
              <div>
                <input type="password" value={password} onChange={(event) => { setPassword(event.target.value); if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined })); }} placeholder="Create password" className={`w-full rounded-[14px] border ${fieldErrors.password ? 'border-red-300' : 'border-[#d6e4ec]'} bg-[linear-gradient(180deg,#fffefb_0%,#fbfbfd_100%)] px-7 py-5 text-[18px] text-[#1f5078] shadow-[0_8px_20px_rgba(22,71,104,0.18)] outline-none placeholder:text-[#5c85a2] focus:border-[#8dbbda]`} />
                {fieldErrors.password && <p className="mt-2 text-[13px] font-semibold text-white/90">{fieldErrors.password}</p>}
              </div>
              {errorMessage ? (
                <p className="rounded-[12px] border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-white">{errorMessage}</p>
              ) : null}
              <button type="submit" disabled={isSubmitting} className="w-full rounded-[12px] bg-[linear-gradient(90deg,#0f5ca0_0%,#1d6ea9_100%)] px-8 py-5 text-[18px] font-black text-white shadow-[0_14px_30px_rgba(13,77,138,0.24)] disabled:cursor-not-allowed disabled:opacity-70">
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </button>
              <button type="button" onClick={onGoToLogin} className="text-[16px] font-black text-white hover:text-[#eaf6ff]">
                Already have an account? Sign in
              </button>
            </form>
          </div>
        </div>
      </section>
    </motion.div>
  );
}

function AuthForgotView({
  onGoHome,
  onGoToLogin,
}: {
  onSubmit?: () => void;
  onGoHome: () => void;
  onGoToLogin: () => void;
  key?: string;
}) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // The success message is intentionally generic and shown for any submission
  // (valid email or not), so we never reveal which addresses are registered.
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await forgotPasswordRequest(email.trim());
      setSubmittedMessage(
        "If an account exists for that address, we've sent password reset instructions. The link expires in 30 minutes.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not request a reset link right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-20 min-h-screen bg-[#0f141b]">
      <section className="relative overflow-hidden px-8 py-20 md:px-16">
        <div className="absolute inset-0">
          <div className="absolute left-[10%] top-[18%] h-[300px] w-[300px] rounded-full bg-[#aac7ff]/10 blur-[120px]"></div>
        </div>
        <div className="relative z-10 mx-auto max-w-3xl rounded-[32px] border border-white/5 bg-[#1b2129] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.3)] md:p-10">
          <h1 className="text-5xl font-black tracking-tighter text-slate-100">Reset Password</h1>
          <p className="mt-5 text-xl leading-relaxed text-slate-400">
            Enter your email address and we'll send recovery instructions to restore access to your Havtel account.
          </p>

          {submittedMessage ? (
            <div className="mt-8 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-6 py-5 text-base text-emerald-200">
              {submittedMessage}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <label className="block">
                <span className="mb-4 block text-sm font-bold uppercase tracking-[0.24em] text-slate-300">Email Address</span>
                <input
                  type="email"
                  required
                  placeholder="name@domain.tech"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-white/5 bg-[#0b1016] px-6 py-5 text-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#aac7ff]/40"
                />
              </label>
              {error && (
                <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-5 py-3 text-sm text-red-200">{error}</div>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-[22px] bg-gradient-to-r from-[#a9c7ff] to-[#4d93f7] px-8 py-5 text-xl font-bold text-[#03192f] shadow-[0_24px_60px_rgba(77,147,247,0.35)] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" onClick={onGoToLogin} className="text-sm font-bold text-[#b9d1ff] hover:text-white">Back to Login</button>
            <button type="button" onClick={onGoHome} className="text-sm font-bold text-slate-400 hover:text-white">Return Home</button>
          </div>
        </div>
      </section>
    </motion.div>
  );
}

function AuthResetView({
  onGoHome,
  onGoToLogin,
  onResetSuccess,
}: {
  onGoHome: () => void;
  onGoToLogin: () => void;
  onResetSuccess: () => void;
  key?: string;
}) {
  // The reset token comes in via the URL the email link points to:
  //   /reset-password?token=<token>
  // We read it once on mount and keep it in component state so the URL can be
  // cleaned up immediately afterwards.
  const initialToken = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return new URLSearchParams(window.location.search).get('token') ?? '';
  }, []);

  const [token] = useState(initialToken);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasToken = token.length > 0;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await resetPasswordRequest(token, password);
      onResetSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reset your password right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-20 min-h-screen bg-[#0f141b]">
      <section className="relative overflow-hidden px-8 py-20 md:px-16">
        <div className="absolute inset-0">
          <div className="absolute left-[10%] top-[18%] h-[300px] w-[300px] rounded-full bg-[#aac7ff]/10 blur-[120px]"></div>
        </div>
        <div className="relative z-10 mx-auto max-w-3xl rounded-[32px] border border-white/5 bg-[#1b2129] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.3)] md:p-10">
          <h1 className="text-5xl font-black tracking-tighter text-slate-100">Choose a new password</h1>
          <p className="mt-5 text-xl leading-relaxed text-slate-400">
            Enter a new password to regain access to your Havtel account. All your active sessions will be signed out for security.
          </p>

          {!hasToken ? (
            <div className="mt-8 rounded-2xl border border-red-400/30 bg-red-500/10 px-6 py-5 text-base text-red-200">
              This reset link is missing its token. Open the most recent email you received and click the button there again.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <label className="block">
                <span className="mb-4 block text-sm font-bold uppercase tracking-[0.24em] text-slate-300">New Password</span>
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-white/5 bg-[#0b1016] px-6 py-5 text-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#aac7ff]/40"
                />
              </label>
              <label className="block">
                <span className="mb-4 block text-sm font-bold uppercase tracking-[0.24em] text-slate-300">Confirm Password</span>
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="Re-enter the same password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full rounded-2xl border border-white/5 bg-[#0b1016] px-6 py-5 text-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#aac7ff]/40"
                />
              </label>
              {error && (
                <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-5 py-3 text-sm text-red-200">{error}</div>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-[22px] bg-gradient-to-r from-[#a9c7ff] to-[#4d93f7] px-8 py-5 text-xl font-bold text-[#03192f] shadow-[0_24px_60px_rgba(77,147,247,0.35)] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Updating…' : 'Update Password'}
              </button>
            </form>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" onClick={onGoToLogin} className="text-sm font-bold text-[#b9d1ff] hover:text-white">Back to Login</button>
            <button type="button" onClick={onGoHome} className="text-sm font-bold text-slate-400 hover:text-white">Return Home</button>
          </div>
        </div>
      </section>
    </motion.div>
  );
}

function Home({ products, onShopClick, onProductSelect }: { products: Product[]; onShopClick: () => void; onProductSelect: (slug: string) => void; key?: string }) {
  const featuredProducts = products.filter((product) => Boolean(product.img));
  const bestSellers = (featuredProducts.length > 0 ? featuredProducts : products).slice(0, 4);
  const categoryCards = Array.from(
    new Map(
      products
        .filter((product) => product.category && product.img)
        .map((product) => [
          product.category,
          {
            key: product.category,
            title: product.category.charAt(0) + product.category.slice(1).toLowerCase(),
            desc: product.description ?? `${product.name} and related infrastructure-ready hardware solutions.`,
            img: product.img,
            slug: product.slug,
          },
        ]),
    ).values(),
  ).slice(0, 4);

  const spotlightProduct =
    bestSellers[0] ??
    featuredProducts[0] ??
    products[0] ??
    null;
  const heroServerImage = '/hero-server.png';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="overflow-hidden bg-[linear-gradient(180deg,#0b4f91_0%,#0f67af_16%,#d8edf6_48%,#f5efe5_67%,#deedf2_100%)] pt-20"
    >
      <section className="relative overflow-hidden px-6 pb-20 pt-10 md:px-12 lg:px-20">
        <div className="absolute inset-0">
          <div className="absolute left-[-18%] top-[-10%] h-[320px] w-[320px] rounded-full bg-white/12 blur-[80px] md:h-[520px] md:w-[520px]"></div>
          <div className="absolute right-[-12%] top-[10%] h-[260px] w-[260px] rounded-full bg-[#8fe2ff]/25 blur-[90px] md:h-[420px] md:w-[420px]"></div>
          <div className="absolute bottom-[-8%] left-[18%] h-[220px] w-[220px] rounded-full bg-[#003a73]/30 blur-[80px] md:h-[360px] md:w-[360px]"></div>
        </div>

        <div className="relative mx-auto grid max-w-[1320px] items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_420px]">
          <div className="max-w-3xl">
            <span className="mb-5 inline-block text-[11px] font-bold uppercase tracking-[0.34em] text-[#d8efff]">
              Future Infrastructure
            </span>
            <h1 className="max-w-4xl text-5xl font-black uppercase leading-[0.92] tracking-[-0.06em] text-white sm:text-6xl md:text-7xl lg:text-[82px]">
              Next-
              <br />
              Generation
              <br />
              Technology
              <br />
              For Modern
              <br />
              Infrastructure
            </h1>
            <p className="mt-7 max-w-xl text-sm leading-7 text-[#d8ecfb] sm:text-base">
              Empowering your digital backbone with enterprise-grade hardware, high-speed connectivity, and modern compute systems designed for resilient operations.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <button
                onClick={onShopClick}
                className="rounded-[18px] border border-white/30 bg-[linear-gradient(180deg,#f7fbff_0%,#d7ecfa_100%)] px-8 py-4 text-sm font-black uppercase tracking-[0.22em] text-[#0d4d8a] shadow-[0_18px_40px_rgba(6,30,58,0.22)] transition-transform hover:scale-[1.01]"
              >
                Explore Products
              </button>
              <button
                onClick={() => spotlightProduct && onProductSelect(spotlightProduct.slug)}
                className="rounded-[18px] border border-white/30 bg-[#0b4b87]/30 px-8 py-4 text-sm font-black uppercase tracking-[0.22em] text-white backdrop-blur-sm transition-colors hover:bg-white/10"
              >
                Discover Solutions
              </button>
            </div>
          </div>

          <div className="hidden justify-self-end lg:block">
            <div className="relative -mr-8 p-2">
              <div className="absolute inset-x-16 top-10 h-14 rounded-full bg-white/12 blur-3xl"></div>
              <div className="absolute right-8 top-[16%] h-[300px] w-[300px] rounded-full bg-[#9ddfff]/18 blur-[110px]"></div>
              <div className="absolute bottom-6 left-[10%] h-[220px] w-[220px] rounded-full bg-[#063c72]/45 blur-[90px]"></div>
              <div className="relative aspect-[0.98/1.05] w-[560px] overflow-hidden">
                <img
                  alt="Havtel server rack"
                  className="h-[112%] w-[112%] object-contain object-bottom drop-shadow-[0_20px_38px_rgba(3,19,40,0.22)]"
                  src={heroServerImage}
                  onError={(event) => {
                    if (spotlightProduct?.img && event.currentTarget.src !== spotlightProduct.img) {
                      event.currentTarget.src = spotlightProduct.img;
                    }
                  }}
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1320px]">
          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-4">
              <div className="h-px w-10 bg-[#2f638d]/40"></div>
              <h2 className="text-3xl font-black tracking-[-0.05em] text-[#183c66] md:text-4xl">Curated Engineering</h2>
              <div className="h-px w-10 bg-[#2f638d]/40"></div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {(categoryCards.length > 0 ? categoryCards : bestSellers).map((card) => (
              <button
                key={card.key ?? card.id}
                type="button"
                onClick={() => onProductSelect(card.slug)}
                className="group rounded-[28px] border border-white/40 bg-[linear-gradient(180deg,#8ec3e8_0%,#9fd2ee_100%)] p-5 text-left shadow-[0_22px_45px_rgba(59,109,151,0.18)] transition-transform hover:-translate-y-1"
              >
                <div className="rounded-[22px] border border-[#d9ebf7] bg-[#f7f0e6] p-4 shadow-inner">
                  <div className="aspect-square overflow-hidden rounded-[16px] bg-white">
                    {card.img ? (
                      <img
                        alt={card.title ?? card.name}
                        className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                        src={card.img}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs font-bold uppercase tracking-[0.2em] text-[#54708c]">
                        No Image
                      </div>
                    )}
                  </div>
                </div>
                <h3 className="mt-4 text-xl font-black tracking-[-0.04em] text-white">{card.title ?? card.name}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#eef8ff]">
                  {card.desc ?? card.description ?? 'Precision-engineered components for modern infrastructure environments.'}
                </p>
                <div className="mt-4 inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em] text-[#123c67]">
                  View More <ArrowRight size={14} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1320px] rounded-[34px] border border-white/35 bg-[linear-gradient(180deg,rgba(247,241,231,0.92)_0%,rgba(237,247,251,0.82)_100%)] p-6 shadow-[0_26px_60px_rgba(46,90,128,0.12)] md:p-8">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl font-black tracking-[-0.05em] text-[#183c66] md:text-4xl">Best Sellers</h2>
              <p className="mt-2 text-sm text-[#4f6780]">A curated lineup of the most requested components in the current catalog.</p>
            </div>
            <button
              onClick={onShopClick}
              className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-[#0d4d8a] transition-colors hover:text-[#062d57]"
            >
              View All Catalog <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {bestSellers.map((prod) => (
              <button
                key={prod.id}
                type="button"
                onClick={() => onProductSelect(prod.slug)}
                className="group rounded-[26px] border border-[#d4e7ef] bg-white/75 p-4 text-left shadow-[0_16px_30px_rgba(110,148,170,0.12)] transition-transform hover:-translate-y-1"
              >
                <div className="rounded-[20px] border border-[#e1eef4] bg-[#f8f2e8] p-4">
                  <div className="aspect-square overflow-hidden rounded-[14px] bg-white">
                    {prod.img ? (
                      <img
                        src={prod.img}
                        alt={prod.name}
                        className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs font-bold uppercase tracking-[0.2em] text-[#54708c]">
                        No Image
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <span className="block text-[10px] font-black uppercase tracking-[0.24em] text-[#6d8397]">
                    {prod.series || 'Havtel'}
                  </span>
                  <h3 className="mt-2 min-h-[56px] text-lg font-black tracking-[-0.04em] text-[#183c66]">{prod.name}</h3>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-black text-[#0d4d8a]">{prod.priceString}</span>
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-[12px] border border-[#bdd8e7] bg-[#0b4f91] text-white shadow-[0_12px_24px_rgba(13,77,138,0.2)]">
                      <ShoppingCart size={15} />
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {spotlightProduct && (
      <section className="px-6 py-16 md:px-12 lg:px-20">
        <div className="mx-auto grid max-w-[1320px] gap-8 rounded-[38px] border border-white/40 bg-[linear-gradient(135deg,rgba(250,246,238,0.96)_0%,rgba(233,246,251,0.92)_100%)] p-7 shadow-[0_28px_70px_rgba(53,97,133,0.14)] md:grid-cols-[minmax(0,1fr)_360px] md:p-10">
          <div className="max-w-xl">
            <span className="inline-flex rounded-full border border-[#d7e8f2] bg-white/65 px-4 py-1 text-[10px] font-black uppercase tracking-[0.3em] text-[#8e7c57]">
              {spotlightProduct.series || 'Featured Product'}
            </span>
            <h2 className="mt-6 text-4xl font-black tracking-[-0.06em] text-[#2b5f95] md:text-6xl">
              {spotlightProduct.name}
            </h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-[#56728c]">
              {spotlightProduct.description?.trim()
                || `Discover ${spotlightProduct.name} — engineered for the demands of modern infrastructure.`}
            </p>
            <button
              onClick={() => onProductSelect(spotlightProduct.slug)}
              className="mt-8 rounded-[18px] bg-[linear-gradient(180deg,#0f5ca0_0%,#0a477e_100%)] px-7 py-4 text-sm font-black uppercase tracking-[0.22em] text-white shadow-[0_18px_35px_rgba(11,79,145,0.24)] transition-transform hover:scale-[1.01]"
            >
              Explore Now
            </button>
          </div>

          <div className="flex items-center justify-center rounded-[30px] border border-[#d8e8f0] bg-[linear-gradient(180deg,#f7f0e6_0%,#edf6fb_100%)] p-6">
            <div className="w-full rounded-[24px] border border-white/80 bg-white/80 p-5 shadow-inner">
              <div className="aspect-square overflow-hidden rounded-[18px] bg-[radial-gradient(circle_at_top,#e4f6ff_0%,#c7e3f2_26%,#f7f0e6_100%)]">
                {spotlightProduct?.img ? (
                  <img
                    src={spotlightProduct.img}
                    alt={spotlightProduct.name}
                    className="h-full w-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs font-bold uppercase tracking-[0.2em] text-[#54708c]">
                    Featured Product
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      <section className="px-6 py-16 md:px-12 lg:px-20">
        <div className="mx-auto max-w-[1320px]">
          <div className="text-center">
            <span className="text-[10px] font-black uppercase tracking-[0.34em] text-[#65839e]">
              Trusted Manufacturers
            </span>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-6 text-sm font-black uppercase tracking-[0.22em] text-[#4f6780] sm:text-base">
            {['NVIDIA', 'INTEL', 'AMD', 'ASUS', 'CORSAIR'].map((brand) => (
              <span key={brand} className="opacity-80">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
}

const ICON_MAP: Record<string, LucideIcon> = {
  Cpu,
  Monitor,
  Database,
  HardDrive,
  MousePointer2,
  Wifi,
  Server,
  Smartphone,
  Headphones,
  Zap,
  Shield,
  Globe,
  Package,
  Layers,
  CircuitBoard,
};

function PreorderView({
  reservations,
  onCancelReservation,
  onRestoreToCart,
  onGoToShop,
}: {
  reservations: Reservation[];
  onCancelReservation: (id: string) => void;
  onRestoreToCart: (id: string) => void;
  onGoToShop: () => void;
  key?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[linear-gradient(90deg,#ffffff_0%,#fbf7f4_72%,#fff6df_100%)] text-[#1a3f6f]"
    >
      <main className="mx-auto max-w-[1200px] px-8 py-28 md:px-16">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <span className="mb-4 block text-[12px] font-black uppercase tracking-[0.14em] text-[#5c95bd]">Your Reservations</span>
            <h1 className="text-5xl font-black uppercase tracking-[-0.08em] text-[#1f6dad] md:text-[84px] md:leading-[0.95]">Pre-Order</h1>
          </div>
          {reservations.length > 0 && (
            <div className="text-[14px] font-black uppercase tracking-[0.08em] text-[#5c95bd]">
              {reservations.length} item{reservations.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {reservations.length === 0 ? (
          <div className="rounded-[22px] border border-[#d6e4ec] bg-white p-12 text-center shadow-[0_16px_34px_rgba(107,154,187,0.12)]">
            <Bookmark size={48} className="mx-auto mb-6 text-[#5c95bd]" />
            <h2 className="mb-3 text-3xl font-black tracking-[-0.04em] text-[#1f6dad]">No pre-orders yet</h2>
            <p className="mb-8 text-[#5d95bc]">Save products from the store to reserve them for later.</p>
            <button
              type="button"
              onClick={onGoToShop}
              className="inline-flex items-center gap-3 rounded-[14px] bg-[linear-gradient(90deg,#0f5ca0_0%,#1d6ea9_100%)] px-8 py-5 text-lg font-black text-white shadow-[0_14px_30px_rgba(13,77,138,0.22)]"
            >
              Browse the Store
              <ArrowRight size={20} />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((r) => {
              const expiresAt = new Date(r.expires_at);
              const expLabel = expiresAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
              return (
                <div
                  key={r.id}
                  className="flex flex-col gap-4 rounded-[18px] border border-amber-200 bg-amber-50/60 p-5 md:flex-row md:items-center"
                >
                  <div className="flex-1">
                    <p className="text-[17px] font-black tracking-[-0.03em] text-[#1f6dad]">{r.variant.product?.name ?? r.variant.name}</p>
                    <p className="mt-0.5 text-[14px] italic text-[#5c95bd]">{r.variant.name}</p>
                    <p className="mt-1 text-[12px] font-mono text-[#5c95bd]">{r.variant.sku}</p>
                    <p className="mt-2 text-[12px] font-bold text-amber-700">
                      Reserved until {expLabel} · {r.quantity} unit{r.quantity !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[16px] font-black text-[#1f6dad]">{formatCurrency(parseFloat(r.subtotal))}</span>
                    <button
                      type="button"
                      onClick={() => onRestoreToCart(r.id)}
                      className="inline-flex items-center gap-2 rounded-[12px] bg-[linear-gradient(90deg,#0f5ca0_0%,#1d6ea9_100%)] px-4 py-2.5 text-[13px] font-black uppercase tracking-[0.05em] text-white shadow-md transition hover:brightness-110"
                    >
                      <ShoppingCart size={13} />
                      Move to Cart
                    </button>
                    <button
                      type="button"
                      onClick={() => onCancelReservation(r.id)}
                      className="inline-flex items-center gap-2 text-[13px] font-black uppercase tracking-[0.05em] text-[#5c95bd] transition hover:text-red-500"
                    >
                      <Trash2 size={13} />
                      Cancel
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </motion.div>
  );
}

function collectDescendantIds(categoryId: string, cats: import('./lib/api').Category[]): Set<string> {
  const ids = new Set<string>();
  const collect = (list: import('./lib/api').Category[]): boolean => {
    for (const c of list) {
      if (c.id === categoryId) {
        const subtree = (node: import('./lib/api').Category) => { ids.add(node.id); node.children.forEach(subtree); };
        subtree(c);
        return true;
      }
      if (c.children.length && collect(c.children)) return true;
    }
    return false;
  };
  collect(cats);
  return ids;
}

function findCategoryById(categoryId: string, cats: import('./lib/api').Category[]): import('./lib/api').Category | null {
  for (const c of cats) {
    if (c.id === categoryId) return c;
    if (c.children.length) {
      const found = findCategoryById(categoryId, c.children);
      if (found) return found;
    }
  }
  return null;
}

function Shop({ products, categories, isLoading, onAddToCart, onProductSelect, onSaveProduct }: { products: Product[]; categories: Category[]; isLoading: boolean; onAddToCart: (slug: string, variantId?: string, quantity?: number) => void; onProductSelect: (slug: string) => void; onSaveProduct: (productSlug: string, quantity?: number) => Promise<void>; key?: string }) {
  const [activeCategory, setActiveCategory] = useState('');
  const [expandedParentId, setExpandedParentId] = useState('');
  const [expandedChildId, setExpandedChildId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Popularity');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [priceFilter, setPriceFilter] = useState<[number, number] | null>(null);
  const PRODUCTS_PER_PAGE = 9;

  const priceBounds = useMemo<[number, number] | null>(() => {
    const prices = products.map((p) => p.price).filter((p) => p > 0);
    if (prices.length === 0) return null;
    return [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))];
  }, [products]);

  const activeCategoryIds = activeCategory ? collectDescendantIds(activeCategory, categories) : null;
  const activeCategoryNode = activeCategory ? findCategoryById(activeCategory, categories) : null;

  const filteredProducts = products.filter(prod => {
    const matchesCategory = !activeCategoryIds || activeCategoryIds.has(prod.categoryId);
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         prod.series.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = !priceFilter || (prod.price >= priceFilter[0] && prod.price <= priceFilter[1]);
    return matchesCategory && matchesSearch && matchesPrice;
  }).sort((a, b) => {
    if (sortBy === 'Price: Low to High') return a.price - b.price;
    if (sortBy === 'Price: High to Low') return b.price - a.price;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const pagedProducts = filteredProducts.slice((safePage - 1) * PRODUCTS_PER_PAGE, safePage * PRODUCTS_PER_PAGE);

  const displayCategory = activeCategoryNode?.name ?? 'All Products';
  const categoryDescription = activeCategoryNode
    ? `Browse our selection of next-generation ${activeCategoryNode.name.toLowerCase()}, engineered for extreme performance.`
    : 'Browse our full catalog of next-generation hardware, engineered for extreme performance.';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-white px-4 pb-16 pt-20 md:px-8 lg:px-12"
    >
      <button
        type="button"
        onClick={() => setIsSidebarOpen((open) => !open)}
        className="fixed bottom-28 left-6 z-[60] inline-flex h-14 w-14 items-center justify-center rounded-full border border-[#bdd8e7] bg-white text-[#0d4d8a] shadow-[0_18px_35px_rgba(76,129,163,0.24)] md:hidden"
      >
        <Package size={20} />
      </button>

      <div className="mx-auto flex w-full max-w-[1720px] gap-10 py-6 lg:gap-12">
        <aside className={`fixed inset-y-0 left-0 z-[70] w-[290px] overflow-y-auto border-r border-[#d5e6ef] bg-white p-6 shadow-[0_20px_45px_rgba(76,129,163,0.16)] transition-transform duration-300 md:sticky md:top-24 md:h-fit md:translate-x-0 md:rounded-[20px] md:border md:p-6 md:shadow-[0_18px_40px_rgba(107,154,187,0.12)] ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="mb-10 flex items-center justify-between md:block">
            <div>
              <span className="block text-[11px] font-black uppercase tracking-[0.16em] text-[#76a0bc]">High-Performance Hardware</span>
            </div>
            <button type="button" aria-label="Close filters" onClick={() => setIsSidebarOpen(false)} className="text-[#537089] md:hidden">
              <X size={22} />
            </button>
          </div>

          <div className="mb-10">
            <nav className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  setActiveCategory('');
                  setExpandedParentId('');
                  setExpandedChildId('');
                  setCurrentPage(1);
                  setIsSidebarOpen(false);
                }}
                className={`flex w-full items-center justify-center rounded-[12px] px-5 py-3 text-center text-[14px] font-black uppercase tracking-[-0.02em] transition-all ${
                  activeCategory === ''
                    ? 'bg-[linear-gradient(90deg,#97c7e4_0%,#add9ef_100%)] text-[#1b4f7e] shadow-[0_14px_30px_rgba(95,168,215,0.16)]'
                    : 'text-[#1d67a7] hover:bg-white/50'
                }`}
              >
                All
              </button>
              {categories.filter(c => c.is_active).map((cat) => {
                const isExpanded = expandedParentId === cat.id;
                const activeChildren = cat.children.filter(c => c.is_active);
                return (
                  <div key={cat.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setExpandedParentId(cat.id);
                        setExpandedChildId('');
                        setActiveCategory(cat.id);
                        setCurrentPage(1);
                        setIsSidebarOpen(activeChildren.length === 0);
                      }}
                      className={`flex w-full items-center justify-between rounded-[12px] px-5 py-3 text-[14px] font-black uppercase tracking-[-0.02em] transition-all ${
                        activeCategory === cat.id
                          ? 'bg-[linear-gradient(90deg,#97c7e4_0%,#add9ef_100%)] text-[#1b4f7e] shadow-[0_14px_30px_rgba(95,168,215,0.16)]'
                          : 'text-[#1d67a7] hover:bg-white/50'
                      }`}
                    >
                      <span>{cat.name}</span>
                      {activeChildren.length > 0 && (
                        <ChevronRight
                          size={14}
                          className={`shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                        />
                      )}
                    </button>
                    {isExpanded && activeChildren.length > 0 && (
                      <div className="mt-1 space-y-1 pl-3">
                        {activeChildren.map((child) => {
                          const activeGrandchildren = child.children.filter(c => c.is_active);
                          const isChildExpanded = expandedChildId === child.id;
                          return (
                            <div key={child.id}>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveCategory(child.id);
                                  setCurrentPage(1);
                                  if (activeGrandchildren.length > 0) {
                                    setExpandedChildId(isChildExpanded ? '' : child.id);
                                  } else {
                                    setExpandedChildId('');
                                    setIsSidebarOpen(false);
                                  }
                                }}
                                className={`flex w-full items-center justify-between rounded-[10px] px-4 py-2 text-left text-[12px] font-bold uppercase tracking-[-0.01em] transition-all ${
                                  activeCategory === child.id
                                    ? 'bg-[linear-gradient(90deg,#b8ddf2_0%,#c8e7f5_100%)] text-[#1b4f7e] shadow-[0_8px_20px_rgba(95,168,215,0.14)]'
                                    : 'text-[#4a8ab0] hover:bg-white/50'
                                }`}
                              >
                                <span>{child.name}</span>
                                {activeGrandchildren.length > 0 && (
                                  <ChevronRight
                                    size={12}
                                    className={`shrink-0 transition-transform duration-200 ${isChildExpanded ? 'rotate-90' : ''}`}
                                  />
                                )}
                              </button>
                              {isChildExpanded && activeGrandchildren.length > 0 && (
                                <div className="mt-1 space-y-1 pl-3">
                                  {activeGrandchildren.map((grand) => (
                                    <button
                                      key={grand.id}
                                      type="button"
                                      onClick={() => {
                                        setActiveCategory(grand.id);
                                        setCurrentPage(1);
                                        setIsSidebarOpen(false);
                                      }}
                                      className={`flex w-full items-center rounded-[8px] px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[-0.01em] transition-all ${
                                        activeCategory === grand.id
                                          ? 'bg-[linear-gradient(90deg,#cbe7f7_0%,#d8effb_100%)] text-[#1b4f7e] shadow-[0_6px_16px_rgba(95,168,215,0.12)]'
                                          : 'text-[#5b97bb] hover:bg-white/50'
                                      }`}
                                    >
                                      {grand.name}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
              {isLoading ? <div className="px-2 py-3 text-xs text-[#6d8397]">Loading categories...</div> : null}
            </nav>
          </div>

          {priceBounds && priceBounds[0] < priceBounds[1] && (() => {
            const [boundMin, boundMax] = priceBounds;
            const currentMin = priceFilter?.[0] ?? boundMin;
            const currentMax = priceFilter?.[1] ?? boundMax;
            const range = boundMax - boundMin;
            const pctMin = ((currentMin - boundMin) / range) * 100;
            const pctMax = ((currentMax - boundMin) / range) * 100;
            const isFiltering = priceFilter !== null && (currentMin > boundMin || currentMax < boundMax);
            const thumbClass =
              "pointer-events-none absolute inset-0 h-full w-full appearance-none bg-transparent " +
              "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none " +
              "[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full " +
              "[&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#1d67a7] " +
              "[&::-webkit-slider-thumb]:shadow-[0_4px_10px_rgba(29,103,167,0.3)] [&::-webkit-slider-thumb]:cursor-pointer " +
              "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 " +
              "[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 " +
              "[&::-moz-range-thumb]:border-[#1d67a7] [&::-moz-range-thumb]:cursor-pointer " +
              "[&::-moz-range-track]:bg-transparent";
            return (
              <div className="mb-10">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-[0.16em] text-[#1d67a7]">Price Range</span>
                  {isFiltering && (
                    <button
                      type="button"
                      onClick={() => { setPriceFilter(null); setCurrentPage(1); }}
                      className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#1d67a7] hover:underline"
                    >
                      Reset
                    </button>
                  )}
                </div>

                <div className="mb-3 flex items-center justify-between text-[13px] font-black text-[#1b4f7e]">
                  <span>{formatCurrency(currentMin)}</span>
                  <span className="text-[#76a0bc]">–</span>
                  <span>{formatCurrency(currentMax)}</span>
                </div>

                <div className="relative h-6">
                  <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[#d5e6ef]" />
                  <div
                    className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[linear-gradient(90deg,#97c7e4_0%,#1d67a7_100%)]"
                    style={{ left: `${pctMin}%`, right: `${100 - pctMax}%` }}
                  />
                  <input
                    type="range"
                    min={boundMin}
                    max={boundMax}
                    value={currentMin}
                    onChange={(e) => {
                      const v = Math.min(Number(e.target.value), currentMax - 1);
                      setPriceFilter([v, currentMax]);
                      setCurrentPage(1);
                    }}
                    className={thumbClass}
                    aria-label="Minimum price"
                  />
                  <input
                    type="range"
                    min={boundMin}
                    max={boundMax}
                    value={currentMax}
                    onChange={(e) => {
                      const v = Math.max(Number(e.target.value), currentMin + 1);
                      setPriceFilter([currentMin, v]);
                      setCurrentPage(1);
                    }}
                    className={thumbClass}
                    aria-label="Maximum price"
                  />
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <div className="flex flex-1 items-center rounded-[10px] border border-[#d5e6ef] bg-white px-2 py-1.5">
                    <span className="text-[10px] font-bold text-[#76a0bc]">$</span>
                    <input
                      type="number"
                      min={boundMin}
                      max={boundMax}
                      value={currentMin}
                      onChange={(e) => {
                        const raw = Number(e.target.value);
                        if (!Number.isFinite(raw)) return;
                        const v = Math.max(boundMin, Math.min(raw, currentMax - 1));
                        setPriceFilter([v, currentMax]);
                        setCurrentPage(1);
                      }}
                      className="w-full bg-transparent text-right text-[12px] font-bold text-[#1b4f7e] outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-[#76a0bc]">–</span>
                  <div className="flex flex-1 items-center rounded-[10px] border border-[#d5e6ef] bg-white px-2 py-1.5">
                    <span className="text-[10px] font-bold text-[#76a0bc]">$</span>
                    <input
                      type="number"
                      min={boundMin}
                      max={boundMax}
                      value={currentMax}
                      onChange={(e) => {
                        const raw = Number(e.target.value);
                        if (!Number.isFinite(raw)) return;
                        const v = Math.min(boundMax, Math.max(raw, currentMin + 1));
                        setPriceFilter([currentMin, v]);
                        setCurrentPage(1);
                      }}
                      className="w-full bg-transparent text-right text-[12px] font-bold text-[#1b4f7e] outline-none"
                    />
                  </div>
                </div>
              </div>
            );
          })()}

        </aside>

        {isSidebarOpen ? (
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-[65] bg-[#0d3558]/25 md:hidden"
            aria-label="Close filters"
          />
        ) : null}

        <main className="min-w-0 flex-1 pt-2 md:pl-0">
          <div className="mb-10 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_520px]">
            <div>
              <h1 className="text-5xl font-black uppercase tracking-[-0.07em] text-[#1861a6] md:text-[68px]">
                {displayCategory.toLowerCase()}
              </h1>
              <p className="mt-4 max-w-[620px] text-[16px] italic leading-7 text-[#6e97b1]">
                {categoryDescription}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_150px]">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#81a7c0]" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search components..."
                  className="w-full rounded-[12px] border border-[#bcd7e6] bg-[linear-gradient(90deg,rgba(189,220,239,0.92)_0%,rgba(163,206,233,0.82)_100%)] py-3.5 pl-14 pr-5 text-sm text-[#315c80] shadow-[0_12px_30px_rgba(104,159,195,0.12)] outline-none placeholder:text-white/80 focus:border-[#79acd0]"
                />
              </div>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full appearance-none rounded-[12px] border border-[#bcd7e6] bg-[linear-gradient(90deg,rgba(189,220,239,0.92)_0%,rgba(163,206,233,0.82)_100%)] px-5 py-3.5 pr-10 text-sm font-bold text-white shadow-[0_12px_30px_rgba(104,159,195,0.12)] outline-none focus:border-[#79acd0]"
                >
                  <option>Popularity</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                </select>
                <ChevronRight className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-white/90" size={18} />
              </div>
            </div>
          </div>

          <div className="mb-10 hidden grid-cols-[180px_1fr] gap-4 md:grid">
            <div className="relative">
            </div>
            <div></div>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {pagedProducts.map((prod) => (
                <button
                  key={prod.id}
                  type="button"
                  onClick={() => onProductSelect(prod.slug)}
                  className="group overflow-hidden rounded-[18px] border border-[#d5e3eb] bg-white/88 text-left shadow-[0_10px_28px_rgba(107,154,187,0.15)] transition-transform hover:-translate-y-1"
                >
                  <div className="relative rounded-t-[18px] border-b border-[#d6e7f0] bg-[radial-gradient(circle_at_top_left,#fff8de_0%,#ffffff_30%,#f3fbff_100%)] p-3">
                    {prod.isInStock ? (
                      <span className="absolute right-3 top-3 rounded-full border border-[#d6e7f0] bg-[#f2f9fe] px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.16em] text-[#7aa6c2]">
                        In Stock
                      </span>
                    ) : (
                      <span className="absolute right-3 top-3 rounded-full border border-[#f0d6d6] bg-[#fef2f2] px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.16em] text-[#bb5a42]">
                        Out of Stock
                      </span>
                    )}
                    <div className="aspect-[4/3] overflow-hidden rounded-[12px]">
                      {prod.img ? (
                        <img
                          src={prod.img}
                          alt={prod.name}
                          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center rounded-[12px] border border-dashed border-[#c7ddea] text-xs font-bold uppercase tracking-[0.2em] text-[#7a9ab2]">
                          No Image
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-[linear-gradient(90deg,#64add9_0%,#73b7df_100%)] p-3">
                    <span className="block text-[9px] font-black uppercase tracking-[0.26em] text-white/85">
                      {prod.series || 'Havtel Core'}
                    </span>
                    <h3 className="mt-1 min-h-[40px] text-[15px]/[1.15] font-black tracking-[-0.03em] text-white">
                      {prod.name}
                    </h3>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className="text-[16px] font-black tracking-[-0.04em] text-white">{prod.priceString}</span>
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setQuantities((q) => ({ ...q, [prod.slug]: Math.max(1, (q[prod.slug] ?? 1) - 1) }))}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-[6px] bg-white/20 text-white transition-colors hover:bg-white/30"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-6 text-center text-[13px] font-black text-white">
                          {quantities[prod.slug] ?? 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantities((q) => ({ ...q, [prod.slug]: (q[prod.slug] ?? 1) + 1 }))}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-[6px] bg-white/20 text-white transition-colors hover:bg-white/30"
                        >
                          <Plus size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onAddToCart(prod.slug, undefined, quantities[prod.slug] ?? 1);
                            setQuantities((q) => ({ ...q, [prod.slug]: 1 }));
                          }}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#1c6aa7] text-white shadow-[0_8px_16px_rgba(13,77,138,0.22)] transition-colors hover:bg-[#0d4d8a]"
                          title="Add to cart"
                        >
                          <ShoppingCart size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            void onSaveProduct(prod.slug, quantities[prod.slug] ?? 1);
                          }}
                          disabled={!prod.isInStock}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#0d5c8a] text-white shadow-[0_8px_16px_rgba(13,77,138,0.22)] transition-colors hover:bg-[#094d77] disabled:opacity-40"
                          title="Save for later"
                        >
                          <Bookmark size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-[28px] border border-[#c8dce8] bg-white/70 px-6 py-20 text-center shadow-[0_18px_40px_rgba(107,154,187,0.12)]">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#edf7fc] text-[#6f96b2]">
                <Search size={30} />
              </div>
              <h3 className="text-2xl font-black tracking-[-0.04em] text-[#1b4f7e]">No products found</h3>
              <p className="mt-3 text-sm text-[#678096]">Try adjusting your filters or search query.</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center gap-2 text-[#5d7c93]">
              <button
                type="button"
                aria-label="Previous page"
                disabled={safePage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="p-2 transition-colors hover:text-[#0d4d8a] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setCurrentPage(n)}
                  className={`h-10 w-10 rounded-[10px] text-sm font-black transition-all ${
                    n === safePage
                      ? 'bg-[#5fa8d7] text-white shadow-[0_10px_24px_rgba(95,168,215,0.25)]'
                      : 'bg-white/70 text-[#5d7c93] hover:bg-[#e6f2f9]'
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                aria-label="Next page"
                disabled={safePage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="p-2 transition-colors hover:text-[#0d4d8a] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </main>
      </div>
    </motion.div>
  );
}


function Account({
  authSession,
  onExit,
  onOpenOrders,
  onSessionUpdate,
  callWithRefresh,
}: {
  authSession: AuthSession;
  onExit: () => void;
  onOpenOrders: () => void;
  onSessionUpdate: (session: AuthResponse | null) => void;
  callWithRefresh: <T,>(fn: (token: string) => Promise<T>) => Promise<T>;
  key?: string;
}) {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [personalForm, setPersonalForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
  });
  const [isSavingPersonal, setIsSavingPersonal] = useState(false);
  const [personalError, setPersonalError] = useState<string | null>(null);
  const [personalFieldErrors, setPersonalFieldErrors] = useState<{ firstName?: string; lastName?: string; phone?: string }>({});
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);
  const [deliveryFieldErrors, setDeliveryFieldErrors] = useState<{
    contactName?: string; email?: string; phone?: string; street?: string; city?: string; country?: string;
  }>({});
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [deliveryForm, setDeliveryForm] = useState({
    label: '',
    contactName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    taxId: '',
  });
  const [deliveryContacts, setDeliveryContacts] = useState<UserAddress[]>([]);
  const isCompanyAccount = authSession?.user.customer_type === 'b2b';

  useEffect(() => {
    const user = authSession?.user;
    if (!user) {
      setPersonalForm({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
      });
      return;
    }

    const { firstName, lastName } = splitFullName(user.full_name);
    setPersonalForm({
      firstName,
      lastName,
      phone: user.phone ?? '',
      email: user.email,
    });
  }, [authSession?.user]);

  useEffect(() => {
    if (!authSession?.access_token) {
      setDeliveryContacts([]);
      return;
    }

    let cancelled = false;

    const loadAddresses = async () => {
      setIsLoadingAddresses(true);
      setDeliveryError(null);

      try {
        const addresses = await listUserAddressesRequest(authSession.access_token);
        if (!cancelled) {
          setDeliveryContacts(addresses);
        }
      } catch (error) {
        if (!cancelled) {
          setDeliveryError(error instanceof ApiError ? error.message : 'Unable to load delivery contacts right now.');
        }
      } finally {
        if (!cancelled) {
          setIsLoadingAddresses(false);
        }
      }
    };

    void loadAddresses();

    return () => {
      cancelled = true;
    };
  }, [authSession?.access_token]);

  const accountSections = [
    {
      id: 'personal',
      title: 'Personal Information',
      description: 'Review and update your account identity, saved preferences, and billing basics.',
      icon: CircleUserRound,
    },
    {
      id: 'delivery',
      title: 'Delivery Contacts',
      description: 'Manage shipping recipients, addresses, and preferred drop-off instructions.',
      icon: MapPin,
    },
    {
      id: 'orders',
      title: 'Order History & Details',
      description: 'Track previous purchases, inspect order details, and follow current fulfillment.',
      icon: Package,
    },
  ];

  const resetDeliveryForm = () => {
    setDeliveryForm({
      label: '',
      contactName: '',
      email: '',
      phone: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
      taxId: '',
    });
    setEditingContactId(null);
    setShowDeliveryForm(false);
    setDeliveryError(null);
    setDeliveryFieldErrors({});
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-20 min-h-screen bg-white"
    >
      <section className="px-8 md:px-16 py-16 md:py-20">
        <div className="max-w-4xl mb-12 md:mb-16">
          <span className="text-xs uppercase tracking-[0.35em] text-[#1a3f6f] font-bold mb-4 block">Account Center</span>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight uppercase mb-6 text-[#1a3f6f] leading-none">
            My Account
          </h1>
          <p className="text-base md:text-lg text-[#4a5c72] max-w-2xl leading-relaxed italic">
            Access your profile details, delivery contacts, and full order history from one streamlined control center.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.35fr)_320px] gap-8 xl:gap-12 items-start">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <button
              type="button"
              onClick={() => setSelectedSection('personal')}
              className={`group text-left rounded-2xl border p-6 shadow-[0_2px_16px_rgba(26,63,111,0.18)] transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_24px_rgba(26,63,111,0.25)] md:col-start-1 md:row-start-1 ${
                selectedSection === 'personal'
                  ? 'border-[#1a3f6f] bg-[#1f4d80]'
                  : 'border-[#1a3f6f] bg-[#255a8a] hover:bg-[#1f4d80]'
              }`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-white mb-5">
                <CircleUserRound size={22} />
              </div>
              <h2 className="text-base font-bold tracking-tight text-white mb-2">Personal Information</h2>
              <p className="text-sm text-blue-100/80 leading-relaxed">Review and update your account identity, saved preferences, and billing basics.</p>
            </button>

            {selectedSection === 'personal' && (
              <div className="md:col-span-3 md:col-start-1 md:row-start-2">
                <div className="rounded-2xl border-4 border-[#1a3f6f] bg-white p-6 md:p-8 shadow-[0_2px_12px_rgba(26,63,111,0.08)]">
                <div className="mb-7">
                  <span className="text-[11px] uppercase tracking-[0.28em] text-[#6b7c8d] font-bold block mb-2">Profile Details</span>
                  <h3 className="text-2xl font-bold tracking-tight text-[#1a3f6f] mb-2">
                    {isCompanyAccount ? 'Company Information' : 'Personal Information'}
                  </h3>
                  <p className="text-sm text-[#6b7c8d]">
                    {isCompanyAccount
                      ? 'Your company identity and contact phone are loaded from your business account and saved back to your profile.'
                      : 'Your name and email are loaded from your account session, and phone updates are saved to your profile.'}
                  </p>
                </div>

                <form
                  noValidate
                  onSubmit={async (event) => {
                    event.preventDefault();
                    if (!authSession) {
                      setPersonalError('Your session expired. Please sign in again.');
                      return;
                    }

                    const pErrors: typeof personalFieldErrors = {};
                    if (isCompanyAccount) {
                      if (!personalForm.firstName.trim()) pErrors.firstName = 'Company name is required.';
                      else if (personalForm.firstName.trim().length < 2) pErrors.firstName = 'Must be at least 2 characters.';
                    } else {
                      pErrors.firstName = validateName(personalForm.firstName);
                      pErrors.lastName = validateName(personalForm.lastName);
                    }
                    pErrors.phone = validatePhone(personalForm.phone);
                    const cleanPErrors = Object.fromEntries(Object.entries(pErrors).filter(([, v]) => v != null)) as typeof personalFieldErrors;
                    setPersonalFieldErrors(cleanPErrors);
                    if (Object.keys(cleanPErrors).length > 0) return;

                    setIsSavingPersonal(true);
                    setPersonalError(null);

                    try {
                      const fullName = isCompanyAccount
                        ? personalForm.firstName.trim()
                        : `${personalForm.firstName} ${personalForm.lastName}`.trim();
                      const user = await updateCurrentUserRequest(authSession.access_token, {
                        full_name: fullName,
                        phone: personalForm.phone.trim() || null,
                      });

                      onSessionUpdate({
                        ...authSession,
                        user,
                      });
                      setSelectedSection(null);
                    } catch (error) {
                      setPersonalError(error instanceof ApiError ? error.message : 'Unable to save your profile right now.');
                    } finally {
                      setIsSavingPersonal(false);
                    }
                  }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-5"
                >
                  {isCompanyAccount ? (
                    <div className="block md:col-span-2">
                      <label>
                        <span className="text-[11px] uppercase tracking-[0.28em] text-[#6b7c8d] font-bold block mb-3">Company Name <span className="text-red-500">*</span></span>
                        <input
                          type="text"
                          value={personalForm.firstName}
                          onChange={(event) => { setPersonalForm((prev) => ({ ...prev, firstName: event.target.value })); setPersonalFieldErrors((prev) => ({ ...prev, firstName: undefined })); }}
                          placeholder="Enter your company name"
                          className={`w-full rounded-xl bg-[#f7f1e8] border px-5 py-4 text-[#1a3f6f] placeholder:text-[#9aabbe] focus:outline-none focus:shadow-[0_0_0_3px_rgba(26,63,111,0.08)] transition-all ${personalFieldErrors.firstName ? 'border-red-400 focus:border-red-400' : 'border-[#d5e0ec] focus:border-[#1a3f6f]/40'}`}
                        />
                      </label>
                      {personalFieldErrors.firstName && <p className="mt-1.5 text-xs text-red-500">{personalFieldErrors.firstName}</p>}
                    </div>
                  ) : (
                    <>
                      <div className="block">
                        <label>
                          <span className="text-[11px] uppercase tracking-[0.28em] text-[#6b7c8d] font-bold block mb-3">First Name <span className="text-red-500">*</span></span>
                          <input
                            type="text"
                            value={personalForm.firstName}
                            onChange={(event) => { setPersonalForm((prev) => ({ ...prev, firstName: event.target.value })); setPersonalFieldErrors((prev) => ({ ...prev, firstName: undefined })); }}
                            placeholder="Enter your first name"
                            className={`w-full rounded-xl bg-[#f7f1e8] border px-5 py-4 text-[#1a3f6f] placeholder:text-[#9aabbe] focus:outline-none focus:shadow-[0_0_0_3px_rgba(26,63,111,0.08)] transition-all ${personalFieldErrors.firstName ? 'border-red-400 focus:border-red-400' : 'border-[#d5e0ec] focus:border-[#1a3f6f]/40'}`}
                          />
                        </label>
                        {personalFieldErrors.firstName && <p className="mt-1.5 text-xs text-red-500">{personalFieldErrors.firstName}</p>}
                      </div>

                      <div className="block">
                        <label>
                          <span className="text-[11px] uppercase tracking-[0.28em] text-[#6b7c8d] font-bold block mb-3">Last Name <span className="text-red-500">*</span></span>
                          <input
                            type="text"
                            value={personalForm.lastName}
                            onChange={(event) => { setPersonalForm((prev) => ({ ...prev, lastName: event.target.value })); setPersonalFieldErrors((prev) => ({ ...prev, lastName: undefined })); }}
                            placeholder="Enter your last name"
                            className={`w-full rounded-xl bg-[#f7f1e8] border px-5 py-4 text-[#1a3f6f] placeholder:text-[#9aabbe] focus:outline-none focus:shadow-[0_0_0_3px_rgba(26,63,111,0.08)] transition-all ${personalFieldErrors.lastName ? 'border-red-400 focus:border-red-400' : 'border-[#d5e0ec] focus:border-[#1a3f6f]/40'}`}
                          />
                        </label>
                        {personalFieldErrors.lastName && <p className="mt-1.5 text-xs text-red-500">{personalFieldErrors.lastName}</p>}
                      </div>
                    </>
                  )}

                  <div className="block">
                    <label>
                      <span className="text-[11px] uppercase tracking-[0.28em] text-[#6b7c8d] font-bold block mb-3">Phone</span>
                      <PhoneField
                        value={personalForm.phone}
                        onChange={(phone) => { setPersonalForm((prev) => ({ ...prev, phone })); setPersonalFieldErrors((prev) => ({ ...prev, phone: undefined })); }}
                        variant="cream"
                        hasError={!!personalFieldErrors.phone}
                        placeholder="Phone number"
                      />
                    </label>
                    {personalFieldErrors.phone && <p className="mt-1.5 text-xs text-red-500">{personalFieldErrors.phone}</p>}
                  </div>

                  <label className="block">
                    <span className="text-[11px] uppercase tracking-[0.28em] text-[#6b7c8d] font-bold block mb-3">Email Address</span>
                    <input
                      required
                      type="email"
                      value={personalForm.email}
                      readOnly
                      placeholder="Your account email"
                      className="w-full rounded-xl bg-[#eee8e0] border border-[#d5e0ec] px-5 py-4 text-[#4a5c72] placeholder:text-[#9aabbe] focus:outline-none cursor-not-allowed"
                    />
                  </label>

                  {personalError ? (
                    <p className="md:col-span-2 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-600">
                      {personalError}
                    </p>
                  ) : null}

                  <div className="md:col-span-2 flex flex-col sm:flex-row gap-3 pt-1">
                    <button
                      type="submit"
                      disabled={isSavingPersonal}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1a3f6f] px-7 py-4 text-sm font-bold text-white shadow-[0_4px_14px_rgba(26,63,111,0.25)] transition-all hover:bg-[#15345c] active:scale-[0.99]"
                    >
                      {isSavingPersonal ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedSection(null)}
                      className="inline-flex items-center justify-center rounded-xl border border-[#d5e0ec] bg-white px-7 py-4 text-sm font-bold text-[#1a3f6f] transition-all hover:bg-[#f0f5fb]"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setSelectedSection('delivery')}
              className={`group text-left rounded-2xl border p-6 shadow-[0_2px_16px_rgba(26,63,111,0.18)] transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_24px_rgba(26,63,111,0.25)] md:col-start-2 md:row-start-1 ${
                selectedSection === 'delivery'
                  ? 'border-[#1a3f6f] bg-[#1f4d80]'
                  : 'border-[#1a3f6f] bg-[#255a8a] hover:bg-[#1f4d80]'
              }`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-white mb-5">
                <MapPin size={22} />
              </div>
              <h2 className="text-base font-bold tracking-tight text-white mb-2">Delivery Contacts</h2>
              <p className="text-sm text-blue-100/80 leading-relaxed">Manage shipping recipients, addresses, and preferred drop-off instructions.</p>
            </button>

            {selectedSection === 'delivery' && (
              <div className="md:col-span-3 md:col-start-1 md:row-start-2">
                <div className="rounded-2xl border-4 border-[#1a3f6f] bg-white p-6 md:p-8 shadow-[0_2px_12px_rgba(26,63,111,0.08)]">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-7">
                  <div>
                    <span className="text-[11px] uppercase tracking-[0.28em] text-[#6b7c8d] font-bold block mb-2">Shipping Directory</span>
                    <h3 className="text-2xl font-bold tracking-tight text-[#1a3f6f] mb-2">Delivery Contacts</h3>
                    <p className="text-sm text-[#6b7c8d]">
                      {isCompanyAccount
                        ? 'Manage business recipients, procurement contacts, tax identifiers, and delivery destinations.'
                        : 'Add and manage your saved delivery contacts from this section.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingContactId(null);
                      setDeliveryForm({
                        label: '',
                        contactName: '',
                        email: '',
                        phone: '',
                        street: '',
                        city: '',
                        state: '',
                        zipCode: '',
                        country: 'US',
                        taxId: '',
                      });
                      setShowDeliveryForm(true);
                    }}
                    className="inline-flex items-center justify-center rounded-xl bg-[#1a3f6f] px-6 py-3.5 text-sm font-bold text-white shadow-[0_4px_14px_rgba(26,63,111,0.25)] transition-all hover:bg-[#15345c] shrink-0"
                  >
                    Add contact
                  </button>
                </div>

                {showDeliveryForm && (
                  <form
                    noValidate
                    onSubmit={async (event) => {
                      event.preventDefault();
                      if (!authSession) {
                        setDeliveryError('Your session expired. Please sign in again.');
                        return;
                      }

                      const dErrors: typeof deliveryFieldErrors = {};
                      dErrors.contactName = validateName(deliveryForm.contactName);
                      dErrors.email = validateEmail(deliveryForm.email);
                      dErrors.phone = validatePhone(deliveryForm.phone, true);
                      if (!deliveryForm.street.trim()) dErrors.street = 'Street is required.';
                      if (!deliveryForm.city.trim()) dErrors.city = 'City is required.';
                      if (!deliveryForm.country.trim()) dErrors.country = 'Country is required.';
                      const cleanDErrors = Object.fromEntries(Object.entries(dErrors).filter(([, v]) => v != null)) as typeof deliveryFieldErrors;
                      setDeliveryFieldErrors(cleanDErrors);
                      if (Object.keys(cleanDErrors).length > 0) return;

                      setIsSavingAddress(true);
                      setDeliveryError(null);

                      try {
                        const payload = {
                          label: deliveryForm.label.trim() || null,
                          contact_name: deliveryForm.contactName.trim() || null,
                          contact_email: deliveryForm.email.trim() || null,
                          contact_phone: deliveryForm.phone.trim() || null,
                          street: deliveryForm.street.trim(),
                          city: deliveryForm.city.trim(),
                          state: deliveryForm.state.trim() || null,
                          zip_code: deliveryForm.zipCode.trim() || null,
                          country: deliveryForm.country.trim(),
                          tax_id: deliveryForm.taxId.trim() || null,
                        };

                        if (editingContactId !== null) {
                          const contactId = editingContactId;
                          const updated = await callWithRefresh((token) =>
                            updateUserAddressRequest(token, contactId, payload)
                          );
                          setDeliveryContacts((prev) =>
                            prev.map((contact) => (contact.id === updated.id ? updated : contact))
                          );
                        } else {
                          const created = await callWithRefresh((token) =>
                            createUserAddressRequest(token, payload)
                          );
                          setDeliveryContacts((prev) => {
                            const next = [...prev, created];
                            return next.sort((a, b) => Number(b.is_default) - Number(a.is_default));
                          });
                        }

                        resetDeliveryForm();
                      } catch (error) {
                        if (!(error instanceof ApiError && error.status === 401)) {
                          setDeliveryError(error instanceof ApiError ? error.message : 'Unable to save this delivery contact right now.');
                        }
                      } finally {
                        setIsSavingAddress(false);
                      }
                    }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-5 rounded-2xl border border-[#d5e0ec] bg-[#f7f1e8] p-6 mb-6"
                  >
                    <label className="block">
                      <span className="text-[11px] uppercase tracking-[0.28em] text-[#6b7c8d] font-bold block mb-3">Label</span>
                      <input
                        type="text"
                        value={deliveryForm.label}
                        onChange={(event) => setDeliveryForm((prev) => ({ ...prev, label: event.target.value }))}
                        placeholder={isCompanyAccount ? 'Warehouse, HQ, Branch Office...' : 'Home, Office, Family...'}
                        className="w-full rounded-xl bg-white border border-[#d5e0ec] px-5 py-4 text-[#1a3f6f] placeholder:text-[#9aabbe] focus:outline-none focus:border-[#1a3f6f]/40 focus:shadow-[0_0_0_3px_rgba(26,63,111,0.08)] transition-all"
                      />
                    </label>

                    <div className={isCompanyAccount ? 'block md:col-span-2' : 'block'}>
                      <label>
                        <span className="text-[11px] uppercase tracking-[0.28em] text-[#6b7c8d] font-bold block mb-3">
                          {isCompanyAccount ? 'Contact Person or Team' : 'Recipient Name'} <span className="text-red-500">*</span>
                        </span>
                        <input
                          type="text"
                          value={deliveryForm.contactName}
                          onChange={(event) => { setDeliveryForm((prev) => ({ ...prev, contactName: event.target.value })); setDeliveryFieldErrors((prev) => ({ ...prev, contactName: undefined })); }}
                          placeholder={isCompanyAccount ? 'Procurement team or business contact' : 'Who will receive this order?'}
                          className={`w-full rounded-xl bg-white border px-5 py-4 text-[#1a3f6f] placeholder:text-[#9aabbe] focus:outline-none focus:shadow-[0_0_0_3px_rgba(26,63,111,0.08)] transition-all ${deliveryFieldErrors.contactName ? 'border-red-400 focus:border-red-400' : 'border-[#d5e0ec] focus:border-[#1a3f6f]/40'}`}
                        />
                      </label>
                      {deliveryFieldErrors.contactName && <p className="mt-1.5 text-xs text-red-500">{deliveryFieldErrors.contactName}</p>}
                    </div>

                    <div className="block">
                      <label>
                        <span className="text-[11px] uppercase tracking-[0.28em] text-[#6b7c8d] font-bold block mb-3">Email <span className="text-red-500">*</span></span>
                        <input
                          type="email"
                          value={deliveryForm.email}
                          onChange={(event) => { setDeliveryForm((prev) => ({ ...prev, email: event.target.value })); setDeliveryFieldErrors((prev) => ({ ...prev, email: undefined })); }}
                          placeholder="contact@email.com"
                          className={`w-full rounded-xl bg-white border px-5 py-4 text-[#1a3f6f] placeholder:text-[#9aabbe] focus:outline-none focus:shadow-[0_0_0_3px_rgba(26,63,111,0.08)] transition-all ${deliveryFieldErrors.email ? 'border-red-400 focus:border-red-400' : 'border-[#d5e0ec] focus:border-[#1a3f6f]/40'}`}
                        />
                      </label>
                      {deliveryFieldErrors.email && <p className="mt-1.5 text-xs text-red-500">{deliveryFieldErrors.email}</p>}
                    </div>

                    <div className="block">
                      <label>
                        <span className="text-[11px] uppercase tracking-[0.28em] text-[#6b7c8d] font-bold block mb-3">Phone <span className="text-red-500">*</span></span>
                        <PhoneField
                          value={deliveryForm.phone}
                          onChange={(phone) => { setDeliveryForm((prev) => ({ ...prev, phone })); setDeliveryFieldErrors((prev) => ({ ...prev, phone: undefined })); }}
                          variant="light"
                          hasError={!!deliveryFieldErrors.phone}
                          placeholder="Phone number"
                        />
                      </label>
                      {deliveryFieldErrors.phone && <p className="mt-1.5 text-xs text-red-500">{deliveryFieldErrors.phone}</p>}
                    </div>

                    <div className="block">
                      <label>
                        <span className="text-[11px] uppercase tracking-[0.28em] text-[#6b7c8d] font-bold block mb-3">Street <span className="text-red-500">*</span></span>
                        <input
                          type="text"
                          value={deliveryForm.street}
                          onChange={(event) => { setDeliveryForm((prev) => ({ ...prev, street: event.target.value })); setDeliveryFieldErrors((prev) => ({ ...prev, street: undefined })); }}
                          placeholder="Street and number"
                          className={`w-full rounded-xl bg-white border px-5 py-4 text-[#1a3f6f] placeholder:text-[#9aabbe] focus:outline-none focus:shadow-[0_0_0_3px_rgba(26,63,111,0.08)] transition-all ${deliveryFieldErrors.street ? 'border-red-400 focus:border-red-400' : 'border-[#d5e0ec] focus:border-[#1a3f6f]/40'}`}
                        />
                      </label>
                      {deliveryFieldErrors.street && <p className="mt-1.5 text-xs text-red-500">{deliveryFieldErrors.street}</p>}
                    </div>

                    <div className="block">
                      <label>
                        <span className="text-[11px] uppercase tracking-[0.28em] text-[#6b7c8d] font-bold block mb-3">City <span className="text-red-500">*</span></span>
                        <input
                          type="text"
                          value={deliveryForm.city}
                          onChange={(event) => { setDeliveryForm((prev) => ({ ...prev, city: event.target.value })); setDeliveryFieldErrors((prev) => ({ ...prev, city: undefined })); }}
                          placeholder="City"
                          className={`w-full rounded-xl bg-white border px-5 py-4 text-[#1a3f6f] placeholder:text-[#9aabbe] focus:outline-none focus:shadow-[0_0_0_3px_rgba(26,63,111,0.08)] transition-all ${deliveryFieldErrors.city ? 'border-red-400 focus:border-red-400' : 'border-[#d5e0ec] focus:border-[#1a3f6f]/40'}`}
                        />
                      </label>
                      {deliveryFieldErrors.city && <p className="mt-1.5 text-xs text-red-500">{deliveryFieldErrors.city}</p>}
                    </div>

                    <label className="block md:col-span-2">
                      <span className="text-[11px] uppercase tracking-[0.28em] text-[#6b7c8d] font-bold block mb-3">State / Region</span>
                      <input
                        type="text"
                        value={deliveryForm.state}
                        onChange={(event) => setDeliveryForm((prev) => ({ ...prev, state: event.target.value }))}
                        placeholder="State or region"
                        className="w-full rounded-xl bg-white border border-[#d5e0ec] px-5 py-4 text-[#1a3f6f] placeholder:text-[#9aabbe] focus:outline-none focus:border-[#1a3f6f]/40 focus:shadow-[0_0_0_3px_rgba(26,63,111,0.08)] transition-all"
                      />
                    </label>

                    <label className="block">
                      <span className="text-[11px] uppercase tracking-[0.28em] text-[#6b7c8d] font-bold block mb-3">ZIP / Postal Code</span>
                      <input
                        type="text"
                        value={deliveryForm.zipCode}
                        onChange={(event) => setDeliveryForm((prev) => ({ ...prev, zipCode: event.target.value }))}
                        placeholder="ZIP or postal code"
                        className="w-full rounded-xl bg-white border border-[#d5e0ec] px-5 py-4 text-[#1a3f6f] placeholder:text-[#9aabbe] focus:outline-none focus:border-[#1a3f6f]/40 focus:shadow-[0_0_0_3px_rgba(26,63,111,0.08)] transition-all"
                      />
                    </label>

                    <div className="block">
                      <label>
                        <span className="text-[11px] uppercase tracking-[0.28em] text-[#6b7c8d] font-bold block mb-3">Country <span className="text-red-500">*</span></span>
                        <CountrySelect
                          value={deliveryForm.country}
                          onChange={(country) => { setDeliveryForm((prev) => ({ ...prev, country })); setDeliveryFieldErrors((prev) => ({ ...prev, country: undefined })); }}
                          variant="light"
                          hasError={!!deliveryFieldErrors.country}
                        />
                      </label>
                      {deliveryFieldErrors.country && <p className="mt-1.5 text-xs text-red-500">{deliveryFieldErrors.country}</p>}
                    </div>

                    <label className="block">
                      <span className="text-[11px] uppercase tracking-[0.28em] text-[#6b7c8d] font-bold block mb-3">
                        {isCompanyAccount ? 'Tax ID / Business ID' : 'ID / CI'}
                      </span>
                      <input
                        required
                        type="text"
                        value={deliveryForm.taxId}
                        onChange={(event) => setDeliveryForm((prev) => ({ ...prev, taxId: event.target.value }))}
                        placeholder={isCompanyAccount ? 'Enter company tax ID' : 'Enter CI'}
                        className="w-full rounded-xl bg-white border border-[#d5e0ec] px-5 py-4 text-[#1a3f6f] placeholder:text-[#9aabbe] focus:outline-none focus:border-[#1a3f6f]/40 focus:shadow-[0_0_0_3px_rgba(26,63,111,0.08)] transition-all"
                      />
                    </label>

                    {deliveryError ? (
                      <p className="md:col-span-2 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {deliveryError}
                      </p>
                    ) : null}

                    <div className="md:col-span-2 flex flex-col sm:flex-row gap-3 pt-1">
                      <button
                        type="submit"
                        disabled={isSavingAddress}
                        className="inline-flex items-center justify-center rounded-xl bg-[#1a3f6f] px-7 py-4 text-sm font-bold text-white shadow-[0_4px_14px_rgba(26,63,111,0.25)] transition-all hover:bg-[#15345c] active:scale-[0.99]"
                      >
                        {isSavingAddress ? 'Saving...' : editingContactId !== null ? 'Save Changes' : 'Save Contact'}
                      </button>
                      <button
                        type="button"
                        onClick={resetDeliveryForm}
                        className="inline-flex items-center justify-center rounded-xl border border-[#d5e0ec] bg-white px-7 py-4 text-sm font-bold text-[#1a3f6f] transition-all hover:bg-[#f0f5fb]"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {isLoadingAddresses ? (
                  <div className="rounded-xl border border-[#d5e0ec] bg-[#f0f5fb] p-5 text-sm text-[#4a5c72]">
                    Loading delivery contacts...
                  </div>
                ) : null}

                {!isLoadingAddresses && deliveryContacts.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#c5d5e8] bg-[#f7f1e8] p-6 text-sm text-[#6b7c8d]">
                    No delivery contacts saved yet.
                  </div>
                ) : null}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {deliveryContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="rounded-2xl border border-[#1a3f6f] bg-[#255a8a] p-5"
                    >
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white">
                            <Mail size={16} />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.24em] text-blue-100/70 font-bold mb-1">Email</p>
                            <p className="text-sm text-white break-all">{contact.contact_email ?? 'Not specified'}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white">
                            <Phone size={16} />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.24em] text-blue-100/70 font-bold mb-1">Phone</p>
                            <p className="text-sm text-white">{contact.contact_phone ?? 'Not specified'}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white">
                            <MapPin size={16} />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.24em] text-blue-100/70 font-bold mb-1">Address</p>
                            <p className="text-sm text-white">
                              {[contact.street, contact.city, contact.state, contact.zip_code, contact.country]
                                .filter(Boolean)
                                .join(', ')}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white">
                            <IdCard size={16} />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.24em] text-blue-100/70 font-bold mb-1">
                              {isCompanyAccount ? 'Tax ID' : 'CI'}
                            </p>
                            <p className="text-sm text-white">{contact.tax_id ?? 'Not specified'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-row gap-3 pt-5 mt-5 border-t border-white/20">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingContactId(contact.id);
                            setDeliveryForm({
                              label: contact.label ?? '',
                              contactName: contact.contact_name ?? '',
                              email: contact.contact_email ?? '',
                              phone: contact.contact_phone ?? '',
                              street: contact.street,
                              city: contact.city,
                              state: contact.state ?? '',
                              zipCode: contact.zip_code ?? '',
                              country: contact.country,
                              taxId: contact.tax_id ?? '',
                            });
                            setShowDeliveryForm(true);
                          }}
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/40 bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-white/20"
                        >
                          <Pencil size={14} />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (!authSession) {
                              setDeliveryError('Your session expired. Please sign in again.');
                              return;
                            }

                            const contactId = contact.id;
                            try {
                              await callWithRefresh((token) => deleteUserAddressRequest(token, contactId));
                              setDeliveryContacts((prev) => prev.filter((item) => item.id !== contactId));
                            } catch (error) {
                              if (!(error instanceof ApiError && error.status === 401)) {
                                setDeliveryError(error instanceof ApiError ? error.message : 'Unable to delete this delivery contact right now.');
                              }
                            }
                          }}
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-300/50 bg-red-500/20 px-4 py-2.5 text-sm font-bold text-red-200 transition-all hover:bg-red-500/30"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              </div>
            )}

            <button
              type="button"
              onClick={onOpenOrders}
              className="group text-left rounded-2xl border p-6 shadow-[0_2px_16px_rgba(26,63,111,0.18)] transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_24px_rgba(26,63,111,0.25)] border-[#1a3f6f] bg-[#255a8a] hover:bg-[#1f4d80] md:col-start-3 md:row-start-1"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-white mb-5">
                <Package size={22} />
              </div>
              <h2 className="text-base font-bold tracking-tight text-white mb-2">Order History & Details</h2>
              <p className="text-sm text-blue-100/80 leading-relaxed">Track previous purchases, inspect order details, and follow current fulfillment.</p>
            </button>
          </div>

          <div className="rounded-2xl border-4 border-[#1a3f6f] bg-white p-6 md:p-8 shadow-[0_2px_12px_rgba(26,63,111,0.08)]">
            <div className="w-12 h-12 rounded-xl bg-[#1a3f6f] text-white flex items-center justify-center mb-6">
              <LogOut size={22} />
            </div>
            <h3 className="text-xl font-bold tracking-tight text-[#1a3f6f] mb-3">Exit Account</h3>
            <p className="text-sm text-[#6b7c8d] leading-relaxed mb-6">
              Return to the homepage while keeping the same premium storefront experience.
            </p>
            <button
              type="button"
              onClick={onExit}
              className="inline-flex items-center gap-2 rounded-xl bg-[#1a3f6f] px-6 py-3.5 text-sm font-bold text-white shadow-[0_4px_14px_rgba(26,63,111,0.25)] transition-all hover:bg-[#15345c]"
            >
              Exit to Home
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>
    </motion.div>
  );
}


function OrderHistory({
  authSession,
  onBackToAccount,
  onGoHome,
  onGoToCart,
  onTrackOrder,
  onReorder,
}: {
  authSession: AuthSession;
  onBackToAccount: () => void;
  onGoHome: () => void;
  onGoToCart: () => void;
  onTrackOrder: (orderId: string) => void;
  onReorder: (order: Order) => Promise<{ added: number; skipped: number }>;
  key?: string;
}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [reorderingId, setReorderingId] = useState<string | null>(null);
  const [reorderFeedback, setReorderFeedback] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    if (!authSession?.access_token) {
      setOrders([]);
      setSelectedOrderId(null);
      setOrdersError(null);
      return;
    }
    setIsLoadingOrders(true);
    setOrdersError(null);
    try {
      const nextOrders = await listOrdersRequest(authSession.access_token);
      setOrders(nextOrders);
      setSelectedOrderId((prev) => prev ?? nextOrders[0]?.id ?? null);
    } catch (error) {
      setOrdersError(error instanceof ApiError ? error.message : 'Unable to load your order history right now.');
    } finally {
      setIsLoadingOrders(false);
    }
  }, [authSession?.access_token]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-20 min-h-screen bg-white"
    >
      <section className="px-8 md:px-16 py-16 md:py-20">
        <div className="max-w-5xl mb-10 md:mb-12">
          <span className="text-xs uppercase tracking-[0.35em] text-[#1a3f6f] font-bold mb-4 block">Order Records</span>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight uppercase mb-5 text-[#1a3f6f] leading-none">
            Order History & Details
          </h1>
          <p className="text-base text-[#4a5c72] max-w-3xl leading-relaxed italic">
            Review your previous purchases, payment methods, fulfillment status, and order-level details from one place.
          </p>
        </div>

        <div className="rounded-2xl border-4 border-[#1a3f6f] bg-white p-4 md:p-8 shadow-[0_2px_12px_rgba(26,63,111,0.08)]">
          <div className="mb-4 flex items-center justify-end">
            <button
              type="button"
              disabled={isLoadingOrders}
              onClick={() => void loadOrders()}
              className="inline-flex items-center gap-2 rounded-xl border border-[#1a3f6f]/30 bg-[#f0f5fb] px-4 py-2 text-xs font-bold text-[#1a3f6f] transition-all hover:bg-[#e2ecf7] disabled:opacity-50"
            >
              {isLoadingOrders ? (
                <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : (
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582M20 20v-5h-.581M5.635 19A9 9 0 104.582 9H4" />
                </svg>
              )}
              Refresh
            </button>
          </div>
          {isLoadingOrders ? (
            <p className="mb-5 rounded-xl border border-[#d5e0ec] bg-[#f0f5fb] px-4 py-3 text-sm text-[#4a5c72]">Loading your orders...</p>
          ) : null}
          {ordersError ? (
            <p className="mb-5 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-600">{ordersError}</p>
          ) : null}
          {orders.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead>
                    <tr className="border-b-2 border-[#1a3f6f]/20">
                      <th className="px-4 py-4 text-[11px] uppercase tracking-[0.24em] text-[#6b7c8d] font-bold">Order No</th>
                      <th className="px-4 py-4 text-[11px] uppercase tracking-[0.24em] text-[#6b7c8d] font-bold">Date</th>
                      <th className="px-4 py-4 text-[11px] uppercase tracking-[0.24em] text-[#6b7c8d] font-bold">Total Price</th>
                      <th className="px-4 py-4 text-[11px] uppercase tracking-[0.24em] text-[#6b7c8d] font-bold">Payment Type</th>
                      <th className="px-4 py-4 text-[11px] uppercase tracking-[0.24em] text-[#6b7c8d] font-bold">Status</th>
                      <th className="px-4 py-4 text-[11px] uppercase tracking-[0.24em] text-[#6b7c8d] font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b border-[#1a3f6f]/10 last:border-b-0">
                        <td className="px-4 py-4 text-[#1a3f6f] font-semibold whitespace-nowrap text-sm">{order.order_number}</td>
                        <td className="px-4 py-4 text-[#4a5c72] whitespace-nowrap text-sm">{new Date(order.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</td>
                        <td className="px-4 py-4 text-[#1a3f6f] font-semibold whitespace-nowrap text-sm">{formatCurrency(Number(order.total_amount))}</td>
                        <td className="px-4 py-4 text-[#4a5c72] whitespace-nowrap text-sm">{order.payment_type}</td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex rounded-md border px-3 py-1 text-xs font-bold capitalize ${
                              order.status === 'delivered'
                                ? 'border-emerald-400 text-emerald-600 bg-emerald-50'
                                : order.status === 'cancelled'
                                  ? 'border-red-400 text-red-600 bg-red-50'
                                  : 'border-amber-400 text-amber-600 bg-amber-50'
                            }`}
                          >
                            {order.status.replaceAll('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <button
                            type="button"
                            onClick={() => setSelectedOrderId(order.id)}
                            className="inline-flex items-center gap-2 rounded-lg border border-[#1a3f6f]/30 bg-[#f0f5fb] px-3.5 py-2 text-xs font-bold text-[#1a3f6f] transition-all hover:bg-[#e2ecf7]"
                          >
                            <Eye size={14} />
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 rounded-2xl border border-[#1a3f6f] bg-[#255a8a] p-6 md:p-7">
                {orders
                  .filter((order) => order.id === selectedOrderId)
                  .map((order) => (
                    <div key={order.id}>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                        <div>
                          <span className="text-[11px] uppercase tracking-[0.24em] text-blue-100/70 font-bold block mb-1">Selected Order</span>
                          <h2 className="text-2xl font-bold tracking-tight text-white">{order.order_number}</h2>
                        </div>
                        <span className="text-xs text-blue-100/70">Placed on {new Date(order.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                      </div>
                      <p className="text-sm text-blue-100/80 leading-relaxed mb-5 italic">
                        {order.items.length} item(s) · {order.shipping_method.replaceAll('_', ' ')} · {order.shipping_address.city}, {order.shipping_address.state}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="rounded-xl border border-white/20 bg-[#1f4d80] p-4">
                          <p className="text-[10px] uppercase tracking-[0.24em] text-blue-100/70 font-bold mb-1.5">Payment</p>
                          <p className="text-white font-semibold text-sm">{order.payment_type}</p>
                        </div>
                        <div className="rounded-xl border border-white/20 bg-[#1f4d80] p-4">
                          <p className="text-[10px] uppercase tracking-[0.24em] text-blue-100/70 font-bold mb-1.5">Total</p>
                          <p className="text-white font-semibold text-sm">{formatCurrency(Number(order.total_amount))}</p>
                        </div>
                        <div className="rounded-xl border border-white/20 bg-[#1f4d80] p-4">
                          <p className="text-[10px] uppercase tracking-[0.24em] text-blue-100/70 font-bold mb-1.5">Status</p>
                          <p className="text-white font-semibold text-sm uppercase tracking-wide">{order.status.replaceAll('_', ' ')}</p>
                        </div>
                      </div>
                      {order.items.length > 0 && (
                        <div className="mt-4">
                          <p className="text-[10px] uppercase tracking-[0.24em] text-blue-100/70 font-bold mb-2">Items</p>
                          <div className="space-y-2">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#1f4d80] p-3">
                                {item.product_image_url ? (
                                  <img
                                    src={item.product_image_url}
                                    alt={item.product_name}
                                    className="h-12 w-12 flex-shrink-0 rounded-lg bg-white/10 object-contain p-1"
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-white/10" />
                                )}
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-semibold text-white">{item.product_name}</p>
                                  <p className="truncate text-xs italic text-blue-100/70">{item.variant_name}</p>
                                </div>
                                <div className="flex-shrink-0 text-right">
                                  <p className="text-sm font-bold text-white">{formatCurrency(Number(item.unit_price) * item.quantity)}</p>
                                  {item.quantity > 1 && (
                                    <p className="text-[11px] text-blue-100/60">{formatCurrency(Number(item.unit_price))} × {item.quantity}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        {order.items.some((i) => i.variant_id) ? (
                          <button
                            type="button"
                            disabled={reorderingId === order.id}
                            onClick={async () => {
                              setReorderingId(order.id);
                              setReorderFeedback(null);
                              const { added, skipped } = await onReorder(order);
                              setReorderingId(null);
                              if (added > 0) {
                                setReorderFeedback(`${added} item(s) added to cart.${skipped > 0 ? ` ${skipped} skipped (out of stock).` : ''}`);
                                setTimeout(() => {
                                  setReorderFeedback(null);
                                  onGoToCart();
                                }, 1500);
                              } else {
                                setReorderFeedback('Could not add items — they may be out of stock.');
                                setTimeout(() => setReorderFeedback(null), 3000);
                              }
                            }}
                            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-[#1a3f6f] shadow hover:bg-blue-50 disabled:opacity-60 transition-all"
                          >
                            {reorderingId === order.id ? 'Adding to cart…' : 'Buy Again'}
                          </button>
                        ) : (
                          <span className="text-xs text-blue-100/50 italic">Reorder not available for this order</span>
                        )}
                        {reorderFeedback && selectedOrderId === order.id && (
                          <span className="text-xs font-semibold text-emerald-300">{reorderFeedback}</span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </>
          ) : !isLoadingOrders && !ordersError ? (
            <div className="rounded-xl border border-dashed border-[#1a3f6f]/30 bg-[#f0f5fb] px-6 py-12 text-center">
              <div className="text-xl font-bold text-[#1a3f6f]">No orders yet</div>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-[#6b7c8d]">
                Once you complete your first purchase, your confirmed orders and tracking details will appear here.
              </p>
            </div>
          ) : null}

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onBackToAccount}
              className="inline-flex items-center justify-center rounded-xl border-2 border-[#1a3f6f] bg-white px-7 py-3.5 text-sm font-bold text-[#1a3f6f] transition-all hover:bg-[#f0f5fb]"
            >
              Back to my account
            </button>
            <button
              type="button"
              onClick={onGoHome}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1a3f6f] px-7 py-3.5 text-sm font-bold text-white shadow-[0_4px_14px_rgba(26,63,111,0.25)] transition-all hover:bg-[#15345c]"
            >
              Home
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>
    </motion.div>
  );
}


type LegalSection = {
  id: string;
  number: number;
  title: string;
  body: React.ReactNode;
};

function LegalDocumentLayout({
  eyebrow,
  title,
  intro,
  effectiveDate,
  sections,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  effectiveDate: string;
  sections: LegalSection[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[linear-gradient(90deg,#ffffff_0%,#fbf7f4_70%,#fff6df_100%)] pt-20"
    >
      <section className="relative overflow-hidden px-8 py-16 md:px-16 md:py-20">
        <div className="absolute inset-0">
          <div className="absolute left-[-8%] top-[8%] h-[420px] w-[420px] rounded-full bg-[#e4f3fb] blur-[120px]"></div>
          <div className="absolute right-[2%] top-[4%] h-[520px] w-[520px] rounded-full bg-[#f8f1eb] blur-[140px]"></div>
        </div>

        <div className="relative z-10 mx-auto max-w-[1720px]">
          <div className="mb-12 max-w-[1220px] md:mb-14">
            <span className="mb-6 block text-[12px] font-black uppercase tracking-[0.18em] text-[#5c95bd]">{eyebrow}</span>
            <h1 className="text-5xl font-black uppercase tracking-[-0.08em] text-[#1f6dad] md:text-[72px] lg:text-[82px]">
              {title}
            </h1>
            <p className="mt-6 max-w-[940px] text-[18px] italic leading-[1.7] text-[#5d95bc]">{intro}</p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[12px] font-bold uppercase tracking-[0.14em] text-[#1f5078]/70">
              <span>Effective {effectiveDate}</span>
              <span>Havtel Corp · DBA Nitrotel Manufacturing</span>
              <span>4626 SW 147th Ct, Miami, FL 33185</span>
            </div>
          </div>

          <div className="grid grid-cols-1 items-start gap-10 xl:grid-cols-[280px_minmax(0,1fr)] xl:gap-14">
            <aside className="xl:sticky xl:top-28">
              <div className="rounded-[18px] border border-[#d3e3ec] bg-white/85 p-6 shadow-[0_14px_30px_rgba(107,154,187,0.12)] backdrop-blur">
                <div className="mb-4 text-[11px] font-black uppercase tracking-[0.18em] text-[#5c95bd]">Contents</div>
                <ol className="space-y-2">
                  {sections.map((s) => (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => {
                          const el = document.getElementById(s.id);
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                        className="block w-full rounded-md px-2 py-1.5 text-left text-[13px] font-semibold leading-snug text-[#1f5078]/85 transition-colors hover:bg-[#eaf2f8] hover:text-[#1f6dad]"
                      >
                        <span className="mr-2 text-[#5c95bd]">{s.number}.</span>
                        {s.title}
                      </button>
                    </li>
                  ))}
                </ol>
              </div>
            </aside>

            <article className="rounded-[18px] border border-[#d6e4ec] bg-white/90 p-8 shadow-[0_14px_30px_rgba(107,154,187,0.12)] md:p-12">
              <div className="space-y-12">
                {sections.map((s) => (
                  <section key={s.id} id={s.id} className="scroll-mt-28">
                    <div className="mb-4 flex items-baseline gap-3">
                      <span className="text-[14px] font-black uppercase tracking-[0.14em] text-[#5c95bd]">{String(s.number).padStart(2, '0')}</span>
                      <h2 className="text-[26px] font-black tracking-[-0.04em] text-[#1f6dad] md:text-[30px]">{s.title}</h2>
                    </div>
                    <div className="space-y-4 text-[15.5px] leading-[1.75] text-[#1f5078]/90 [&_strong]:text-[#1f6dad] [&_a]:text-[#1f6dad] [&_a]:underline [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_li]:leading-[1.65]">
                      {s.body}
                    </div>
                  </section>
                ))}
              </div>
            </article>
          </div>
        </div>
      </section>
    </motion.div>
  );
}

function PrivacyPolicy() {
  const sections: LegalSection[] = [
    {
      id: 'who-we-are',
      number: 1,
      title: 'Who We Are',
      body: (
        <p>
          Havtel Corp (&quot;we&quot;, &quot;our&quot;, the &quot;Company&quot;) operates www.nitrotelmanufacturing.com.
          This policy describes what personal data we collect, how we use it, with whom we share it, and the rights
          you have under CCPA/CPRA, VCDPA, CTDPA, CPA, UCPA, FDBR, and other applicable state laws.
        </p>
      ),
    },
    {
      id: 'categories',
      number: 2,
      title: 'Categories of Personal Information Collected',
      body: (
        <>
          <p>In the past twelve (12) months we have collected the following categories under CCPA/CPRA 1798.140(v):</p>
          <ul>
            <li><strong>Identifiers:</strong> name, alias, postal address, IP, email, unique personal identifier, online identifier.</li>
            <li><strong>Customer Records (Cal. Civ. 1798.80(e)):</strong> address, phone, credit card (processed via gateway).</li>
            <li><strong>Commercial information:</strong> products purchased, considered, or returned.</li>
            <li><strong>Internet activity:</strong> browsing history, searches, ad interactions.</li>
            <li><strong>Geolocation</strong> (non-precise unless explicit consent).</li>
            <li><strong>Inferences</strong> drawn to create a customer profile.</li>
            <li><strong>Sensitive information (CPRA):</strong> only if you voluntarily provide it (e.g., account credentials).</li>
          </ul>
        </>
      ),
    },
    {
      id: 'sources',
      number: 3,
      title: 'Sources of Information',
      body: (
        <p>
          We receive information: (a) directly from you (registration, purchase, support); (b) automatically (cookies,
          pixels, logs); (c) from third parties (payment processors, carriers, ad platforms, anti-fraud agencies).
        </p>
      ),
    },
    {
      id: 'purposes',
      number: 4,
      title: 'Purposes of Processing',
      body: (
        <ul>
          <li>Process orders, payments, shipping, and returns.</li>
          <li>Manage accounts, customer support, and transactional communications.</li>
          <li>Marketing and personalized advertising (with consent where applicable).</li>
          <li>Prevent fraud, abuse, and security violations.</li>
          <li>Comply with legal obligations (tax, EAR, OFAC, AML).</li>
          <li>Improve the Site through analytics and A/B testing.</li>
        </ul>
      ),
    },
    {
      id: 'sharing',
      number: 5,
      title: 'Disclosure to Third Parties — Sale and Sharing under CPRA',
      body: (
        <p>
          We share personal information with: payment processors, carriers, IT/cloud providers, email/CRM platforms,
          ad platforms, authorities when legally required. Under CPRA, use of third-party cookies for cross-context
          behavioral advertising may qualify as &quot;sale&quot; or &quot;sharing&quot;. You have the right to opt out
          via the &quot;Your Privacy Choices&quot; link in the Site footer. We honor the Global Privacy Control (GPC) signal.
        </p>
      ),
    },
    {
      id: 'retention',
      number: 6,
      title: 'Data Retention',
      body: (
        <p>
          We retain your information while your account is active, for the period necessary to fulfill the described
          purposes, and for the term required by applicable tax and commercial laws (typically 7 years for accounting records).
        </p>
      ),
    },
    {
      id: 'your-rights',
      number: 7,
      title: 'Your Rights (CCPA/CPRA, VCDPA, CTDPA, CPA, UCPA, FDBR)',
      body: (
        <>
          <ul>
            <li><strong>Know:</strong> request detail of personal information we hold about you.</li>
            <li><strong>Access:</strong> obtain a portable copy.</li>
            <li><strong>Correct:</strong> request rectification of inaccurate data.</li>
            <li><strong>Delete:</strong> request deletion (subject to legal exceptions).</li>
            <li><strong>Opt out of sale/sharing</strong> (Do Not Sell or Share).</li>
            <li><strong>Limit</strong> use of sensitive personal information.</li>
            <li><strong>Non-discrimination:</strong> we will not retaliate for exercising rights.</li>
            <li><strong>Appeal</strong> denials (VA, CT, CO).</li>
          </ul>
          <p>
            To exercise rights: email <a href="mailto:sales@nitrotelmanufacturing.com">sales@nitrotelmanufacturing.com</a> or
            use the form at www.nitrotelmanufacturing.com/privacy-request. We will verify your identity before processing.
            Response time: 45 days (extendable 45 additional days with notice).
          </p>
        </>
      ),
    },
    {
      id: 'authorized-agent',
      number: 8,
      title: 'Authorized Agent',
      body: (
        <p>
          You may designate an authorized agent to submit requests on your behalf. The agent must show written
          authorization signed by you; we may also require direct verification with you.
        </p>
      ),
    },
    {
      id: 'minors',
      number: 9,
      title: 'Minors',
      body: (
        <p>
          The Site is not directed to children under 16. We do not knowingly collect personal information from minors.
          If we become aware, we will delete the data. We do not sell or share personal information of minors under 16
          without affirmative opt-in.
        </p>
      ),
    },
    {
      id: 'cookies',
      number: 10,
      title: 'Cookies and Similar Technologies',
      body: (
        <p>
          See Cookie Policy for full detail. We honor the GPC signal. The consent banner allows Accept All, Reject All,
          or Customize.
        </p>
      ),
    },
    {
      id: 'security',
      number: 11,
      title: 'Security',
      body: (
        <p>
          We implement reasonable technical and organizational measures: TLS encryption in transit, AES-256 encryption
          at rest for sensitive PII, role-based access control, MFA for staff with data access, audit logs, periodic
          vulnerability assessments. No system is 100% secure.
        </p>
      ),
    },
    {
      id: 'international',
      number: 12,
      title: 'International Transfers',
      body: (
        <p>
          Data may be processed in the U.S. and countries where our providers operate. We apply standard contractual
          clauses where legally required.
        </p>
      ),
    },
    {
      id: 'financial-incentive',
      number: 13,
      title: 'Notice of Financial Incentive (CPRA 1798.125)',
      body: (
        <p>
          Loyalty programs and exclusive offers may constitute a financial incentive. The estimated value of your
          personal information is calculated based on average acquisition cost. You may enroll and unsubscribe at any time.
        </p>
      ),
    },
    {
      id: 'shine-the-light',
      number: 14,
      title: 'California Shine the Light (Cal. Civ. 1798.83)',
      body: (
        <p>
          California residents may request once a year free disclosure of information shared with third parties for
          direct marketing by emailing <a href="mailto:sales@nitrotelmanufacturing.com">sales@nitrotelmanufacturing.com</a>.
        </p>
      ),
    },
    {
      id: 'changes',
      number: 15,
      title: 'Changes to this Policy',
      body: (
        <p>
          We will post any change on this page with a new effective date. Material changes will be notified by email
          or prominent Site notice.
        </p>
      ),
    },
    {
      id: 'privacy-contact',
      number: 16,
      title: 'Privacy Officer Contact',
      body: (
        <p>
          Havtel Corp — Privacy Office<br />
          4626 SW 147th Ct, Miami, FL 33185<br />
          <a href="mailto:sales@nitrotelmanufacturing.com">sales@nitrotelmanufacturing.com</a> · (786) 409-3741
        </p>
      ),
    },
  ];

  return (
    <LegalDocumentLayout
      eyebrow="Legal Document"
      title="Privacy Policy"
      intro="How Havtel Corp collects, uses, shares, and protects your personal information, and the rights you can exercise under U.S. state privacy laws."
      effectiveDate="May 1, 2026"
      sections={sections}
    />
  );
}

function TermsOfUse() {
  const sections: LegalSection[] = [
    {
      id: 'acceptance',
      number: 1,
      title: 'Acceptance of Terms',
      body: (
        <p>
          By accessing, browsing, or making a purchase on www.nitrotelmanufacturing.com (the &quot;Site&quot;), you
          represent that you have read, understood, and agree to be legally bound by these Terms of Use (the
          &quot;Terms&quot;), our Privacy Policy, and all referenced policies. If you do not agree, do not use the Site.
        </p>
      ),
    },
    {
      id: 'eligibility',
      number: 2,
      title: 'Eligibility and Accounts',
      body: (
        <p>
          The Site is intended for individuals 18 years or older. By creating an account, you represent that you are of
          legal age, have legal capacity, and provide truthful information. You are responsible for keeping your
          credentials confidential and for all activity under your account. Notify us immediately of any unauthorized use.
        </p>
      ),
    },
    {
      id: 'orders',
      number: 3,
      title: 'Orders, Pricing, Payment, and Taxes',
      body: (
        <p>
          All orders are subject to acceptance and availability. We reserve the right to refuse, cancel, or limit orders
          for any reason, including typographical errors in price or description. Prices are in USD and exclude taxes,
          shipping, and duties unless otherwise stated. Sales tax is calculated based on the delivery jurisdiction
          applying post-Wayfair economic nexus criteria (South Dakota v. Wayfair, 2018). We accept the payment methods
          shown at checkout.
        </p>
      ),
    },
    {
      id: 'risk-of-loss',
      number: 4,
      title: 'Risk of Loss and Title Transfer',
      body: (
        <p>
          Title and risk of loss for products pass to the buyer when the carrier picks them up at our facilities (FOB
          Origin), unless agreed otherwise in writing.
        </p>
      ),
    },
    {
      id: 'product-descriptions',
      number: 5,
      title: 'Product Descriptions',
      body: (
        <p>
          We make reasonable efforts to ensure descriptions, images, specifications, and compatibility are accurate. We
          do not warrant they are accurate, complete, or error-free. Images are illustrative. Technical specifications
          are subject to change by the manufacturer without notice.
        </p>
      ),
    },
    {
      id: 'license',
      number: 6,
      title: 'Limited License to Use the Site',
      body: (
        <p>
          We grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Site for
          legitimate personal or business purposes. Prohibited: copy, modify, decompile, scrape, automated access,
          resale, or commercial exploitation of the content without written authorization.
        </p>
      ),
    },
    {
      id: 'ip',
      number: 7,
      title: 'Intellectual Property',
      body: (
        <p>
          All Site content (text, code, design, trademarks, logos, images, and compilation) is owned by Havtel Corp or
          its licensors and is protected by copyright and trademark laws. Third-party trademarks belong to their
          respective owners.
        </p>
      ),
    },
    {
      id: 'user-content',
      number: 8,
      title: 'User Content',
      body: (
        <p>
          If you post reviews, comments, or any content (&quot;User Content&quot;), you grant us a worldwide, perpetual,
          royalty-free, sublicensable license to use it for commercial purposes. You represent that you own the relevant
          rights. We reserve the right to moderate, remove, or reject User Content.
        </p>
      ),
    },
    {
      id: 'prohibited-uses',
      number: 9,
      title: 'Prohibited Uses',
      body: (
        <p>
          You shall not: (a) use the Site for unlawful activity; (b) impersonate another person; (c) interfere with Site
          security or functionality; (d) collect data on other users; (e) resell products without written authorization
          in violation of the Distribution Agreement; (f) re-export products to controlled destinations without complying
          with applicable EAR/OFAC regulations.
        </p>
      ),
    },
    {
      id: 'third-party-links',
      number: 10,
      title: 'Third-Party Links',
      body: (
        <p>
          The Site may contain links to third-party sites. We do not control or endorse their content. Use is at your
          own risk and governed by such third parties&apos; terms.
        </p>
      ),
    },
    {
      id: 'warranty-disclaimers',
      number: 11,
      title: 'Warranty Disclaimers',
      body: (
        <p className="uppercase tracking-[0.02em]">
          The Site and products are provided &quot;as is&quot; and &quot;as available&quot;. To the maximum extent
          permitted by law, we disclaim all warranties express or implied, including merchantability, fitness for a
          particular purpose, and non-infringement. Manufacturers&apos; warranties, when applicable, are provided
          separately and are not altered by these Terms.
        </p>
      ),
    },
    {
      id: 'limitation-liability',
      number: 12,
      title: 'Limitation of Liability',
      body: (
        <p className="uppercase tracking-[0.02em]">
          To the maximum extent permitted by law, our aggregate liability for any claim related to these Terms, the Site,
          or the products shall not exceed the amount paid by you in the twelve (12) months prior to the event giving
          rise to the claim. In no event shall we be liable for indirect, incidental, special, consequential, exemplary,
          or punitive damages, including lost profits, data, or reputation.
        </p>
      ),
    },
    {
      id: 'indemnification',
      number: 13,
      title: 'Indemnification',
      body: (
        <p>
          You agree to indemnify and hold harmless Havtel Corp, its directors, employees, and affiliates from any claim,
          damage, or expense (including reasonable attorneys&apos; fees) arising from your use of the Site, your breach
          of these Terms, or your violation of third-party rights.
        </p>
      ),
    },
    {
      id: 'force-majeure',
      number: 14,
      title: 'Force Majeure',
      body: (
        <p>
          We shall not be liable for failure due to causes beyond our reasonable control: acts of God, war, terrorism,
          pandemic, civil unrest, carrier failures, government regulation, or widespread telecommunications failure.
        </p>
      ),
    },
    {
      id: 'arbitration',
      number: 15,
      title: 'Dispute Resolution — Arbitration and Class Action Waiver',
      body: (
        <>
          <p className="font-bold uppercase tracking-[0.02em] text-[#1f6dad]">
            Read this section carefully. It affects your legal rights.
          </p>
          <p>
            Any dispute between you and Havtel Corp shall be resolved exclusively by binding <strong>INDIVIDUAL ARBITRATION</strong> administered
            by the American Arbitration Association (AAA) under its Consumer Arbitration Rules, in the State of Florida.
            <strong> You expressly waive your right to a jury trial and to participate in a class action, group action, or class arbitration.</strong>
          </p>
          <p>
            <strong>Exceptions:</strong> claims under USD $10,000 may be brought in small claims court; intellectual property claims may be
            litigated in federal courts. You may opt out of arbitration by sending written notice to{' '}
            <a href="mailto:sales@nitrotelmanufacturing.com">sales@nitrotelmanufacturing.com</a> within 30 days of accepting these Terms.
          </p>
        </>
      ),
    },
    {
      id: 'governing-law',
      number: 16,
      title: 'Governing Law and Jurisdiction',
      body: (
        <p>
          These Terms are governed by the laws of the State of Florida and applicable U.S. federal law, without regard
          to conflict of laws rules. The U.N. Convention on Contracts for the International Sale of Goods (CISG) is
          expressly excluded.
        </p>
      ),
    },
    {
      id: 'modifications',
      number: 17,
      title: 'Modifications',
      body: (
        <p>
          We may modify these Terms at any time. Material modifications will be notified by prominent notice on the
          Site or by email at least thirty (30) days prior to the effective date. Continued use after the effective
          date constitutes acceptance.
        </p>
      ),
    },
    {
      id: 'severability',
      number: 18,
      title: 'Severability and Entire Agreement',
      body: (
        <p>
          If any provision is deemed invalid, the remainder remain in full force. These Terms, together with the
          referenced policies, constitute the entire agreement between the parties and supersede any prior agreement.
        </p>
      ),
    },
    {
      id: 'contact',
      number: 19,
      title: 'Contact',
      body: (
        <p>
          Havtel Corp<br />
          4626 SW 147th Ct, Miami, FL 33185<br />
          <a href="mailto:sales@nitrotelmanufacturing.com">sales@nitrotelmanufacturing.com</a> · (786) 409-3741
        </p>
      ),
    },
  ];

  return (
    <LegalDocumentLayout
      eyebrow="Legal Document"
      title="Terms of Use"
      intro="The terms governing your use of www.nitrotelmanufacturing.com — including orders, payment, intellectual property, dispute resolution, and limitations of liability."
      effectiveDate="May 1, 2026"
      sections={sections}
    />
  );
}

function Support() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[linear-gradient(90deg,#ffffff_0%,#fbf7f4_70%,#fff6df_100%)] pt-20"
    >
      <section className="relative overflow-hidden px-8 py-20 md:px-16 md:py-24">
        <div className="absolute inset-0">
          <div className="absolute left-[-8%] top-[8%] h-[420px] w-[420px] rounded-full bg-[#e4f3fb] blur-[120px]"></div>
          <div className="absolute right-[2%] top-[4%] h-[520px] w-[520px] rounded-full bg-[#f8f1eb] blur-[140px]"></div>
        </div>

        <div className="relative z-10 mx-auto max-w-[1720px]">
          <div className="mb-12 max-w-[1220px] md:mb-16">
            <span className="mb-6 block text-[12px] font-black uppercase tracking-[0.18em] text-[#5c95bd]">Connect With Excellence</span>
            <h1 className="text-5xl font-black uppercase tracking-[-0.08em] text-[#1f6dad] md:text-[82px] lg:text-[94px]">
              How can we help you?
            </h1>
            <p className="mt-8 max-w-[940px] text-[22px] italic leading-[1.7] text-[#5d95bc]">
              Welcome to HAVTEL.CORP. Here you&apos;ll find the best technology solutions on the market. Place your order with confidence and connect with our team for fast, reliable assistance.
            </p>
          </div>

          <div className="grid grid-cols-1 items-start gap-10 xl:grid-cols-[minmax(0,1.28fr)_420px] xl:gap-18">
            <div className="rounded-[18px] bg-[linear-gradient(90deg,#64add9_0%,#73b4db_100%)] p-6 shadow-[0_20px_50px_rgba(95,168,215,0.24)] md:p-11">
              <div className="grid grid-cols-1 gap-6">
                <label className="block">
                  <span className="mb-4 block text-[12px] font-black uppercase tracking-[0.08em] text-white">Full Identity</span>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    className="w-full rounded-[14px] border border-[#d6e4ec] bg-[linear-gradient(180deg,#fffefb_0%,#fbfbfd_100%)] px-6 py-5 text-[17px] text-[#1f5078] shadow-[0_8px_20px_rgba(22,71,104,0.18)] outline-none placeholder:text-[#5c85a2] focus:border-[#8dbbda]"
                  />
                </label>

                <label className="block">
                  <span className="mb-4 block text-[12px] font-black uppercase tracking-[0.08em] text-white">Digital Coordinates</span>
                  <input
                    type="email"
                    placeholder="email@address.com"
                    className="w-full rounded-[14px] border border-[#d6e4ec] bg-[linear-gradient(180deg,#fffefb_0%,#fbfbfd_100%)] px-6 py-5 text-[17px] text-[#1f5078] shadow-[0_8px_20px_rgba(22,71,104,0.18)] outline-none placeholder:text-[#5c85a2] focus:border-[#8dbbda]"
                  />
                </label>

                <label className="block">
                  <span className="mb-4 block text-[12px] font-black uppercase tracking-[0.08em] text-white">Digital Coordinates</span>
                  <textarea
                    placeholder="How may we assist you today?"
                    rows={7}
                    className="w-full resize-none rounded-[14px] border border-[#d6e4ec] bg-[linear-gradient(180deg,#fffefb_0%,#fbfbfd_100%)] px-6 py-5 text-[17px] text-[#1f5078] shadow-[0_8px_20px_rgba(22,71,104,0.18)] outline-none placeholder:text-[#5c85a2] focus:border-[#8dbbda]"
                  />
                </label>

                <div className="pt-1">
                  <button className="inline-flex items-center gap-2 rounded-[12px] bg-[linear-gradient(90deg,#0f5ca0_0%,#1d6ea9_100%)] px-8 py-4 text-[16px] font-black text-white shadow-[0_14px_30px_rgba(13,77,138,0.24)] transition-transform hover:scale-[1.01]">
                    Send Message
                    <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-[2px]">
              {[
                {
                  icon: MapPin,
                  title: 'Global Headquarters',
                  lines: ['2531 NW 72nd Ave unit A', 'Miami, FL 33122', 'United States'],
                },
                {
                  icon: AtSign,
                  title: 'Electronic Mail',
                  lines: ['sales@havtel.com'],
                },
                {
                  icon: Phone,
                  title: 'Technical Line',
                  lines: ['786-332-4868', 'Monday - Friday 9am- 5:00 pm'],
                },
              ].map((item) => (
                <div key={item.title} className="rounded-[16px] bg-[linear-gradient(90deg,rgba(177,213,235,0.92)_0%,rgba(163,204,231,0.92)_100%)] p-6 shadow-[0_14px_30px_rgba(107,154,187,0.16)]">
                  <div className="flex gap-5">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[12px] bg-[linear-gradient(180deg,#66add9_0%,#6eaed4_100%)] text-white shadow-[0_10px_20px_rgba(76,129,163,0.24)]">
                      <item.icon size={28} />
                    </div>
                    <div>
                      <h3 className="text-[22px] font-black tracking-[-0.04em] text-white">{item.title}</h3>
                      <div className="mt-3 space-y-1 text-[17px] font-semibold text-white/95">
                        {item.lines.map((line) => (
                          <p key={line}>{line}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="relative overflow-hidden rounded-[28px] border border-[#d3e3ec] bg-[linear-gradient(180deg,#cfe4f2_0%,#bed9ea_100%)] p-6 shadow-[0_16px_30px_rgba(107,154,187,0.16)]">
                <div
                  className="absolute inset-0 opacity-45"
                  style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.24) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.24) 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                  }}
                ></div>
                <div className="absolute left-[15%] top-[24%] h-3 w-3 rounded-full bg-white/90"></div>
                <div className="absolute right-[18%] top-[18%] h-3 w-3 rounded-full bg-white/90"></div>
                <div className="absolute left-[58%] bottom-[22%] h-3 w-3 rounded-full bg-white/90"></div>
                <div className="relative z-10 flex min-h-[250px] items-center justify-center">
                  <button className="rounded-full bg-[linear-gradient(90deg,#7db8dd_0%,#6face0_100%)] px-10 py-5 text-[18px] font-black text-white shadow-[0_14px_30px_rgba(95,168,215,0.25)]">
                    Miami Location
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}

function MaintenancePage() {
  return (
    <div className="min-h-screen bg-[#101419] text-[#e0e2ea] font-sans flex flex-col items-center justify-center px-6 text-center">
      <HavtelLogo height={40} />

      <div className="mt-12 mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#1a3f6f]/40 ring-2 ring-[#1a3f6f]">
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#aac7ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      </div>

      <h1 className="text-3xl font-black tracking-tight text-white">We'll be right back</h1>
      <p className="mt-4 max-w-sm text-base leading-relaxed text-[#8b9cbf]">
        Havtel is currently undergoing scheduled maintenance.
        <br />
        We'll be back online shortly. Thank you for your patience.
      </p>

      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-10 rounded-full bg-[#1a3f6f] px-8 py-3 text-sm font-bold text-white ring-1 ring-[#aac7ff]/20 transition hover:bg-[#1e4d87]"
      >
        Try again
      </button>
    </div>
  );
}
