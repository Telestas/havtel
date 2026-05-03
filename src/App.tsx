import React, { useEffect, useRef, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string);
import {
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
  MessageSquare,
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
  LogOut,
  Send,
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
  listCategoriesRequest,
  listOrdersRequest,
  listProductsRequest,
  listUserAddressesRequest,
  loginRequest,
  refreshTokenRequest,
  registerRequest,
  removeCartItemRequest,
  setDefaultUserAddressRequest,
  updateCartItemRequest,
  updateCurrentUserRequest,
  updateUserAddressRequest,
  fetchMaintenanceStatus,
  listPickupPointsRequest,
  type PickupPointPublic,
} from './lib/api';

type View = 'home' | 'shop' | 'support' | 'account' | 'orders' | 'cart' | 'shipping' | 'payment' | 'confirmed' | 'tracking' | 'product' | 'notfound' | 'login' | 'signup' | 'forgot';

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
  const navy = light ? 'white' : '#1a3f6f';
  const bg = light ? 'transparent' : 'white';
  const boxBg = light ? 'white' : '#1a3f6f';
  const boxText = light ? '#1a3f6f' : 'white';
  const border = light ? 'white' : '#1a3f6f';
  return (
    <svg viewBox="0 0 120 40" height={height} xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      <rect x="1.5" y="1.5" width="117" height="37" rx="2" fill={bg} stroke={border} strokeWidth="2.5"/>
      <rect x="59" y="1.5" width="59.5" height="37" rx="2" fill={boxBg}/>
      <rect x="59" y="1.5" width="6" height="37" fill={boxBg}/>
      <text x="7" y="28" fontFamily="'Arial Black', Arial, sans-serif" fontSize="20" fontWeight="900" fill={navy} letterSpacing="-0.5">HAV</text>
      <text x="63" y="28" fontFamily="'Arial Black', Arial, sans-serif" fontSize="20" fontWeight="900" fill={boxText} letterSpacing="-0.5">TEL</text>
    </svg>
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
    categorySlug: cat?.slug ?? '',
    brand: cat?.name ?? '',
    variants: [],
    isInStock: p.is_in_stock,
  };
}

export default function App() {
  const initialRoute = getCurrentRouteSnapshot();
  const [view, setView] = useState<View>(initialRoute.view);
  const [selectedProductSlug, setSelectedProductSlug] = useState<string | null>(initialRoute.productSlug);
  const [notification, setNotification] = useState<string | null>(null);
  const [authSession, setAuthSession] = useState<AuthSession>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<'priority' | 'express'>('priority');
  const [deliveryType, setDeliveryType] = useState<'home_delivery' | 'warehouse_pickup'>('home_delivery');
  const [selectedPickupPointId, setSelectedPickupPointId] = useState<string | null>(null);
  const [checkoutShippingAddress, setCheckoutShippingAddress] = useState<CheckoutShippingAddress | null>(null);
  const [checkoutResponse, setCheckoutResponse] = useState<CheckoutResponse | null>(null);
  const [isInitiatingCheckout, setIsInitiatingCheckout] = useState(false);
  const [latestOrder, setLatestOrder] = useState<Order | null>(null);
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [trackedOrderId, setTrackedOrderId] = useState<string | null>(initialRoute.trackedOrderId);
  const isAuthenticated = authSession !== null;
  const isPopNavigationRef = useRef(false);

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const isCheckoutView =
    view === 'cart' || view === 'shipping' || view === 'payment' || view === 'confirmed' || view === 'tracking';

  const addToCart = async (productSlug: string, preferredVariantId?: string, quantity = 1) => {
    if (!authSession?.access_token) {
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

      await addCartItemRequest(authSession.access_token, {
        variant_id: variant.id,
        quantity,
      });

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
  }, [view, selectedProductSlug, trackedOrderId]);

  // Load products and categories from API
  useEffect(() => {
    setIsLoadingProducts(true);
    Promise.all([listCategoriesRequest(), listProductsRequest({}, authSession?.access_token)])
      .then(([cats, paginated]) => {
        setCategories(cats);
        const flat = new Map<string, Category>();
        const flattenCats = (list: Category[]) => {
          for (const c of list) {
            flat.set(c.id, c);
            if (c.children.length) flattenCats(c.children);
          }
        };
        flattenCats(cats);
        setProducts(paginated.items.map((p) => mapApiProductToLocal(p, flat)));
      })
      .catch(() => {/* products stay empty */})
      .finally(() => setIsLoadingProducts(false));
  }, [authSession?.access_token]);

  // Sync cart from server on login
  useEffect(() => {
    if (!authSession?.access_token) return;
    getCartRequest(authSession.access_token)
      .then((cart) => {
        if (cart.items.length === 0) return;
        setCartItems((prev: CartItem[]) => {
          const merged = [...prev];
          for (const si of cart.items) {
            const exists = merged.find((i) => i.variantId === si.variant_id);
            if (!exists) {
              merged.push({
                variantId: si.variant_id,
                productSlug: '',
                productName: si.variant.name,
                variantName: si.variant.name,
                quantity: si.quantity,
                price: parseFloat(si.unit_price),
                img: null,
              });
            }
          }
          return merged;
        });
      })
      .catch(() => {/* keep local cart */});
  }, [authSession?.access_token]);

  const requireAuthForView = (nextView: View) => {
    if (isAuthenticated) {
      setView(nextView);
      return;
    }

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
      setView('account');
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
      setView('account');
    } catch (error) {
      setAuthError(error instanceof ApiError ? error.message : 'Unable to create your account right now.');
    } finally {
      setIsAuthSubmitting(false);
    }
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
    const taxAmount = subtotal * 0.0825;

    setIsInitiatingCheckout(true);
    setAuthError(null);
    if (address) setCheckoutShippingAddress(address);

    try {
      const result = await callWithRefresh((token) =>
        checkoutRequest(token, {
          shipping_method: isWarehousePickup ? 'warehouse_pickup' : shippingMethod,
          shipping_amount: shippingAmount,
          tax_amount: taxAmount,
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
      setView('payment');
    } catch (error) {
      if (!(error instanceof ApiError && error.status === 401)) {
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
            { key: 'discover', label: 'DISCOVER', target: 'shop' as View, active: false },
            { key: 'support', label: 'SUPPORT', target: 'support' as View, active: view === 'support' },
            { key: 'pre-order', label: 'PRE-ORDER', target: 'shop' as View, active: false },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setView(item.target)}
              className={`text-xs font-bold tracking-[0.12em] transition-colors pb-1 ${item.active ? 'text-white border-b-2 border-white' : 'text-white/70 hover:text-white'}`}
            >
              {item.label}
            </button>
          ))}
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
        ) : view === 'shop' ? (
          <Shop key="shop" products={products} categories={categories} isLoading={isLoadingProducts} onAddToCart={addToCart} onProductSelect={openProduct} />
        ) : view === 'product' ? (
          <ProductDetailView
            key={`product-${selectedProductSlug ?? ''}`}
            productSlug={selectedProductSlug ?? ''}
            authToken={authSession?.access_token}
            allProducts={products}
            onAddToCart={addToCart}
            onBackToShop={() => setView('shop')}
            onProductSelect={openProduct}
          />
        ) : view === 'payment' ? (
          checkoutResponse ? (
            <Elements
              key="payment"
              stripe={stripePromise}
              options={{ clientSecret: checkoutResponse.client_secret, appearance: { theme: 'stripe' } }}
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
              />
            </Elements>
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
          />
        ) : view === 'cart' ? (
          <ShoppingBagView
            key="cart"
            cartItems={cartItems}
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
              const newQty = item.quantity + 1;
              setCartItems((prev) => prev.map((i) => i.variantId === variantId ? { ...i, quantity: newQty } : i));
              if (authSession?.access_token) {
                await updateCartItemRequest(authSession.access_token, variantId, newQty).catch(() => {});
              }
            }}
            onSetQuantity={async (variantId, qty) => {
              const newQty = Math.max(1, qty);
              setCartItems((prev) => prev.map((i) => i.variantId === variantId ? { ...i, quantity: newQty } : i));
              if (authSession?.access_token) {
                await updateCartItemRequest(authSession.access_token, variantId, newQty).catch(() => {});
              }
            }}
            onRemoveItem={async (variantId) => {
              setCartItems((prev) => prev.filter((i) => i.variantId !== variantId));
              if (authSession?.access_token) {
                await removeCartItemRequest(authSession.access_token, variantId).catch(() => {});
              }
            }}
          />
        ) : view === 'orders' ? (
          <OrderHistory
            key="orders"
            authSession={authSession}
            onBackToAccount={() => setView('account')}
            onGoHome={() => setView('home')}
            onTrackOrder={(orderId) => {
              setTrackedOrderId(orderId);
              setView('tracking');
            }}
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
              <li><a className="hover:text-white transition-colors" href="#">Support</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Investrors</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Sustainability</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-5 uppercase tracking-wider text-xs">Legal</h4>
            <ul className="space-y-3">
              <li><a className="hover:text-white transition-colors" href="#">Privacy Policy</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Terms of Service</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Contact</a></li>
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

      {/* Floating Action Button */}
      <button className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-[#aac7ff] to-[#3e90ff] rounded-full shadow-2xl flex items-center justify-center text-[#003064] hover:scale-110 active:scale-95 transition-transform z-40 group">
        <MessageSquare size={28} />
        <span className="absolute right-full mr-4 bg-[#31353b] px-4 py-2 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap text-white">
          Expert Support
        </span>
      </button>
      </>
      )}
    </div>
  );
}

function ShoppingBagView({
  cartItems,
  onClose,
  onGoHome,
  onProceedToShipping,
  onDecreaseQuantity,
  onIncreaseQuantity,
  onSetQuantity,
  onRemoveItem,
}: {
  cartItems: CartItem[];
  onClose: () => void;
  onGoHome: () => void;
  onProceedToShipping: () => void;
  onDecreaseQuantity: (variantId: string) => void;
  onIncreaseQuantity: (variantId: string) => void;
  onSetQuantity: (variantId: string, qty: number) => void;
  onRemoveItem: (variantId: string) => void;
  key?: string;
}) {
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

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
            </div>
          </section>

          <aside className="h-fit rounded-[22px] border-[5px] border-[#7eb7db] bg-[rgba(255,250,241,0.92)] p-8 shadow-[0_16px_34px_rgba(107,154,187,0.16)] xl:sticky xl:top-10">
            <h2 className="mb-10 text-[58px] font-black tracking-[-0.06em] text-[#1f6dad]">Order Summary</h2>

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
                <div className="text-[72px] font-black tracking-[-0.08em] leading-none text-[#1f6dad]">
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
                  defaultValue="HAVTEL2026"
                  className="min-w-0 flex-1 rounded-[16px] border border-[#d6e4ec] bg-[linear-gradient(90deg,#d7ebf5_0%,#cfe6f3_100%)] px-5 py-4 text-base font-bold text-white placeholder:text-white/80 focus:outline-none"
                />
                <button type="button" className="rounded-[16px] bg-[linear-gradient(90deg,#63a8d5_0%,#74b4db_100%)] px-6 py-4 text-lg font-black text-white shadow-[0_10px_24px_rgba(107,154,187,0.16)] transition-colors hover:opacity-95">
                  Apply
                </button>
              </div>
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
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
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
  key?: string;
}) {
  const isWarehousePickup = deliveryType === 'warehouse_pickup';
  const shippingCost = isWarehousePickup ? 0 : (shippingMethod === 'priority' ? 12 : 35);
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + shippingCost + tax;
  const summaryItem = cartItems[0] ?? null;
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [pickupPoints, setPickupPoints] = useState<PickupPointPublic[]>([]);
  const [isLoadingPickupPoints, setIsLoadingPickupPoints] = useState(false);

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
    country: '',
  });

  const applyAddressToForm = (address: UserAddress) => {
    const { firstName, lastName } = splitFullName(address.contact_name ?? '');
    setSelectedAddressId(address.id);
    setShippingForm({
      email: address.contact_email ?? authSession?.user.email ?? '',
      phone: address.contact_phone ?? authSession?.user.phone ?? '',
      firstName,
      lastName,
      street: address.street,
      city: address.city,
      state: address.state ?? '',
      postalCode: address.zip_code ?? '',
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
                  <label className="block">
                    <span className="mb-4 block text-[13px] font-black uppercase tracking-[0.08em] text-[#5c95bd]">Email Address</span>
                    <input
                      type="email"
                      value={shippingForm.email}
                      onChange={(event) => setShippingForm((prev) => ({ ...prev, email: event.target.value }))}
                      placeholder="name@domain.tech"
                      className="w-full rounded-[14px] border border-[#d6e4ec] bg-[linear-gradient(90deg,#bfdcf0_0%,#d1e7f5_100%)] px-6 py-5 text-xl font-bold text-white placeholder:text-white/90 shadow-[0_10px_24px_rgba(107,154,187,0.12)] focus:outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-4 block text-[13px] font-black uppercase tracking-[0.08em] text-[#5c95bd]">Phone Number</span>
                    <input
                      type="tel"
                      value={shippingForm.phone}
                      onChange={(event) => setShippingForm((prev) => ({ ...prev, phone: event.target.value }))}
                      placeholder="+1 (555) 000-0000"
                      className="w-full rounded-[14px] border border-[#d6e4ec] bg-[linear-gradient(90deg,#bfdcf0_0%,#d1e7f5_100%)] px-6 py-5 text-xl font-bold text-white placeholder:text-white/90 shadow-[0_10px_24px_rgba(107,154,187,0.12)] focus:outline-none"
                    />
                  </label>
                </div>
              </div>

              <div>
                <div className="mb-8 flex items-center gap-4">
                  <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-[linear-gradient(180deg,#7eb7db_0%,#9bc8e2_100%)] px-2 text-xs font-black text-white shadow-[0_8px_18px_rgba(107,154,187,0.16)]">4</span>
                  <h2 className="text-[30px] font-black tracking-[-0.04em] text-[#1f6dad]">Destination Details</h2>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-4 block text-[13px] font-black uppercase tracking-[0.08em] text-[#5c95bd]">First Name</span>
                    <input
                      value={shippingForm.firstName}
                      onChange={(event) => setShippingForm((prev) => ({ ...prev, firstName: event.target.value }))}
                      placeholder="Enter your first name"
                      className="w-full rounded-[14px] border border-[#d6e4ec] bg-[linear-gradient(90deg,#bfdcf0_0%,#d1e7f5_100%)] px-6 py-5 text-xl font-bold text-white placeholder:text-white/90 shadow-[0_10px_24px_rgba(107,154,187,0.12)] focus:outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-4 block text-[13px] font-black uppercase tracking-[0.08em] text-[#5c95bd]">Last Name</span>
                    <input
                      value={shippingForm.lastName}
                      onChange={(event) => setShippingForm((prev) => ({ ...prev, lastName: event.target.value }))}
                      placeholder="Enter your last name"
                      className="w-full rounded-[14px] border border-[#d6e4ec] bg-[linear-gradient(90deg,#bfdcf0_0%,#d1e7f5_100%)] px-6 py-5 text-xl font-bold text-white placeholder:text-white/90 shadow-[0_10px_24px_rgba(107,154,187,0.12)] focus:outline-none"
                    />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="mb-4 block text-[13px] font-black uppercase tracking-[0.08em] text-[#5c95bd]">Stree Address</span>
                    <input
                      value={shippingForm.street}
                      onChange={(event) => setShippingForm((prev) => ({ ...prev, street: event.target.value }))}
                      placeholder="123 Tech Boulevard"
                      className="w-full rounded-[14px] border border-[#d6e4ec] bg-[linear-gradient(90deg,#bfdcf0_0%,#d1e7f5_100%)] px-6 py-5 text-xl font-bold text-white placeholder:text-white/90 shadow-[0_10px_24px_rgba(107,154,187,0.12)] focus:outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-4 block text-[13px] font-black uppercase tracking-[0.08em] text-[#5c95bd]">City</span>
                    <input
                      value={shippingForm.city}
                      onChange={(event) => setShippingForm((prev) => ({ ...prev, city: event.target.value }))}
                      className="w-full rounded-[14px] border border-[#d6e4ec] bg-[linear-gradient(90deg,#bfdcf0_0%,#d1e7f5_100%)] px-6 py-5 text-xl font-bold text-white shadow-[0_10px_24px_rgba(107,154,187,0.12)] focus:outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-4 block text-[13px] font-black uppercase tracking-[0.08em] text-[#5c95bd]">State / Province</span>
                    <input
                      value={shippingForm.state}
                      onChange={(event) => setShippingForm((prev) => ({ ...prev, state: event.target.value }))}
                      className="w-full rounded-[14px] border border-[#d6e4ec] bg-[linear-gradient(90deg,#bfdcf0_0%,#d1e7f5_100%)] px-6 py-5 text-xl font-bold text-white shadow-[0_10px_24px_rgba(107,154,187,0.12)] focus:outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-4 block text-[13px] font-black uppercase tracking-[0.08em] text-[#5c95bd]">Postal Code</span>
                    <input
                      value={shippingForm.postalCode}
                      onChange={(event) => setShippingForm((prev) => ({ ...prev, postalCode: event.target.value }))}
                      className="w-full rounded-[14px] border border-[#d6e4ec] bg-[linear-gradient(90deg,#bfdcf0_0%,#d1e7f5_100%)] px-6 py-5 text-xl font-bold text-white shadow-[0_10px_24px_rgba(107,154,187,0.12)] focus:outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-4 block text-[13px] font-black uppercase tracking-[0.08em] text-[#5c95bd]">Country</span>
                    <input
                      value={shippingForm.country}
                      onChange={(event) => setShippingForm((prev) => ({ ...prev, country: event.target.value }))}
                      className="w-full rounded-[14px] border border-[#d6e4ec] bg-[linear-gradient(90deg,#bfdcf0_0%,#d1e7f5_100%)] px-6 py-5 text-xl font-bold text-white shadow-[0_10px_24px_rgba(107,154,187,0.12)] focus:outline-none"
                    />
                  </label>
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
                      <div className="text-2xl font-black">$12.00</div>
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
                      <div className="text-2xl font-black">$35.00</div>
                    </div>
                  </button>
                </div>
              </div>
                </>
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
                  onClick={() => onProceedToPayment(isWarehousePickup ? null : shippingForm)}
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
                  <span className="text-[14px] font-black uppercase tracking-[0.08em] text-[#5c95bd]">Tax (Est.)</span>
                  <span className="font-black text-[#1f6dad]">{formatCurrency(tax)}</span>
                </div>
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
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Help Center</span>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}


function StripePaymentForm({ total, onPaymentSuccess }: { total: number; onPaymentSuccess: () => Promise<void> }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsSubmitting(true);
    setStripeError(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/confirmed`,
      },
      redirect: 'if_required',
    });

    if (error) {
      setStripeError(error.message ?? 'Payment failed. Please try again.');
      setIsSubmitting(false);
      return;
    }

    await onPaymentSuccess();
    setIsSubmitting(false);
  };

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
        disabled={!stripe || isSubmitting}
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
  key?: string;
}) {
  const isWarehousePickup = deliveryType === 'warehouse_pickup';
  const shippingCost = isWarehousePickup ? 0 : (shippingMethod === 'priority' ? 12 : 35);
  const shippingLabel = isWarehousePickup ? 'WAREHOUSE PICKUP (FREE)' : (shippingMethod === 'priority' ? 'STANDARD EXPRESS (2-3 BUSINESS DAYS)' : 'QUANTUM EXPRESS (NEXT DAY)');
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.0825;
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
            <h2 className="mb-8 text-[56px] font-black tracking-[-0.06em] text-[#1f6dad]">Order Summary</h2>
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between"><span className="text-[14px] font-black uppercase tracking-[0.08em] text-[#5c95bd]">Subtotal</span><span className="font-black text-[#1f6dad]">{formatCurrency(subtotal)}</span></div>
              <div className="flex items-center justify-between"><span className="text-[14px] font-black uppercase tracking-[0.08em] text-[#5c95bd]">Shipping</span><span className="font-black text-[#1f6dad]">{formatCurrency(shippingCost)}</span></div>
              <div className="flex items-center justify-between"><span className="text-[14px] font-black uppercase tracking-[0.08em] text-[#5c95bd]">Estimated Tax</span><span className="font-black text-[#1f6dad]">{formatCurrency(tax)}</span></div>
            </div>
            <div className="my-6 border-t border-[#7eb7db]"></div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-[20px] font-black uppercase tracking-[0.06em] text-[#5c95bd]">Total</span>
              <span className="text-[64px] font-black tracking-[-0.08em] leading-none text-[#1f6dad]">{formatCurrency(total)}</span>
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
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
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
  const subtotal = Number(order?.subtotal_amount ?? cartItems.reduce((sum, item) => {
    const product = PRODUCTS.find((entry) => entry.id === item.productId);
    return sum + (product?.price ?? 0) * item.quantity;
  }, 0));
  const tax = Number(order?.tax_amount ?? subtotal * 0.08);
  const total = Number(order?.total_amount ?? subtotal + shippingCost + tax);
  const shippingName = order?.shipping_address.contact_name
    ?? [checkoutShippingAddress?.firstName, checkoutShippingAddress?.lastName].filter(Boolean).join(' ').trim();
  const orderItems = order?.items ?? [];
  const orderShippingMethod = order?.shipping_method ?? shippingMethod;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[radial-gradient(circle_at_bottom_right,rgba(24,98,126,0.22),transparent_28%),#0f141b] text-slate-100"
    >
      <CheckoutHeader
        activeStep="payment"
        onGoHome={onGoHome}
        onClose={onClose}
      />

      <main className="mx-auto max-w-[1600px] px-8 py-14 md:px-16">
        <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_580px]">
          <section className="pt-8">
            <div className="mb-10 flex h-32 w-32 items-center justify-center rounded-full bg-[#2f3742] shadow-[0_0_50px_rgba(0,195,255,0.25)]">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#9ee3ff] text-[#0a1520]">
                <Check size={32} />
              </div>
            </div>
            <h1 className="text-7xl font-black tracking-tighter">Order Confirmed.</h1>
            <p className="mt-8 max-w-3xl text-3xl leading-relaxed text-slate-400">
              Your high-performance setup is now in the queue. We've sent a detailed receipt to your registered email address.
            </p>

            <div className="mt-12 flex flex-col gap-4 sm:flex-row">
              <button
                type="button"
                onClick={onTrackOrder}
                className="rounded-[22px] bg-gradient-to-r from-[#a9c7ff] to-[#4d93f7] px-10 py-6 text-2xl font-bold text-[#02182d] shadow-[0_24px_60px_rgba(77,147,247,0.35)]"
              >
                Track Order
              </button>
              <button
                type="button"
                onClick={onContinueShopping}
                className="rounded-[22px] border border-white/10 px-10 py-6 text-2xl font-bold text-[#b9d1ff] transition-colors hover:bg-white/5"
              >
                Continue Shopping
              </button>
            </div>

            <div className="mt-24">
              <div className="text-sm font-bold uppercase tracking-[0.34em] text-slate-300">Estimated Arrival</div>
              <div className="mt-8 rounded-[28px] border border-white/5 bg-[#1f252d] p-8">
                <div className="flex items-center gap-6">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#303946] text-[#b9d1ff]">
                    <Truck size={34} />
                  </div>
                    <div>
                      <div className="text-3xl font-bold text-slate-100">
                        {orderShippingMethod === 'priority' ? 'Priority delivery window confirmed' : 'Express delivery window confirmed'}
                      </div>
                      <div className="mt-3 text-2xl text-slate-400">
                        {orderShippingMethod === 'priority' ? 'Standard High-Priority Logistics' : 'Quantum Express Priority Lane'}
                      </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="rounded-[32px] border border-white/5 bg-[#232831] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.3)] h-fit">
            <div className="mb-8 flex items-center justify-between gap-4">
              <h2 className="text-4xl font-black tracking-tight">Order Summary</h2>
              <span className="rounded-full bg-white/6 px-4 py-2 text-lg text-slate-300">{order?.order_number ?? 'Pending Order Number'}</span>
            </div>

            <div className="space-y-8">
              {orderItems.map((item) => {
                return (
                  <div key={item.id} className="flex gap-5">
                    <div className="h-24 w-24 overflow-hidden rounded-2xl bg-[#0b1016]">
                      {item.product_image_url ? (
                        <img src={item.product_image_url} alt={item.product_name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                      ) : null}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-2xl font-bold text-slate-100">{item.product_name}</h3>
                          <p className="mt-2 text-xl text-slate-400">{item.variant_name}</p>
                        </div>
                        <span className="text-2xl text-slate-100">{formatCurrency(Number(item.unit_price) * item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="my-8 border-t border-white/5"></div>
            <div className="space-y-4 text-xl">
              <div className="flex items-center justify-between"><span className="text-slate-300">Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
              <div className="flex items-center justify-between"><span className="text-slate-300">Shipping</span><span className="text-[#75d3ff]">{formatCurrency(shippingCost)}</span></div>
              <div className="flex items-center justify-between"><span className="text-slate-300">Tax (EST)</span><span>{formatCurrency(tax)}</span></div>
            </div>
            <div className="my-8 border-t border-white/5"></div>
            <div className="flex items-end justify-between gap-4">
              <span className="text-3xl font-bold text-slate-100">Total</span>
              <span className="text-5xl font-black tracking-tight text-[#a9c7ff]">{formatCurrency(total)}</span>
            </div>

            <div className="mt-10 border-t border-white/5 pt-8">
              <div className="flex items-start gap-4">
                <MapPin size={24} className="mt-1 text-slate-400" />
                <div className="text-xl leading-relaxed text-slate-300">
                  <div className="font-bold text-slate-100">Shipping To</div>
                  <div className="mt-3">{shippingName || 'Shipping contact not set'}</div>
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

      <footer className="border-t border-white/5 px-8 py-10 text-sm uppercase tracking-[0.24em] text-slate-500 md:px-16">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>© 2026 HAVTEL TECHNOLOGY. ALL RIGHTS RESERVED.</div>
          <div className="flex flex-wrap gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
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
      className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(24,98,126,0.14),transparent_25%),#0f141b] text-slate-100"
    >
      <CheckoutHeader
        activeStep="tracking"
        mode="tracking"
        onGoHome={onGoHome}
        onClose={onClose}
      />

      <main className="mx-auto max-w-[1600px] px-8 py-14 md:px-16">
        <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_420px]">
          <section>
            <div className="mb-12">
              <span className="mb-4 block text-sm font-bold uppercase tracking-[0.34em] text-[#b5cbff]">Shipment Tracking</span>
              <h1 className="text-6xl font-black tracking-tighter md:text-7xl">Track Your Order</h1>
              <p className="mt-6 max-w-3xl text-2xl leading-relaxed text-slate-400">
                Follow your hardware package in real time and review the latest fulfillment milestones for order `{order?.order_number ?? '...'}`.
              </p>
            </div>

            <div className="rounded-[30px] border border-white/5 bg-[#171d26] p-8 md:p-10">
              {isLoadingOrder ? (
                <p className="mb-8 rounded-2xl border border-[#75d3ff]/20 bg-[#75d3ff]/10 px-4 py-3 text-sm text-[#d6f2ff]">
                  Loading your latest tracking details...
                </p>
              ) : null}
              {orderError ? (
                <p className="mb-8 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{orderError}</p>
              ) : null}

              {/* Status header */}
              <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="text-sm font-bold uppercase tracking-[0.3em] text-slate-400">Current Status</div>
                  <div className="mt-3 text-4xl font-black capitalize text-[#9dd6ff]">{order?.status?.replaceAll('_', ' ') ?? 'Loading'}</div>
                </div>
                {order?.carrier_tracking_number ? (
                  <div className="text-right">
                    <div className="text-sm text-slate-500">{order.carrier ?? 'Carrier'}</div>
                    <div className="font-mono text-xl font-bold text-[#9dd6ff]">{order.carrier_tracking_number}</div>
                  </div>
                ) : (
                  <div className="text-lg text-slate-500">{order?.tracking_code ? `Ref: ${order.tracking_code}` : 'Tracking pending'}</div>
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
                        <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-black transition-colors ${done ? 'bg-[#9ee3ff] text-[#041521]' : current ? 'bg-[#223b53] text-[#b9d1ff] ring-2 ring-[#4a7fa8]' : 'bg-[#1c2433] text-slate-600'}`}>
                          {done ? <Check size={16} /> : <span>{index + 1}</span>}
                        </div>
                        <span className={`text-center text-[10px] font-bold uppercase tracking-wide ${done || current ? 'text-slate-300' : 'text-slate-600'}`}>
                          {step.label}
                        </span>
                      </div>
                      {index < PIPELINE_STEPS.length - 1 && (
                        <div className={`mb-5 h-[2px] flex-1 ${done ? 'bg-[#5abaf0]' : 'bg-white/8'}`} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Real status history */}
              <div>
                <div className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Activity Log</div>
                {(order?.status_history ?? []).length === 0 ? (
                  <p className="text-slate-500">No activity recorded yet.</p>
                ) : (
                  <div className="space-y-5">
                    {(order?.status_history ?? []).map((entry) => (
                      <div key={entry.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="h-3 w-3 flex-shrink-0 rounded-full bg-[#4a7fa8] ring-4 ring-[#4a7fa8]/20" />
                          <div className="mt-2 w-[1px] flex-1 bg-white/8" />
                        </div>
                        <div className="pb-4">
                          <div className="text-base font-bold capitalize text-slate-200">
                            {entry.new_status.replaceAll('_', ' ')}
                          </div>
                          {entry.note ? (
                            <p className="mt-1 text-sm text-slate-400">{entry.note}</p>
                          ) : null}
                          <p className="mt-1 text-xs text-slate-600">
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
                className="rounded-[22px] border border-white/10 px-8 py-5 text-xl font-bold text-[#b9d1ff] transition-colors hover:bg-white/5"
              >
                Back to Orders
              </button>
              <button
                type="button"
                onClick={onContinueShopping}
                className="rounded-[22px] bg-gradient-to-r from-[#a9c7ff] to-[#4d93f7] px-8 py-5 text-xl font-bold text-[#02182d] shadow-[0_24px_60px_rgba(77,147,247,0.35)]"
              >
                Continue Shopping
              </button>
            </div>
          </section>

          <aside className="space-y-8">
            <div className="rounded-[32px] border border-white/5 bg-[#232831] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.3)]">
              <div className="mb-8 flex items-center justify-between gap-4">
                <h2 className="text-4xl font-black tracking-tight">Tracking Summary</h2>
                <span className="rounded-full bg-white/6 px-4 py-2 text-lg text-slate-300">{order?.tracking_code ?? 'Pending'}</span>
              </div>
              <div className="space-y-6">
                {(order?.items ?? []).length > 0 ? (
                  (order?.items ?? []).map((item) => {
                    return (
                      <div key={item.id} className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 overflow-hidden rounded-xl bg-[#0b1016]">
                            {item.product_image_url ? (
                              <img src={item.product_image_url} alt={item.product_name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                            ) : null}
                          </div>
                          <div>
                            <div className="text-xl font-bold text-slate-100">{item.product_name}</div>
                            <div className="text-base text-slate-400">Qty: {item.quantity}</div>
                          </div>
                        </div>
                        <span className="text-lg text-slate-300">{formatCurrency(Number(item.unit_price) * item.quantity)}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-5 text-base text-slate-400">
                    Your order items will appear here once the order details finish loading.
                  </div>
                )}
              </div>
              <div className="my-8 border-t border-white/5"></div>
              <div className="space-y-4 text-lg">
                <div className="flex items-center justify-between"><span className="text-slate-300">Subtotal</span><span>{formatCurrency(Number(order?.subtotal_amount ?? 0))}</span></div>
                <div className="flex items-center justify-between"><span className="text-slate-300">Shipping</span><span>{formatCurrency(Number(order?.shipping_amount ?? 0))}</span></div>
                <div className="flex items-center justify-between"><span className="text-slate-300">Tax</span><span>{formatCurrency(Number(order?.tax_amount ?? 0))}</span></div>
              </div>
              <div className="my-8 border-t border-white/5"></div>
              <div className="flex items-end justify-between gap-4">
                <span className="text-2xl font-bold text-slate-100">Total</span>
                <span className="text-5xl font-black tracking-tight text-[#a9c7ff]">{formatCurrency(Number(order?.total_amount ?? 0))}</span>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/5 bg-[#161c24] p-8">
              <div className="text-sm font-bold uppercase tracking-[0.32em] text-[#b5cbff] mb-6">Destination</div>
              <div className="space-y-2 text-xl text-slate-300">
                <div>{order?.shipping_address.contact_name ?? 'Shipping contact pending'}</div>
                <div>{order?.shipping_address.street ?? 'Street pending'}</div>
                <div>{[order?.shipping_address.city, order?.shipping_address.state, order?.shipping_address.postal_code].filter(Boolean).join(', ') || 'Location pending'}</div>
                <div>{order?.shipping_address.country ?? 'Country pending'}</div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <footer className="border-t border-white/5 px-8 py-10 text-sm uppercase tracking-[0.24em] text-slate-500 md:px-16">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>© 2026 HAVTEL TECHNOLOGY. ALL RIGHTS RESERVED.</div>
          <div className="flex flex-wrap gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
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
  allProducts,
  onAddToCart,
  onBackToShop,
  onProductSelect,
}: {
  productSlug: string;
  authToken?: string;
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
  const productDescription =
    apiProduct?.description ??
    `Engineered for the next generation of computational dominance. The ${productName} leverages Havtel's proprietary photonic-bridge architecture to deliver unprecedented throughput.`;
  const relatedProducts = allProducts.filter((p) => p.slug !== productSlug).slice(0, 4);

  if (!apiProduct) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-20 min-h-screen flex items-center justify-center bg-[linear-gradient(90deg,#ffffff_0%,#fbf7f4_72%,#fff6df_100%)]">
        <div className="text-[#5d95bc] text-lg">Loading product…</div>
      </motion.div>
    );
  }

  const specifications = [
    ['Architecture', 'Lumina v4 (3nm)'],
    ['Max Clock Speed', '5.8 GHz (Turbo)'],
    ['L3 Cache', '128 MB'],
    ['TDP (Standard)', '125W'],
    ['Socket', 'Havtel LX-G1'],
    ['Memory Type', 'DDR5-6400 MT/s'],
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[linear-gradient(90deg,#ffffff_0%,#fbf7f4_72%,#fff6df_100%)] pt-20"
    >
      <section className="relative overflow-hidden px-6 py-10 md:px-12 xl:px-20 xl:py-14">
        <div className="absolute inset-0">
          <div className="absolute left-[-8%] top-[9%] h-[420px] w-[420px] rounded-full bg-[#e4f3fb] blur-[120px]"></div>
          <div className="absolute right-[1%] top-[6%] h-[520px] w-[520px] rounded-full bg-[#f8f1eb] blur-[140px]"></div>
          <div className="absolute left-[22%] bottom-[18%] h-[320px] w-[320px] rounded-full bg-[#fff3db] blur-[120px]"></div>
        </div>

        <div className="relative z-10 mx-auto max-w-[1720px]">
          <div className="mb-6 flex items-center gap-4">
            <span className="inline-flex rounded-full border border-[#d6e4ec] bg-white px-4 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-[#7aa5c2] shadow-[0_8px_18px_rgba(107,154,187,0.12)]">
              Flagship Core
            </span>
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
              <span className="inline-flex rounded-full border border-[#d6e4ec] bg-white px-4 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-[#7aa5c2] shadow-[0_8px_18px_rgba(107,154,187,0.12)]">
                Flagship Core
              </span>
              <h1 className="mt-4 text-5xl font-black uppercase tracking-[-0.08em] text-[#1f6dad] md:text-[78px] leading-[0.94]">{productName}</h1>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="text-[46px] font-black tracking-[-0.06em] text-[#1f6dad]">{priceString}</span>
                <span className={`text-[14px] font-black uppercase tracking-[0.08em] ${inStock ? 'text-[#3a9a34]' : 'text-[#bb5a42]'}`}>
                  {inStock ? 'In Stock - Limited Edition' : 'Out of Stock'}
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
                <div className="rounded-[16px] border border-[#d6e4ec] bg-white px-3 py-4 shadow-[0_10px_24px_rgba(107,154,187,0.12)]">3 Year Warranty</div>
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
            {[
              ['description', 'Description'],
              ['specs', 'Technical Specifications'],
              ['reviews', 'Reviews (142)'],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedTab(id as 'description' | 'specs' | 'reviews')}
                className={`border-b-[3px] px-1 py-4 text-sm font-black ${
                  selectedTab === id ? 'border-[#76b7db] text-[#1f6dad]' : 'border-transparent text-[#7ca0b8]'
                }`}
              >
                {label}
              </button>
            ))}
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_420px]">
            <div>
              {selectedTab === 'description' && (
                <>
                  <h2 className="text-4xl font-black tracking-[-0.06em] text-[#1f6dad] md:text-[58px]">The Future of Compute</h2>
                  <p className="mt-6 max-w-4xl text-[20px] italic leading-[1.7] text-[#5d95bc]">
                    The Havtel {productName} isn&apos;t just a processor; it is a paradigm shift. Utilizing the Lumina v4 microarchitecture, we have optimized every nanometer to ensure that bottlenecking is a relic of the past. Whether you are compiling massive codebases, rendering 8K cinema-grade visuals, or training deep neural networks, the {productName} adapts in real time.
                  </p>
                  <blockquote className="mt-8 max-w-2xl rounded-[18px] bg-[linear-gradient(90deg,#b4d7eb_0%,#c2deef_100%)] px-6 py-6 text-[18px] italic leading-[1.65] text-white shadow-[0_14px_30px_rgba(107,154,187,0.18)]">
                    &quot;The benchmark results for the {productName} defy current expectations of a co-equal silicon. It&apos;s in a league of its own.&quot;
                    <div className="mt-4 text-[11px] not-italic font-black uppercase tracking-[0.16em] text-white/90">Technexus Review Lab</div>
                  </blockquote>
                </>
              )}

              {selectedTab === 'specs' && (
                <>
                  <h2 className="text-4xl font-black tracking-[-0.06em] text-[#1f6dad] md:text-[58px]">Technical Specifications</h2>
                  <div className="mt-8 grid grid-cols-1 gap-y-4 sm:grid-cols-2">
                    {specifications.map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between gap-6 border-b border-[#b9d4e7] py-4 sm:pr-8">
                        <span className="text-sm font-black uppercase tracking-[0.08em] text-[#5d95bc]">{label}</span>
                        <span className="text-sm font-black text-[#1f6dad]">{value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {selectedTab === 'reviews' && (
                <>
                  <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                      <h2 className="text-4xl font-black tracking-[-0.06em] text-[#1f6dad] md:text-[58px]">User Feedback</h2>
                      <div className="mt-3 flex items-center gap-3 text-[#5d95bc]">
                        <div className="flex gap-1 text-[#76b7db]">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={16} fill="currentColor" />)}</div>
                        <span className="text-sm font-bold">4.9/5 (Based on 142 reviews)</span>
                      </div>
                    </div>
                    <button type="button" className="rounded-[14px] border border-[#d6e4ec] bg-white px-5 py-3 text-sm font-black text-[#1f6dad] shadow-[0_10px_24px_rgba(107,154,187,0.12)] transition-colors hover:bg-[#f3f9fd]">
                      Write a Review
                    </button>
                  </div>
                  <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {[
                      ['Marcus Jensen', 'Lead 3D Artist', 'The transition from my previous gen to the Quantum X-8000 was night and day. Render times in Blender dropped by nearly 45%.'],
                      ['Sarah Lin', 'Systems Engineer', 'Installation was a breeze. The thermals are incredibly stable even under 100% load during long simulation runs.'],
                      ['David Byrne', 'Game Developer', 'High price tag, but you absolutely get what you pay for. The multi-threaded performance is unmatched in the consumer space.'],
                    ].map(([name, role, review]) => (
                      <div key={name} className="rounded-[22px] border border-[#d6e4ec] bg-white p-6 shadow-[0_12px_28px_rgba(107,154,187,0.12)]">
                        <div className="mb-4 flex items-center justify-between">
                          <div className="flex gap-1 text-[#76b7db]">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} fill="currentColor" />)}</div>
                          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#7ca0b8]">Verified</span>
                        </div>
                        <p className="text-sm leading-relaxed text-[#5d95bc]">&quot;{review}&quot;</p>
                        <div className="mt-5">
                          <div className="text-sm font-black text-[#1f6dad]">{name}</div>
                          <div className="text-xs text-[#7ca0b8]">{role}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="space-y-5">
              {selectedTab !== 'reviews' &&
                specifications.map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-6 border-b border-[#b9d4e7] py-3">
                    <span className="text-sm font-black uppercase tracking-[0.08em] text-[#5d95bc]">{label}</span>
                    <span className="text-sm font-black text-[#1f6dad]">{value}</span>
                  </div>
                ))}
            </div>
          </div>

          <section className="mt-16 overflow-hidden rounded-[28px] bg-[linear-gradient(90deg,#d7ebf5_0%,#d2e6f2_100%)] p-6 shadow-[0_16px_32px_rgba(107,154,187,0.12)] md:p-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-[0.88fr_1.12fr] md:items-center">
              <div>
                <span className="text-[11px] font-black uppercase tracking-[0.12em] text-[#67a0c4]">Innovative Cooling</span>
                <h2 className="mt-5 text-4xl font-black tracking-[-0.06em] text-[#1f6dad] md:text-[56px]">AI-Driven Thermal Management</h2>
                <p className="mt-5 max-w-3xl text-[19px] italic leading-[1.7] text-[#5d95bc]">
                  The {productName} monitors its own thermal signatures at 10,000 intervals per second. Our neural-mesh adjusts power delivery dynamically, ensuring you hit peak performance without the thermal throttle common in standard high-performance chips.
                </p>
                <button type="button" className="mt-8 inline-flex items-center gap-3 text-sm font-black text-[#1f6dad]">
                  Learn about Havtel Mesh Technology <ArrowRight size={16} />
                </button>
              </div>
              <div className="relative min-h-[280px] overflow-hidden rounded-[24px] bg-[linear-gradient(180deg,#c9e2f0_0%,#c5deed_100%)]">
                <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7db8dd]/55 blur-[38px]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.18),transparent_36%)]"></div>
                <div className="absolute bottom-5 right-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-[#1f6dad] shadow-[0_10px_20px_rgba(107,154,187,0.16)]">
                  <ArrowRight size={18} />
                </div>
              </div>
            </div>
          </section>

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
              onSubmit={async (event) => {
                event.preventDefault();
                await onLogin({ email, password });
              }}
              className="mt-10 space-y-7"
            >
              <label className="block">
                <span className="mb-4 block text-[12px] font-black uppercase tracking-[0.08em] text-white">Email Address</span>
                <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@domain.tech" className="w-full rounded-[14px] border border-[#d6e4ec] bg-[linear-gradient(180deg,#fffefb_0%,#fbfbfd_100%)] px-7 py-5 text-[18px] text-[#1f5078] shadow-[0_8px_20px_rgba(22,71,104,0.18)] outline-none placeholder:text-[#5c85a2] focus:border-[#8dbbda]" />
              </label>
              <label className="block">
                <span className="mb-4 block text-[12px] font-black uppercase tracking-[0.08em] text-white">Password</span>
                <input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" className="w-full rounded-[14px] border border-[#d6e4ec] bg-[linear-gradient(180deg,#fffefb_0%,#fbfbfd_100%)] px-7 py-5 text-[18px] text-[#1f5078] shadow-[0_8px_20px_rgba(22,71,104,0.18)] outline-none placeholder:text-[#5c85a2] focus:border-[#8dbbda]" />
              </label>
              {errorMessage ? (
                <p className="rounded-[12px] border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-white">{errorMessage}</p>
              ) : null}
              <div className="flex items-center justify-between gap-4 text-[16px] font-black text-white">
                <button type="button" onClick={onGoToForgot} className="hover:text-[#eaf6ff]">Forgot password?</button>
                <button type="button" onClick={onGoToSignup} className="hover:text-[#eaf6ff]">Create account</button>
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full rounded-[12px] bg-[linear-gradient(90deg,#0f5ca0_0%,#1d6ea9_100%)] px-8 py-5 text-[18px] font-black text-white shadow-[0_14px_30px_rgba(13,77,138,0.24)] disabled:cursor-not-allowed disabled:opacity-70">
                {isSubmitting ? 'Signing In...' : 'Sing In'}
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
              onSubmit={async (event) => {
                event.preventDefault();
                await onSignup({ accountType, firstName, lastName, companyName, email, password });
              }}
              className="mt-10 grid grid-cols-1 gap-6"
            >
              <div className="grid grid-cols-1 gap-3 rounded-[16px] bg-white/10 p-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setAccountType('b2c')}
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
                  onClick={() => setAccountType('b2b')}
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
                <input
                  required
                  value={companyName}
                  onChange={(event) => setCompanyName(event.target.value)}
                  placeholder="Company name"
                  className="w-full rounded-[14px] border border-[#d6e4ec] bg-[linear-gradient(180deg,#fffefb_0%,#fbfbfd_100%)] px-7 py-5 text-[18px] text-[#1f5078] shadow-[0_8px_20px_rgba(22,71,104,0.18)] outline-none placeholder:text-[#5c85a2] focus:border-[#8dbbda]"
                />
              ) : (
                <>
                  <input required value={firstName} onChange={(event) => setFirstName(event.target.value)} placeholder="First name" className="w-full rounded-[14px] border border-[#d6e4ec] bg-[linear-gradient(180deg,#fffefb_0%,#fbfbfd_100%)] px-7 py-5 text-[18px] text-[#1f5078] shadow-[0_8px_20px_rgba(22,71,104,0.18)] outline-none placeholder:text-[#5c85a2] focus:border-[#8dbbda]" />
                  <input required value={lastName} onChange={(event) => setLastName(event.target.value)} placeholder="Last name" className="w-full rounded-[14px] border border-[#d6e4ec] bg-[linear-gradient(180deg,#fffefb_0%,#fbfbfd_100%)] px-7 py-5 text-[18px] text-[#1f5078] shadow-[0_8px_20px_rgba(22,71,104,0.18)] outline-none placeholder:text-[#5c85a2] focus:border-[#8dbbda]" />
                </>
              )}
              <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email address" className="w-full rounded-[14px] border border-[#d6e4ec] bg-[linear-gradient(180deg,#fffefb_0%,#fbfbfd_100%)] px-7 py-5 text-[18px] text-[#1f5078] shadow-[0_8px_20px_rgba(22,71,104,0.18)] outline-none placeholder:text-[#5c85a2] focus:border-[#8dbbda]" />
              <input required type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Create password" className="w-full rounded-[14px] border border-[#d6e4ec] bg-[linear-gradient(180deg,#fffefb_0%,#fbfbfd_100%)] px-7 py-5 text-[18px] text-[#1f5078] shadow-[0_8px_20px_rgba(22,71,104,0.18)] outline-none placeholder:text-[#5c85a2] focus:border-[#8dbbda]" />
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
  onSubmit,
  onGoHome,
  onGoToLogin,
}: {
  onSubmit: () => void;
  onGoHome: () => void;
  onGoToLogin: () => void;
  key?: string;
}) {
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
          <form
            onSubmit={(event) => {
              event.preventDefault();
              onSubmit();
            }}
            className="mt-8 space-y-6"
          >
            <label className="block">
              <span className="mb-4 block text-sm font-bold uppercase tracking-[0.24em] text-slate-300">Email Address</span>
              <input type="email" required placeholder="name@domain.tech" className="w-full rounded-2xl border border-white/5 bg-[#0b1016] px-6 py-5 text-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#aac7ff]/40" />
            </label>
            <button type="submit" className="w-full rounded-[22px] bg-gradient-to-r from-[#a9c7ff] to-[#4d93f7] px-8 py-5 text-xl font-bold text-[#03192f] shadow-[0_24px_60px_rgba(77,147,247,0.35)]">
              Send Reset Link
            </button>
          </form>
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

      <section className="px-6 py-16 md:px-12 lg:px-20">
        <div className="mx-auto grid max-w-[1320px] gap-8 rounded-[38px] border border-white/40 bg-[linear-gradient(135deg,rgba(250,246,238,0.96)_0%,rgba(233,246,251,0.92)_100%)] p-7 shadow-[0_28px_70px_rgba(53,97,133,0.14)] md:grid-cols-[minmax(0,1fr)_360px] md:p-10">
          <div className="max-w-xl">
            <span className="inline-flex rounded-full border border-[#d7e8f2] bg-white/65 px-4 py-1 text-[10px] font-black uppercase tracking-[0.3em] text-[#8e7c57]">
              Flagship Collection
            </span>
            <h2 className="mt-6 text-4xl font-black tracking-[-0.06em] text-[#2b5f95] md:text-6xl">
              Quantum
              <br />
              X-Series
            </h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-[#56728c]">
              The next wave of enterprise hardware, engineered for resilient performance, efficient scaling, and modern infrastructure rollouts.
            </p>
            <button
              onClick={() => spotlightProduct && onProductSelect(spotlightProduct.slug)}
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

function Shop({ products, categories, isLoading, onAddToCart, onProductSelect }: { products: Product[]; categories: Category[]; isLoading: boolean; onAddToCart: (slug: string, variantId?: string, quantity?: number) => void; onProductSelect: (slug: string) => void; key?: string }) {
  const [activeCategory, setActiveCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Popularity');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const PRODUCTS_PER_PAGE = 9;

  const maxProductPrice = Math.max(...products.map(p => p.price), 0);
  const availableBrands = Array.from(new Set(products.map(p => p.brand).filter(Boolean)));

  const [pendingBrands, setPendingBrands] = useState<Set<string>>(new Set());
  const [pendingMaxPrice, setPendingMaxPrice] = useState<number>(Infinity);
  const [activeBrands, setActiveBrands] = useState<Set<string>>(new Set());
  const [activeMaxPrice, setActiveMaxPrice] = useState<number>(Infinity);

  const filteredProducts = products.filter(prod => {
    const matchesCategory = !activeCategory || prod.category === activeCategory;
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         prod.series.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBrand = activeBrands.size === 0 || activeBrands.has(prod.brand);
    const matchesPrice = activeMaxPrice === Infinity || prod.price <= activeMaxPrice;
    return matchesCategory && matchesSearch && matchesBrand && matchesPrice;
  }).sort((a, b) => {
    if (sortBy === 'Price: Low to High') return a.price - b.price;
    if (sortBy === 'Price: High to Low') return b.price - a.price;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const pagedProducts = filteredProducts.slice((safePage - 1) * PRODUCTS_PER_PAGE, safePage * PRODUCTS_PER_PAGE);

  const displayCategory = activeCategory || (categories[0]?.name?.toUpperCase() ?? 'PRODUCTS');
  const categoryDescription = activeCategory
    ? `Browse our selection of next-generation ${activeCategory.toLowerCase()}, engineered for extreme performance.`
    : 'Browse our selection of next-generation components, engineered for extreme performance.';

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
                const catKey = cat.name.toUpperCase();
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setActiveCategory(catKey);
                      setIsSidebarOpen(false);
                    }}
                    className={`flex w-full items-center justify-center rounded-[12px] px-5 py-3 text-center text-[14px] font-black uppercase tracking-[-0.02em] transition-all ${
                      activeCategory === catKey
                        ? 'bg-[linear-gradient(90deg,#97c7e4_0%,#add9ef_100%)] text-[#1b4f7e] shadow-[0_14px_30px_rgba(95,168,215,0.16)]'
                        : 'text-[#1d67a7] hover:bg-white/50'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
              {isLoading ? <div className="px-2 py-3 text-xs text-[#6d8397]">Loading categories...</div> : null}
            </nav>
          </div>

          <div className="mb-10">
            <div className="mb-4 text-[11px] font-black uppercase tracking-[0.04em] text-[#5d89a7]">Price Range</div>
            <div className="pr-2">
              <input
                type="range"
                min={0}
                max={maxProductPrice || 2500}
                step={10}
                value={pendingMaxPrice === Infinity ? (maxProductPrice || 2500) : pendingMaxPrice}
                onChange={(e) => setPendingMaxPrice(Number(e.target.value))}
                className="w-full accent-[#0d4d8a]"
              />
              <div className="mt-2 flex justify-between text-xs font-bold text-[#6d8397]">
                <span>$0</span>
                <span>{pendingMaxPrice === Infinity ? formatCurrency(maxProductPrice || 2500) : formatCurrency(pendingMaxPrice)}</span>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-4 text-[11px] font-black uppercase tracking-[0.04em] text-[#5d89a7]">Brands</div>
            <div className="space-y-4">
              {availableBrands.map((brand) => (
                <label key={brand} className="flex cursor-pointer items-center gap-3 text-sm text-[#537089]">
                  <span
                    className={`inline-flex h-5 w-5 items-center justify-center rounded-[4px] border bg-white shadow-inner transition-colors ${pendingBrands.has(brand) ? 'border-[#0d4d8a] bg-[#0d4d8a]' : 'border-[#9fc3db]'}`}
                    onClick={() => setPendingBrands(prev => {
                      const next = new Set(prev);
                      if (next.has(brand)) next.delete(brand); else next.add(brand);
                      return next;
                    })}
                  >
                    {pendingBrands.has(brand) && <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </span>
                  {brand}
                </label>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveBrands(pendingBrands);
                setActiveMaxPrice(pendingMaxPrice);
                setIsSidebarOpen(false);
              }}
              className="mt-8 w-full rounded-[12px] bg-[linear-gradient(90deg,#0f5ca0_0%,#1a6fb0_100%)] px-5 py-4 text-sm font-black uppercase tracking-[0.08em] text-white shadow-[0_16px_30px_rgba(13,77,138,0.24)]"
            >
              Apply Filters
            </button>
          </div>
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
                        >
                          <ShoppingCart size={14} />
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
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);
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
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {accountSections.map((section) => (
                <button
                  key={section.title}
                  type="button"
                  onClick={() => {
                    if (section.id === 'orders') {
                      onOpenOrders();
                      return;
                    }

                    setSelectedSection(section.id);
                  }}
                  className={`group text-left rounded-2xl border p-6 shadow-[0_2px_16px_rgba(26,63,111,0.18)] transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_24px_rgba(26,63,111,0.25)] ${
                    selectedSection === section.id
                      ? 'border-[#1a3f6f] bg-[#1f4d80]'
                      : 'border-[#1a3f6f] bg-[#255a8a] hover:bg-[#1f4d80]'
                  }`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-white mb-5">
                    <section.icon size={22} />
                  </div>
                  <h2 className="text-base font-bold tracking-tight text-white mb-2">{section.title}</h2>
                  <p className="text-sm text-blue-100/80 leading-relaxed">{section.description}</p>
                </button>
              ))}
            </div>

            {selectedSection === 'personal' && (
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
                  onSubmit={async (event) => {
                    event.preventDefault();
                    if (!authSession) {
                      setPersonalError('Your session expired. Please sign in again.');
                      return;
                    }

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
                    <label className="block md:col-span-2">
                      <span className="text-[11px] uppercase tracking-[0.28em] text-[#6b7c8d] font-bold block mb-3">Company Name</span>
                      <input
                        required
                        type="text"
                        value={personalForm.firstName}
                        onChange={(event) => setPersonalForm((prev) => ({ ...prev, firstName: event.target.value }))}
                        placeholder="Enter your company name"
                        className="w-full rounded-xl bg-[#f7f1e8] border border-[#d5e0ec] px-5 py-4 text-[#1a3f6f] placeholder:text-[#9aabbe] focus:outline-none focus:border-[#1a3f6f]/40 focus:shadow-[0_0_0_3px_rgba(26,63,111,0.08)] transition-all"
                      />
                    </label>
                  ) : (
                    <>
                      <label className="block">
                        <span className="text-[11px] uppercase tracking-[0.28em] text-[#6b7c8d] font-bold block mb-3">First Name</span>
                        <input
                          required
                          type="text"
                          value={personalForm.firstName}
                          onChange={(event) => setPersonalForm((prev) => ({ ...prev, firstName: event.target.value }))}
                          placeholder="Enter your first name"
                          className="w-full rounded-xl bg-[#f7f1e8] border border-[#d5e0ec] px-5 py-4 text-[#1a3f6f] placeholder:text-[#9aabbe] focus:outline-none focus:border-[#1a3f6f]/40 focus:shadow-[0_0_0_3px_rgba(26,63,111,0.08)] transition-all"
                        />
                      </label>

                      <label className="block">
                        <span className="text-[11px] uppercase tracking-[0.28em] text-[#6b7c8d] font-bold block mb-3">Last Name</span>
                        <input
                          required
                          type="text"
                          value={personalForm.lastName}
                          onChange={(event) => setPersonalForm((prev) => ({ ...prev, lastName: event.target.value }))}
                          placeholder="Enter your last name"
                          className="w-full rounded-xl bg-[#f7f1e8] border border-[#d5e0ec] px-5 py-4 text-[#1a3f6f] placeholder:text-[#9aabbe] focus:outline-none focus:border-[#1a3f6f]/40 focus:shadow-[0_0_0_3px_rgba(26,63,111,0.08)] transition-all"
                        />
                      </label>
                    </>
                  )}

                  <label className="block">
                    <span className="text-[11px] uppercase tracking-[0.28em] text-[#6b7c8d] font-bold block mb-3">Phone</span>
                    <input
                      type="tel"
                      value={personalForm.phone}
                      onChange={(event) => setPersonalForm((prev) => ({ ...prev, phone: event.target.value }))}
                      placeholder="Enter your phone number"
                      className="w-full rounded-xl bg-[#f7f1e8] border border-[#d5e0ec] px-5 py-4 text-[#1a3f6f] placeholder:text-[#9aabbe] focus:outline-none focus:border-[#1a3f6f]/40 focus:shadow-[0_0_0_3px_rgba(26,63,111,0.08)] transition-all"
                    />
                  </label>

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
            )}

            {selectedSection === 'delivery' && (
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
                    onSubmit={async (event) => {
                      event.preventDefault();
                      if (!authSession) {
                        setDeliveryError('Your session expired. Please sign in again.');
                        return;
                      }

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

                    <label className={`${isCompanyAccount ? 'block md:col-span-2' : 'block'}`}>
                      <span className="text-[11px] uppercase tracking-[0.28em] text-[#6b7c8d] font-bold block mb-3">
                        {isCompanyAccount ? 'Contact Person or Team' : 'Recipient Name'}
                      </span>
                      <input
                        required
                        type="text"
                        value={deliveryForm.contactName}
                        onChange={(event) => setDeliveryForm((prev) => ({ ...prev, contactName: event.target.value }))}
                        placeholder={isCompanyAccount ? 'Procurement team or business contact' : 'Who will receive this order?'}
                        className="w-full rounded-xl bg-white border border-[#d5e0ec] px-5 py-4 text-[#1a3f6f] placeholder:text-[#9aabbe] focus:outline-none focus:border-[#1a3f6f]/40 focus:shadow-[0_0_0_3px_rgba(26,63,111,0.08)] transition-all"
                      />
                    </label>

                    <label className="block">
                      <span className="text-[11px] uppercase tracking-[0.28em] text-[#6b7c8d] font-bold block mb-3">Email</span>
                      <input
                        required
                        type="email"
                        value={deliveryForm.email}
                        onChange={(event) => setDeliveryForm((prev) => ({ ...prev, email: event.target.value }))}
                        placeholder="contact@email.com"
                        className="w-full rounded-xl bg-white border border-[#d5e0ec] px-5 py-4 text-[#1a3f6f] placeholder:text-[#9aabbe] focus:outline-none focus:border-[#1a3f6f]/40 focus:shadow-[0_0_0_3px_rgba(26,63,111,0.08)] transition-all"
                      />
                    </label>

                    <label className="block">
                      <span className="text-[11px] uppercase tracking-[0.28em] text-[#6b7c8d] font-bold block mb-3">Phone</span>
                      <input
                        required
                        type="tel"
                        value={deliveryForm.phone}
                        onChange={(event) => setDeliveryForm((prev) => ({ ...prev, phone: event.target.value }))}
                        placeholder="Enter phone number"
                        className="w-full rounded-xl bg-white border border-[#d5e0ec] px-5 py-4 text-[#1a3f6f] placeholder:text-[#9aabbe] focus:outline-none focus:border-[#1a3f6f]/40 focus:shadow-[0_0_0_3px_rgba(26,63,111,0.08)] transition-all"
                      />
                    </label>

                    <label className="block">
                      <span className="text-[11px] uppercase tracking-[0.28em] text-[#6b7c8d] font-bold block mb-3">Street</span>
                      <input
                        required
                        type="text"
                        value={deliveryForm.street}
                        onChange={(event) => setDeliveryForm((prev) => ({ ...prev, street: event.target.value }))}
                        placeholder="Street and number"
                        className="w-full rounded-xl bg-white border border-[#d5e0ec] px-5 py-4 text-[#1a3f6f] placeholder:text-[#9aabbe] focus:outline-none focus:border-[#1a3f6f]/40 focus:shadow-[0_0_0_3px_rgba(26,63,111,0.08)] transition-all"
                      />
                    </label>

                    <label className="block">
                      <span className="text-[11px] uppercase tracking-[0.28em] text-[#6b7c8d] font-bold block mb-3">City</span>
                      <input
                        required
                        type="text"
                        value={deliveryForm.city}
                        onChange={(event) => setDeliveryForm((prev) => ({ ...prev, city: event.target.value }))}
                        placeholder="City"
                        className="w-full rounded-xl bg-white border border-[#d5e0ec] px-5 py-4 text-[#1a3f6f] placeholder:text-[#9aabbe] focus:outline-none focus:border-[#1a3f6f]/40 focus:shadow-[0_0_0_3px_rgba(26,63,111,0.08)] transition-all"
                      />
                    </label>

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

                    <label className="block">
                      <span className="text-[11px] uppercase tracking-[0.28em] text-[#6b7c8d] font-bold block mb-3">Country</span>
                      <input
                        required
                        type="text"
                        value={deliveryForm.country}
                        onChange={(event) => setDeliveryForm((prev) => ({ ...prev, country: event.target.value }))}
                        placeholder="Country"
                        className="w-full rounded-xl bg-white border border-[#d5e0ec] px-5 py-4 text-[#1a3f6f] placeholder:text-[#9aabbe] focus:outline-none focus:border-[#1a3f6f]/40 focus:shadow-[0_0_0_3px_rgba(26,63,111,0.08)] transition-all"
                      />
                    </label>

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
            )}
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
  onTrackOrder,
}: {
  authSession: AuthSession;
  onBackToAccount: () => void;
  onGoHome: () => void;
  onTrackOrder: (orderId: string) => void;
  key?: string;
}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  useEffect(() => {
    if (!authSession?.access_token) {
      setOrders([]);
      setSelectedOrderId(null);
      setOrdersError(null);
      return;
    }

    let cancelled = false;

    const loadOrders = async () => {
      setIsLoadingOrders(true);
      setOrdersError(null);
      try {
        const nextOrders = await listOrdersRequest(authSession.access_token);
        if (!cancelled) {
          setOrders(nextOrders);
          setSelectedOrderId(nextOrders[0]?.id ?? null);
        }
      } catch (error) {
        if (!cancelled) {
          setOrdersError(error instanceof ApiError ? error.message : 'Unable to load your order history right now.');
        }
      } finally {
        if (!cancelled) {
          setIsLoadingOrders(false);
        }
      }
    };

    void loadOrders();

    return () => {
      cancelled = true;
    };
  }, [authSession?.access_token]);

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
                        {order.items.length} item(s) shipped to {order.shipping_address.city}, {order.shipping_address.state}. Tracking completed and signed at delivery.
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
