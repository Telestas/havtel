import { useEffect, useRef, useState } from 'react';
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
  ChevronLeft,
  Package,
  LogOut,
  Send,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ApiError,
  type AuthResponse,
  type Order,
  type UserAddress,
  createOrderRequest,
  createUserAddressRequest,
  deleteUserAddressRequest,
  getOrderRequest,
  getCurrentUserRequest,
  listOrdersRequest,
  listUserAddressesRequest,
  loginRequest,
  registerRequest,
  updateCurrentUserRequest,
  updateUserAddressRequest,
} from './lib/api';

type View = 'home' | 'shop' | 'support' | 'account' | 'orders' | 'cart' | 'shipping' | 'payment' | 'review' | 'confirmed' | 'tracking' | 'product' | 'notfound' | 'login' | 'signup' | 'forgot';

interface Product {
  id: number;
  name: string;
  series: string;
  price: number;
  priceString: string;
  tag: string | null;
  img: string;
  category: string;
  brand: string;
}

interface CartItem {
  productId: number;
  quantity: number;
  variant: string;
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

const PRODUCTS: Product[] = [
  { id: 1, name: "Quantum X-8000", series: "HAVTEL CORE", price: 799, priceString: "$799.00", tag: "IN STOCK", img: "/products/quantum-x-8000.jpg", category: "PROCESSORS", brand: "Havtel Core" },
  { id: 2, name: "Omni-Board V2", series: "TITAN SERIES", price: 450, priceString: "$450.00", tag: null, img: "/products/omni-board-v2.jpg", category: "PROCESSORS", brand: "Titan Series" },
  { id: 3, name: "Aether G-Force RTX", series: "AETHER TECH", price: 1299, priceString: "$1,299.00", tag: "LIMITED", img: "/products/aether-g-force-rtx.jpg", category: "GRAPHICS", brand: "Aether Tech" },
  { id: 4, name: "Hyper-Pulse DDR5", series: "HAVTEL CORE", price: 215, priceString: "$215.00", tag: null, img: "/products/hyper-pulse-ddr5.jpg", category: "MEMORY", brand: "Havtel Core" },
  { id: 5, name: "Quantum Lite-Z", series: "HAVTEL CORE", price: 349, priceString: "$349.00", tag: null, img: "/products/quantum-lite-z.jpg", category: "PROCESSORS", brand: "Havtel Core" },
  { id: 6, name: "Frost-Bite Cooler", series: "TITAN SERIES", price: 125, priceString: "$125.00", tag: null, img: "/products/frost-bite-cooler.jpg", category: "PERIPHERALS", brand: "Titan Series" },
  { id: 7, name: "Aether NVMe 4TB", series: "AETHER TECH", price: 580, priceString: "$580.00", tag: null, img: "/products/aether-nvme-4tb.jpg", category: "STORAGE", brand: "Aether Tech" },
  { id: 8, name: "Mechanical Elite X", series: "TITAN SERIES", price: 210, priceString: "$210.00", tag: null, img: "/products/mechanical-elite-x.jpg", category: "PERIPHERALS", brand: "Titan Series" }
];

export default function App() {
  const [view, setView] = useState<View>('home');
  const [selectedProductId, setSelectedProductId] = useState<number>(1);
  const [notification, setNotification] = useState<string | null>(null);
  const [authSession, setAuthSession] = useState<AuthSession>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { productId: 3, quantity: 1, variant: 'Aether Black | Founders Edition' },
    { productId: 5, quantity: 1, variant: 'Core Silver | Performance Bundle' },
    { productId: 8, quantity: 2, variant: 'Titanium Slate | Precision Switches' },
  ]);
  const [shippingMethod, setShippingMethod] = useState<'priority' | 'express'>('priority');
  const [checkoutShippingAddress, setCheckoutShippingAddress] = useState<CheckoutShippingAddress | null>(null);
  const [latestOrder, setLatestOrder] = useState<Order | null>(null);
  const [trackedOrderId, setTrackedOrderId] = useState<string | null>(null);
  const isAuthenticated = authSession !== null;

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const isCheckoutView =
    view === 'cart' || view === 'shipping' || view === 'payment' || view === 'review' || view === 'confirmed' || view === 'tracking';

  const addToCart = (productName: string) => {
    const product = PRODUCTS.find((item) => item.name === productName);

    if (product) {
      setCartItems((prev) => {
        const existing = prev.find((item) => item.productId === product.id);

        if (existing) {
          return prev.map((item) =>
            item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        }

        return [
          ...prev,
          {
            productId: product.id,
            quantity: 1,
            variant: `${product.brand} | ${product.series}`,
          },
        ];
      });
    }

    setNotification(`Added ${productName} to cart`);
    setTimeout(() => setNotification(null), 3000);
  };

  const openProduct = (productId: number) => {
    setSelectedProductId(productId);
    setView('product');
  };

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

  useEffect(() => {
    const syncHashView = () => {
      if (window.location.hash === '#404') {
        setView('notfound');
      }
    };

    syncHashView();
    window.addEventListener('hashchange', syncHashView);

    return () => {
      window.removeEventListener('hashchange', syncHashView);
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

  const handlePlaceOrder = async () => {
    if (!authSession?.access_token || !checkoutShippingAddress) {
      setAuthError('Please complete your shipping information before placing the order.');
      setView('shipping');
      return;
    }

    const subtotal = cartItems.reduce((sum, item) => {
      const product = PRODUCTS.find((entry) => entry.id === item.productId);
      return sum + (product?.price ?? 0) * item.quantity;
    }, 0);
    const shippingAmount = shippingMethod === 'priority' ? 12 : 35;
    const taxAmount = subtotal * 0.0825;
    const totalAmount = subtotal + shippingAmount + taxAmount;

    try {
      const order = await createOrderRequest(authSession.access_token, {
        payment_type: 'Credit Card',
        shipping_method: shippingMethod,
        shipping_amount: shippingAmount,
        tax_amount: taxAmount,
        subtotal_amount: subtotal,
        total_amount: totalAmount,
        shipping_address: {
          contact_name: `${checkoutShippingAddress.firstName} ${checkoutShippingAddress.lastName}`.trim(),
          email: checkoutShippingAddress.email,
          phone: checkoutShippingAddress.phone,
          street: checkoutShippingAddress.street,
          city: checkoutShippingAddress.city,
          state: checkoutShippingAddress.state,
          postal_code: checkoutShippingAddress.postalCode,
          country: checkoutShippingAddress.country,
        },
        items: cartItems
          .map((item) => {
            const product = PRODUCTS.find((entry) => entry.id === item.productId);
            if (!product) {
              return null;
            }

            return {
              product_name: product.name,
              variant_name: item.variant,
              unit_price: product.price,
              quantity: item.quantity,
              product_image_url: product.img,
            };
          })
          .filter((item): item is NonNullable<typeof item> => item !== null),
      });

      setLatestOrder(order);
      setTrackedOrderId(order.id);
      setCartItems([]);
      setView('confirmed');
    } catch (error) {
      setAuthError(error instanceof ApiError ? error.message : 'Unable to place your order right now.');
      setView('review');
    }
  };

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
          {([['home', 'HOME'], ['shop', 'SHOP'], ['discover', 'DISCOVER'], ['support', 'SUPPORT'], ['preorder', 'PRE-ORDER']] as [View, string][]).map(([v, label]) => (
            <button
              key={v}
              onClick={() => setView(v as View)}
              className={`text-xs font-bold tracking-[0.12em] transition-colors pb-1 ${view === v ? 'text-white border-b-2 border-white' : 'text-white/70 hover:text-white'}`}
            >
              {label}
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
              className={`transition-colors p-2 rounded-full hover:bg-white/10 ${isUserMenuOpen ? 'text-white bg-white/10' : 'text-white/80 hover:text-white'}`}
            >
              <User size={20} />
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
          <Home key="home" onShopClick={() => setView('shop')} onProductSelect={openProduct} />
        ) : view === 'notfound' ? (
          <NotFoundView key="notfound" onGoHome={() => {
            window.location.hash = '';
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
          <Shop key="shop" onAddToCart={addToCart} onProductSelect={openProduct} />
        ) : view === 'product' ? (
          <ProductDetailView
            key="product"
            product={PRODUCTS.find((item) => item.id === selectedProductId) ?? PRODUCTS[0]}
            onAddToCart={addToCart}
            onBackToShop={() => setView('shop')}
            onProductSelect={openProduct}
          />
        ) : view === 'payment' ? (
          <PaymentView
            key="payment"
            cartItems={cartItems}
            shippingMethod={shippingMethod}
            onClose={() => setView('home')}
            onGoHome={() => setView('home')}
            onBackToShipping={() => requireAuthForView('shipping')}
            onBackToCart={() => requireAuthForView('cart')}
            onProceedToReview={() => requireAuthForView('review')}
          />
        ) : view === 'review' ? (
          <ReviewView
            key="review"
            cartItems={cartItems}
            checkoutShippingAddress={checkoutShippingAddress}
            shippingMethod={shippingMethod}
            onClose={() => setView('home')}
            onGoHome={() => setView('home')}
            onBackToPayment={() => requireAuthForView('payment')}
            onBackToShipping={() => requireAuthForView('shipping')}
            onBackToCart={() => requireAuthForView('cart')}
            onPlaceOrder={handlePlaceOrder}
          />
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
            onShippingAddressChange={setCheckoutShippingAddress}
            onShippingMethodChange={setShippingMethod}
            onClose={() => setView('home')}
            onGoHome={() => setView('home')}
            onBackToCart={() => requireAuthForView('cart')}
            onProceedToPayment={() => requireAuthForView('payment')}
          />
        ) : view === 'cart' ? (
          <ShoppingBagView
            key="cart"
            cartItems={cartItems}
            onClose={() => setView('home')}
            onGoHome={() => setView('home')}
            onProceedToShipping={() => requireAuthForView('shipping')}
            onDecreaseQuantity={(productId) =>
              setCartItems((prev) =>
                prev.flatMap((item) => {
                  if (item.productId !== productId) return [item];
                  if (item.quantity <= 1) return [];
                  return [{ ...item, quantity: item.quantity - 1 }];
                })
              )
            }
            onIncreaseQuantity={(productId) =>
              setCartItems((prev) =>
                prev.map((item) =>
                  item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
                )
              )
            }
            onRemoveItem={(productId) =>
              setCartItems((prev) => prev.filter((item) => item.productId !== productId))
            }
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
  onRemoveItem,
}: {
  cartItems: CartItem[];
  onClose: () => void;
  onGoHome: () => void;
  onProceedToShipping: () => void;
  onDecreaseQuantity: (productId: number) => void;
  onIncreaseQuantity: (productId: number) => void;
  onRemoveItem: (productId: number) => void;
  key?: string;
}) {
  const subtotal = cartItems.reduce((sum, item) => {
    const product = PRODUCTS.find((entry) => entry.id === item.productId);
    return sum + (product?.price ?? 0) * item.quantity;
  }, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[#0b1016] text-slate-100"
    >
      <header className="border-b border-white/5 bg-[#10151d]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-8 py-7 md:px-16">
          <button type="button" onClick={onGoHome} className="text-2xl font-black tracking-tighter text-[#b5cbff]">
            Havtel
          </button>
          <nav className="hidden md:flex items-center gap-10 text-sm">
            {['Cart', 'Shipping', 'Payment', 'Review'].map((step, index) => (
              <div
                key={step}
                className={`border-b-2 pb-2 ${index === 0 ? 'border-[#aac7ff] text-[#d6e4ff]' : 'border-transparent text-slate-400'}`}
              >
                {step}
              </div>
            ))}
          </nav>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[#b5cbff] transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Close shopping bag"
          >
            <X size={28} />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-8 py-14 md:px-16">
        <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_420px]">
          <section>
            <div className="mb-10 flex items-end justify-between gap-6">
              <div>
                <span className="mb-4 block text-xs font-bold uppercase tracking-[0.35em] text-[#aac7ff]">Your Selection</span>
                <h1 className="text-5xl font-black tracking-tighter md:text-6xl">Shopping Cart</h1>
              </div>
              <div className="text-sm uppercase tracking-[0.25em] text-slate-400">
                {cartItems.reduce((count, item) => count + item.quantity, 0)} Items
              </div>
            </div>

            <div className="space-y-6">
              {cartItems.map((item) => {
                const product = PRODUCTS.find((entry) => entry.id === item.productId);
                if (!product) return null;

                return (
                  <div
                    key={item.productId}
                    className="rounded-[28px] border border-white/5 bg-[#141b25] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.22)] md:p-7"
                  >
                    <div className="flex flex-col gap-6 md:flex-row md:items-center">
                      <div className="h-40 w-full overflow-hidden rounded-2xl bg-[#0a0f14] md:h-36 md:w-40">
                        <img
                          src={product.img}
                          alt={product.name}
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div>
                            <h2 className="text-3xl font-bold tracking-tight text-slate-100">{product.name}</h2>
                            <p className="mt-2 text-lg text-slate-400">{item.variant}</p>
                          </div>
                          <div className="text-3xl font-black text-[#aac7ff]">
                            {formatCurrency(product.price * item.quantity)}
                          </div>
                        </div>

                        <div className="mt-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                          <div className="inline-flex items-center gap-6 rounded-full bg-[#0b1016] px-6 py-4">
                            <button type="button" onClick={() => onDecreaseQuantity(item.productId)} className="text-xl text-slate-300 transition-colors hover:text-white">
                              <Minus size={18} />
                            </button>
                            <span className="min-w-4 text-center text-lg font-bold text-slate-100">{item.quantity}</span>
                            <button type="button" onClick={() => onIncreaseQuantity(item.productId)} className="text-xl text-slate-300 transition-colors hover:text-white">
                              <Plus size={18} />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.productId)}
                            className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[0.2em] text-slate-400 transition-colors hover:text-white"
                          >
                            <Trash2 size={16} />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {cartItems.length === 0 && (
                <div className="rounded-[28px] border border-white/5 bg-[#141b25] p-12 text-center">
                  <h2 className="text-3xl font-bold tracking-tight text-slate-100 mb-3">Your shopping bag is empty</h2>
                  <p className="text-slate-400 mb-8">Add products from the catalog to build your next HAVTEL order.</p>
                  <button
                    type="button"
                    onClick={onGoHome}
                    className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-br from-[#aac7ff] to-[#3e90ff] px-8 py-5 text-lg font-bold text-[#003064]"
                  >
                    Go to Home
                    <ArrowRight size={20} />
                  </button>
                </div>
              )}
            </div>
          </section>

          <aside className="rounded-[32px] border border-white/5 bg-[#141b25] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.3)] h-fit xl:sticky xl:top-10">
            <h2 className="mb-10 text-4xl font-black tracking-tight text-slate-100">Order Summary</h2>

            <div className="space-y-6 text-lg">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-300">Subtotal</span>
                <span className="font-semibold text-slate-100">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-300">Shipping</span>
                <span className="text-sm font-bold uppercase tracking-[0.22em] text-[#9dd6ff]">Calculated at next step</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-300">Tax</span>
                <span className="font-semibold text-slate-100">
                  {formatCurrency(tax)}
                </span>
              </div>
            </div>

            <div className="my-8 border-t border-white/5"></div>

            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="text-2xl font-bold text-slate-100">Total</div>
              </div>
              <div className="text-right">
                <div className="text-5xl font-black tracking-tight text-[#9ebeff]">
                  {formatCurrency(total)}
                </div>
                <div className="mt-2 text-sm uppercase tracking-[0.24em] text-slate-400">Including VAT</div>
              </div>
            </div>

            <div className="mt-10">
              <label className="mb-4 block text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
                Promotional Code
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  defaultValue="HAVTEL2026"
                  className="min-w-0 flex-1 rounded-2xl border border-white/5 bg-[#0b1016] px-5 py-4 text-base text-slate-300 focus:outline-none focus:border-[#aac7ff]/40"
                />
                <button type="button" className="rounded-2xl bg-white/12 px-6 py-4 text-lg font-bold text-[#aac7ff] transition-colors hover:bg-white/18">
                  Apply
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={onProceedToShipping}
              className="mt-10 w-full rounded-[22px] bg-gradient-to-r from-[#a9c7ff] to-[#4d93f7] px-8 py-6 text-lg font-black uppercase tracking-[0.22em] text-[#02182d] shadow-[0_24px_60px_rgba(77,147,247,0.35)] transition-transform hover:scale-[1.01]"
            >
              Proceed to Checkout
            </button>

            <div className="mt-10 flex items-center justify-center gap-8 text-slate-500">
              <CreditCard size={24} />
              <Wallet size={24} />
              <ShieldCheck size={24} />
            </div>
            <p className="mt-6 text-center text-sm uppercase tracking-[0.24em] text-slate-500">
              Secure SSL encryption & data protection guaranteed
            </p>
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

function ShippingView({
  authSession,
  cartItems,
  checkoutShippingAddress,
  shippingMethod,
  onShippingAddressChange,
  onShippingMethodChange,
  onClose,
  onGoHome,
  onBackToCart,
  onProceedToPayment,
}: {
  authSession: AuthSession;
  cartItems: CartItem[];
  checkoutShippingAddress: CheckoutShippingAddress | null;
  shippingMethod: 'priority' | 'express';
  onShippingAddressChange: (address: CheckoutShippingAddress) => void;
  onShippingMethodChange: (method: 'priority' | 'express') => void;
  onClose: () => void;
  onGoHome: () => void;
  onBackToCart: () => void;
  onProceedToPayment: () => void;
  key?: string;
}) {
  const shippingCost = shippingMethod === 'priority' ? 12 : 35;
  const subtotal = cartItems.reduce((sum, item) => {
    const product = PRODUCTS.find((entry) => entry.id === item.productId);
    return sum + (product?.price ?? 0) * item.quantity;
  }, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + shippingCost + tax;
  const summaryItem = cartItems[0]
    ? PRODUCTS.find((entry) => entry.id === cartItems[0].productId)
    : null;
  const summaryVariant = cartItems[0]?.variant ?? 'Configured order';
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
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
      className="min-h-screen bg-[#0f141b] text-slate-100"
    >
      <header className="border-b border-white/5 bg-[#10151d]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-8 py-7 md:px-16">
          <button type="button" onClick={onGoHome} className="text-2xl font-black tracking-tighter text-[#b5cbff]">
            Havtel
          </button>
          <nav className="hidden md:flex items-center gap-10 text-sm">
            {['Cart', 'Shipping', 'Payment', 'Review'].map((step, index) => (
              <button
                key={step}
                type="button"
                onClick={() => {
                  if (index === 0) onBackToCart();
                }}
                className={`border-b-2 pb-2 ${
                  index === 1 ? 'border-[#aac7ff] text-[#d6e4ff]' : index < 1 ? 'border-transparent text-slate-300 hover:text-white' : 'border-transparent text-slate-400'
                }`}
              >
                {step}
              </button>
            ))}
          </nav>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[#b5cbff] transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Close shipping"
          >
            <X size={28} />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-8 py-14 md:px-16">
        <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_400px]">
          <section>
            <div className="mb-10">
              <h1 className="text-5xl font-black tracking-tighter md:text-6xl">Shipping Logistics</h1>
              <p className="mt-5 max-w-2xl text-2xl leading-relaxed text-slate-400">
                Precision delivery for high-performance hardware. Enter your coordinates below.
              </p>
            </div>

            <div className="mb-14 flex items-center gap-4 md:gap-6">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#4d93f7] text-[#02182d]">
                <div className="h-2.5 w-2.5 rounded-full bg-[#02182d]"></div>
              </div>
              <div className="h-1 flex-1 rounded-full bg-[#4d93f7]"></div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#a9c7ff]/30 bg-[#141b25] shadow-[0_0_20px_rgba(169,199,255,0.2)]">
                <div className="h-3 w-3 rounded-full bg-[#a9c7ff]"></div>
              </div>
              <div className="h-1 flex-1 rounded-full bg-white/10"></div>
              <div className="h-1 flex-1 rounded-full bg-white/5"></div>
            </div>

            <form className="space-y-14">
              <div>
                <div className="mb-8 flex items-center gap-4">
                  <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-[#172131] px-2 text-xs font-black tracking-[0.2em] text-[#aac7ff]">00</span>
                  <h2 className="text-4xl font-bold tracking-tight">Saved Addresses</h2>
                </div>
                {addressError ? (
                  <p className="mb-6 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{addressError}</p>
                ) : null}
                {isLoadingAddresses ? (
                  <div className="rounded-[24px] border border-white/5 bg-[#0b1016] p-6 text-slate-400">Loading saved addresses...</div>
                ) : savedAddresses.length > 0 ? (
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {savedAddresses.map((address) => (
                      <button
                        key={address.id}
                        type="button"
                        onClick={() => applyAddressToForm(address)}
                        className={`rounded-[24px] border p-6 text-left transition-all ${
                          selectedAddressId === address.id
                            ? 'border-[#b9d1ff] bg-[#1b2129] shadow-[0_0_0_2px_rgba(185,209,255,0.15)]'
                            : 'border-white/5 bg-[#0b1016]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-xl font-bold text-slate-100">{address.label ?? 'Saved Address'}</div>
                            <div className="mt-2 text-sm text-slate-400">{address.contact_name ?? 'No contact name'}</div>
                          </div>
                          {address.is_default ? (
                            <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-200">
                              Default
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-4 text-sm leading-relaxed text-slate-300">
                          {[address.street, address.city, address.state, address.zip_code, address.country].filter(Boolean).join(', ')}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[24px] border border-white/5 bg-[#0b1016] p-6 text-slate-400">
                    No saved addresses found. You can still enter shipping details manually or add addresses from My Account.
                  </div>
                )}
              </div>

              <div>
                <div className="mb-8 flex items-center gap-4">
                  <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-[#172131] px-2 text-xs font-black tracking-[0.2em] text-[#aac7ff]">01</span>
                  <h2 className="text-4xl font-bold tracking-tight">Contact Information</h2>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-4 block text-sm font-bold uppercase tracking-[0.24em] text-slate-300">Email Address</span>
                    <input
                      type="email"
                      value={shippingForm.email}
                      onChange={(event) => setShippingForm((prev) => ({ ...prev, email: event.target.value }))}
                      placeholder="name@domain.tech"
                      className="w-full rounded-2xl border border-white/5 bg-[#0b1016] px-6 py-5 text-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#aac7ff]/40"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-4 block text-sm font-bold uppercase tracking-[0.24em] text-slate-300">Phone Number</span>
                    <input
                      type="tel"
                      value={shippingForm.phone}
                      onChange={(event) => setShippingForm((prev) => ({ ...prev, phone: event.target.value }))}
                      placeholder="+1 (555) 000-0000"
                      className="w-full rounded-2xl border border-white/5 bg-[#0b1016] px-6 py-5 text-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#aac7ff]/40"
                    />
                  </label>
                </div>
              </div>

              <div>
                <div className="mb-8 flex items-center gap-4">
                  <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-[#172131] px-2 text-xs font-black tracking-[0.2em] text-[#aac7ff]">02</span>
                  <h2 className="text-4xl font-bold tracking-tight">Destination Details</h2>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-4 block text-sm font-bold uppercase tracking-[0.24em] text-slate-300">First Name</span>
                    <input
                      value={shippingForm.firstName}
                      onChange={(event) => setShippingForm((prev) => ({ ...prev, firstName: event.target.value }))}
                      className="w-full rounded-2xl border border-white/5 bg-[#0b1016] px-6 py-5 text-xl text-slate-200 focus:outline-none focus:border-[#aac7ff]/40"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-4 block text-sm font-bold uppercase tracking-[0.24em] text-slate-300">Last Name</span>
                    <input
                      value={shippingForm.lastName}
                      onChange={(event) => setShippingForm((prev) => ({ ...prev, lastName: event.target.value }))}
                      className="w-full rounded-2xl border border-white/5 bg-[#0b1016] px-6 py-5 text-xl text-slate-200 focus:outline-none focus:border-[#aac7ff]/40"
                    />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="mb-4 block text-sm font-bold uppercase tracking-[0.24em] text-slate-300">Street Address</span>
                    <input
                      value={shippingForm.street}
                      onChange={(event) => setShippingForm((prev) => ({ ...prev, street: event.target.value }))}
                      placeholder="123 Tech Boulevard"
                      className="w-full rounded-2xl border border-white/5 bg-[#0b1016] px-6 py-5 text-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#aac7ff]/40"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-4 block text-sm font-bold uppercase tracking-[0.24em] text-slate-300">City</span>
                    <input
                      value={shippingForm.city}
                      onChange={(event) => setShippingForm((prev) => ({ ...prev, city: event.target.value }))}
                      className="w-full rounded-2xl border border-white/5 bg-[#0b1016] px-6 py-5 text-xl text-slate-200 focus:outline-none focus:border-[#aac7ff]/40"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-4 block text-sm font-bold uppercase tracking-[0.24em] text-slate-300">State / Province</span>
                    <input
                      value={shippingForm.state}
                      onChange={(event) => setShippingForm((prev) => ({ ...prev, state: event.target.value }))}
                      className="w-full rounded-2xl border border-white/5 bg-[#0b1016] px-6 py-5 text-xl text-slate-200 focus:outline-none focus:border-[#aac7ff]/40"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-4 block text-sm font-bold uppercase tracking-[0.24em] text-slate-300">Postal Code</span>
                    <input
                      value={shippingForm.postalCode}
                      onChange={(event) => setShippingForm((prev) => ({ ...prev, postalCode: event.target.value }))}
                      className="w-full rounded-2xl border border-white/5 bg-[#0b1016] px-6 py-5 text-xl text-slate-200 focus:outline-none focus:border-[#aac7ff]/40"
                    />
                  </label>
                </div>
              </div>

              <div>
                <div className="mb-8 flex items-center gap-4">
                  <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-[#172131] px-2 text-xs font-black tracking-[0.2em] text-[#aac7ff]">03</span>
                  <h2 className="text-4xl font-bold tracking-tight">Delivery Method</h2>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => onShippingMethodChange('priority')}
                    className={`rounded-[24px] border p-6 text-left transition-all ${
                      shippingMethod === 'priority'
                        ? 'border-[#b9d1ff] bg-[#1b2129] shadow-[0_0_0_2px_rgba(185,209,255,0.15)]'
                        : 'border-white/5 bg-[#0b1016]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-3xl font-bold tracking-tight text-slate-100">Priority Tech-Ship</div>
                        <div className="mt-2 text-xl text-slate-400">2-3 Business Days</div>
                      </div>
                      <div className="text-2xl font-semibold text-[#b9d1ff]">$12.00</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => onShippingMethodChange('express')}
                    className={`rounded-[24px] border p-6 text-left transition-all ${
                      shippingMethod === 'express'
                        ? 'border-[#b9d1ff] bg-[#1b2129] shadow-[0_0_0_2px_rgba(185,209,255,0.15)]'
                        : 'border-white/5 bg-[#0b1016]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-3xl font-bold tracking-tight text-slate-100">Quantum Express</div>
                        <div className="mt-2 text-xl text-slate-400">Next Day Guaranteed</div>
                      </div>
                      <div className="text-2xl font-semibold text-[#b9d1ff]">$35.00</div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={onBackToCart}
                  className="rounded-[22px] border border-white/10 px-10 py-6 text-2xl font-bold text-slate-200 transition-colors hover:bg-white/5"
                >
                  Back to Cart
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onShippingAddressChange(shippingForm);
                    onProceedToPayment();
                  }}
                  className="rounded-[22px] bg-gradient-to-r from-[#a9c7ff] to-[#4d93f7] px-10 py-6 text-2xl font-bold text-[#02182d] shadow-[0_24px_60px_rgba(77,147,247,0.35)] transition-transform hover:scale-[1.01]"
                >
                  Proceed to Payment
                </button>
              </div>
            </form>
          </section>

          <aside className="space-y-8">
            <div className="rounded-[32px] border border-white/5 bg-[#1d232c] p-7 shadow-[0_30px_80px_rgba(0,0,0,0.3)]">
              <div className="mb-6 text-sm font-bold uppercase tracking-[0.32em] text-slate-300">Cart Configuration</div>
              {summaryItem && (
                <>
                  <div className="flex gap-5">
                    <div className="h-24 w-24 overflow-hidden rounded-2xl bg-[#0b1016]">
                      <img src={summaryItem.img} alt={summaryItem.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold tracking-tight text-slate-100">{summaryItem.name}</h3>
                      <p className="mt-2 text-base text-slate-400">{summaryVariant}</p>
                      <p className="mt-3 text-2xl font-black text-[#9dd6ff]">{formatCurrency(summaryItem.price * (cartItems[0]?.quantity ?? 1))}</p>
                    </div>
                  </div>
                  <div className="my-7 border-t border-white/5"></div>
                </>
              )}

              <div className="space-y-4 text-lg">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Subtotal</span>
                  <span className="font-semibold text-slate-100">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Shipping</span>
                  <span className="font-semibold text-slate-100">{formatCurrency(shippingCost)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Tax (Est.)</span>
                  <span className="font-semibold text-slate-100">{formatCurrency(tax)}</span>
                </div>
              </div>

              <div className="my-7 border-t border-white/5"></div>

              <div className="flex items-end justify-between gap-4">
                <span className="text-sm font-bold uppercase tracking-[0.28em] text-[#b5cbff]">Grand Total</span>
                <span className="text-5xl font-black tracking-tight text-slate-100">{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/5 bg-[#1b2129] p-7">
              <div className="flex items-center gap-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#123246] text-[#9dd6ff]">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <div className="text-xl font-bold text-slate-100">Encrypted Transaction</div>
                  <div className="mt-1 text-sm text-slate-400">Havtel Secure Gate v2.4 Active</div>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[32px] border border-white/5 min-h-[250px] bg-[#0c1118]">
              <img
                src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80"
                alt="Hardware ecosystem"
                className="absolute inset-0 h-full w-full object-cover opacity-75"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,8,12,0.05),rgba(4,8,12,0.7))]"></div>
              <div className="absolute bottom-6 left-6 text-sm font-bold uppercase tracking-[0.38em] text-[#d5e8ff]">
                Hardware Ecosystem
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

function PaymentView({
  cartItems,
  shippingMethod,
  onClose,
  onGoHome,
  onBackToShipping,
  onBackToCart,
  onProceedToReview,
}: {
  cartItems: CartItem[];
  shippingMethod: 'priority' | 'express';
  onClose: () => void;
  onGoHome: () => void;
  onBackToShipping: () => void;
  onBackToCart: () => void;
  onProceedToReview: () => void;
  key?: string;
}) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');
  const [saveCard, setSaveCard] = useState(true);
  const shippingCost = shippingMethod === 'priority' ? 12 : 35;
  const shippingLabel = shippingMethod === 'priority' ? 'Priority Tech-Ship' : 'Quantum Express';
  const subtotal = cartItems.reduce((sum, item) => {
    const product = PRODUCTS.find((entry) => entry.id === item.productId);
    return sum + (product?.price ?? 0) * item.quantity;
  }, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + shippingCost + tax;
  const summaryItem = cartItems[0]
    ? PRODUCTS.find((entry) => entry.id === cartItems[0].productId)
    : null;
  const summaryVariant = cartItems[0]?.variant ?? 'Configured order';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[#0f141b] text-slate-100"
    >
      <header className="border-b border-white/5 bg-[#10151d]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-8 py-7 md:px-16">
          <button type="button" onClick={onGoHome} className="text-2xl font-black tracking-tighter text-[#b5cbff]">
            Havtel
          </button>
          <nav className="hidden md:flex items-center gap-10 text-sm">
            {['Cart', 'Shipping', 'Payment', 'Review'].map((step, index) => (
              <button
                key={step}
                type="button"
                onClick={() => {
                  if (index === 0) onBackToCart();
                  if (index === 1) onBackToShipping();
                }}
                className={`border-b-2 pb-2 ${
                  index === 2 ? 'border-[#aac7ff] text-[#d6e4ff]' : index < 2 ? 'border-transparent text-slate-300 hover:text-white' : 'border-transparent text-slate-400'
                }`}
              >
                {step}
              </button>
            ))}
          </nav>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[#b5cbff] transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Close payment"
          >
            <X size={28} />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-8 py-14 md:px-16">
        <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_430px]">
          <section className="space-y-10">
            <div>
              <h1 className="text-5xl font-black tracking-tighter text-slate-100 drop-shadow-[0_0_18px_rgba(169,199,255,0.18)] md:text-6xl">
                Payment Method
              </h1>
              <p className="mt-5 max-w-3xl text-2xl text-slate-400">
                Select your preferred way to complete the acquisition.
              </p>
            </div>

            <div className="inline-flex rounded-[22px] bg-[#171d26] p-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`inline-flex items-center gap-3 rounded-[18px] px-10 py-5 text-2xl font-bold transition-all ${
                  paymentMethod === 'card' ? 'bg-[#232a34] text-[#b9d1ff]' : 'text-slate-300 hover:text-white'
                }`}
              >
                <CreditCard size={22} />
                Credit Card
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('paypal')}
                className={`inline-flex items-center gap-3 rounded-[18px] px-10 py-5 text-2xl font-bold transition-all ${
                  paymentMethod === 'paypal' ? 'bg-[#232a34] text-[#b9d1ff]' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Wallet size={22} />
                PayPal
              </button>
            </div>

            <div className="rounded-[30px] border border-white/5 bg-[#20252d] p-8 md:p-10">
              <div className="grid grid-cols-1 gap-8">
                <label className="block">
                  <span className="mb-4 block text-sm font-bold uppercase tracking-[0.26em] text-slate-300">Cardholder Name</span>
                  <input
                    type="text"
                    placeholder="ALEXANDER VANCE"
                    className="w-full rounded-2xl border border-white/5 bg-[#0b1016] px-7 py-5 text-2xl text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-[#aac7ff]/40"
                  />
                </label>

                <label className="block">
                  <span className="mb-4 block text-sm font-bold uppercase tracking-[0.26em] text-slate-300">Card Number</span>
                  <div className="flex items-center rounded-2xl border border-white/5 bg-[#0b1016] px-7 py-5">
                    <input
                      type="text"
                      placeholder="0000 0000 0000 0000"
                      className="w-full bg-transparent text-2xl text-slate-200 placeholder:text-slate-600 focus:outline-none"
                    />
                    <CreditCard size={24} className="text-slate-500" />
                  </div>
                </label>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-4 block text-sm font-bold uppercase tracking-[0.26em] text-slate-300">Expiry Date</span>
                    <input
                      type="text"
                      placeholder="MM / YY"
                      className="w-full rounded-2xl border border-white/5 bg-[#0b1016] px-7 py-5 text-2xl text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-[#aac7ff]/40"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-4 block text-sm font-bold uppercase tracking-[0.26em] text-slate-300">CVV</span>
                    <input
                      type="password"
                      placeholder="•••"
                      className="w-full rounded-2xl border border-white/5 bg-[#0b1016] px-7 py-5 text-2xl text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-[#aac7ff]/40"
                    />
                  </label>
                </div>

                <label className="inline-flex items-center gap-4 pt-2 text-xl text-slate-300">
                  <button
                    type="button"
                    onClick={() => setSaveCard((prev) => !prev)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                      saveCard ? 'border-[#5878b8] bg-[#253651] text-[#b5cbff]' : 'border-white/10 bg-[#0f141b] text-transparent'
                    }`}
                  >
                    <span className="text-base">✓</span>
                  </button>
                  Save this card for future high-speed transactions
                </label>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/5 bg-[#161c24] p-8">
              <div className="flex items-center gap-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#263246] text-[#b5cbff]">
                  <Lock size={28} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-100">Secure Encryption Active</div>
                  <div className="mt-2 text-xl text-slate-400">
                    Your financial data is processed via 256-bit AES military-grade encryption.
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-8">
            <div className="rounded-[32px] border border-white/5 bg-[#232831] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.3)]">
              <h2 className="mb-10 text-4xl font-black tracking-tight text-[#b9d1ff]">Order Manifest</h2>
              {summaryItem && (
                <>
                  <div className="flex gap-5">
                    <div className="h-28 w-28 overflow-hidden rounded-2xl bg-[#0b1016]">
                      <img src={summaryItem.img} alt={summaryItem.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold tracking-tight text-slate-100">{summaryItem.name}</h3>
                      <p className="mt-2 text-xl text-slate-400">{summaryVariant}</p>
                      <p className="mt-3 text-2xl font-black text-[#9dd6ff]">{formatCurrency(summaryItem.price * (cartItems[0]?.quantity ?? 1))}</p>
                    </div>
                  </div>
                  <div className="my-8 border-t border-white/5"></div>
                </>
              )}

              <div className="space-y-5 text-xl">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Subtotal</span>
                  <span className="text-slate-100">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Shipping ({shippingLabel})</span>
                  <span className="text-[#9dd6ff]">{formatCurrency(shippingCost)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Estimated Taxes</span>
                  <span className="text-slate-100">{formatCurrency(tax)}</span>
                </div>
              </div>

              <div className="my-8 border-t border-white/5"></div>

              <div className="flex items-end justify-between gap-4">
                <span className="text-2xl text-slate-300">Total Amount</span>
                <span className="text-6xl font-black tracking-tight text-[#a9c7ff]">{formatCurrency(total)}</span>
              </div>

              <button
                type="button"
                onClick={onProceedToReview}
                className="mt-10 w-full rounded-[24px] bg-gradient-to-r from-[#a9c7ff] to-[#4d93f7] px-8 py-6 text-2xl font-bold text-[#03192f] shadow-[0_24px_60px_rgba(77,147,247,0.35)] transition-transform hover:scale-[1.01]"
              >
                Confirm Acquisition →
              </button>

              <p className="mt-8 text-center text-sm uppercase tracking-[0.32em] text-slate-400">
                By clicking, you agree to the Havtel protocols
              </p>
            </div>

            <div className="rounded-[28px] border border-cyan-500/25 bg-[#10303c] p-7">
              <div className="flex items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0f4354] text-[#a6ecff]">
                    <BadgePercent size={22} />
                  </div>
                  <span className="text-2xl text-slate-100">Apply Protocol Code</span>
                </div>
                <button type="button" className="flex h-11 w-11 items-center justify-center rounded-full border border-cyan-300/25 bg-[#174758] text-[#a6ecff] text-2xl">
                  +
                </button>
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

function ReviewView({
  cartItems,
  checkoutShippingAddress,
  shippingMethod,
  onClose,
  onGoHome,
  onBackToPayment,
  onBackToShipping,
  onBackToCart,
  onPlaceOrder,
}: {
  cartItems: CartItem[];
  checkoutShippingAddress: CheckoutShippingAddress | null;
  shippingMethod: 'priority' | 'express';
  onClose: () => void;
  onGoHome: () => void;
  onBackToPayment: () => void;
  onBackToShipping: () => void;
  onBackToCart: () => void;
  onPlaceOrder: () => void;
  key?: string;
}) {
  const shippingCost = shippingMethod === 'priority' ? 12 : 35;
  const shippingLabel = shippingMethod === 'priority' ? 'STANDARD EXPRESS (2-3 BUSINESS DAYS)' : 'QUANTUM EXPRESS (NEXT DAY)';
  const subtotal = cartItems.reduce((sum, item) => {
    const product = PRODUCTS.find((entry) => entry.id === item.productId);
    return sum + (product?.price ?? 0) * item.quantity;
  }, 0);
  const tax = subtotal * 0.0825;
  const total = subtotal + shippingCost + tax;
  const shippingName = [checkoutShippingAddress?.firstName, checkoutShippingAddress?.lastName].filter(Boolean).join(' ').trim();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-white text-[#1a3f6f]"
    >
      <header className="bg-[#1a3f6f]">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-8 py-5 md:px-16">
          <button type="button" onClick={onGoHome}>
            <HavtelLogo height={30} light />
          </button>
          <nav className="hidden md:flex items-center gap-10 text-sm">
            {['Cart', 'Shipping', 'Payment', 'Review'].map((step, index) => (
              <button
                key={step}
                type="button"
                onClick={() => {
                  if (index === 0) onBackToCart();
                  if (index === 1) onBackToShipping();
                  if (index === 2) onBackToPayment();
                }}
                className={`border-b-2 pb-2 font-bold tracking-[0.08em] uppercase text-xs transition-colors ${
                  index === 3 ? 'border-white text-white' : 'border-transparent text-white/60 hover:text-white'
                }`}
              >
                {step}
              </button>
            ))}
          </nav>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white">
            <X size={24} />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-8 py-14 md:px-16">
        <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_380px]">
          <section>
            <div className="mb-10 max-w-3xl">
              <h1 className="text-5xl font-black tracking-tight uppercase md:text-6xl text-[#1a3f6f]">Review Your Order</h1>
              <p className="mt-4 text-lg leading-relaxed text-[#4a5c72] italic">
                Please verify your details before confirming your purchase. Once placed, your items will be prepared for immediate dispatch.
              </p>
            </div>

            <div className="mb-6 flex items-center justify-between gap-4">
              <span className="text-xs font-bold uppercase tracking-[0.28em] text-[#4a5c72]">Items in Shipment</span>
              <button type="button" onClick={onBackToCart} className="text-sm font-bold text-[#1a3f6f] hover:underline">Edit Cart</button>
            </div>

            <div className="space-y-5">
              {cartItems.map((item) => {
                const product = PRODUCTS.find((entry) => entry.id === item.productId);
                if (!product) return null;

                return (
                  <div key={item.productId} className="rounded-2xl bg-[#255a8a] p-6 text-white">
                    <div className="flex flex-col gap-5 md:flex-row">
                      <div className="h-32 w-32 overflow-hidden rounded-xl bg-[#1f4d80] shrink-0">
                        <img src={product.img} alt={product.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col gap-3 md:flex-row md:justify-between">
                          <div>
                            <h2 className="text-2xl font-bold tracking-tight text-white">{product.name}</h2>
                            <p className="mt-1 text-base text-blue-100/70">{item.variant}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-black text-white">{formatCurrency(product.price * item.quantity)}</div>
                            <div className="mt-1 text-sm text-blue-100/70">Qty:{item.quantity}</div>
                          </div>
                        </div>
                        <div className="mt-5 flex flex-wrap gap-2">
                          <span className="rounded-md bg-white/20 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-white">In Stock</span>
                          <span className="rounded-md bg-white/20 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-white">
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
              <div className="rounded-2xl bg-[#255a8a] p-7">
                <div className="mb-6 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-[0.28em] text-blue-100/70">Shipping Address</span>
                  <button type="button" onClick={onBackToShipping} className="text-sm font-bold text-white hover:underline">Edit</button>
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-lg text-white">{shippingName || 'Shipping contact not set'}</p>
                  <p className="text-blue-100/80">{checkoutShippingAddress?.street || 'Street address not set'}</p>
                  <p className="text-blue-100/80">
                    {[checkoutShippingAddress?.city, checkoutShippingAddress?.state, checkoutShippingAddress?.postalCode].filter(Boolean).join(', ') || 'City / region not set'}
                  </p>
                  <p className="text-blue-100/80">{checkoutShippingAddress?.country || 'Country not set'}</p>
                </div>
                <div className="mt-6 border-t border-white/20 pt-5">
                  <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-100/70">
                    <Truck size={14} />
                    {shippingLabel}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-[#255a8a] p-7">
                <div className="mb-6 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-[0.28em] text-blue-100/70">Payment Method</span>
                  <button type="button" onClick={onBackToPayment} className="text-sm font-bold text-white hover:underline">Edit</button>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 text-white">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-white">Visa ending in 8842</div>
                    <div className="text-sm text-blue-100/70">Expires 12/26</div>
                  </div>
                </div>
                <div className="mt-6 border-t border-white/20 pt-5">
                  <div className="text-xs font-bold uppercase tracking-[0.16em] text-blue-100/70">Billing Address</div>
                  <div className="mt-1 text-sm text-blue-100/80">Same as shipping adress</div>
                </div>
              </div>
            </div>
          </section>

          <aside className="rounded-2xl border-4 border-[#1a3f6f] bg-white p-7 shadow-[0_4px_20px_rgba(26,63,111,0.08)] h-fit">
            <h2 className="mb-8 text-2xl font-bold tracking-tight text-[#1a3f6f]">Order Summary</h2>
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-[0.2em] text-[#6b7c8d]">Subtotal</span><span className="font-semibold text-[#1a3f6f]">{formatCurrency(subtotal)}</span></div>
              <div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-[0.2em] text-[#6b7c8d]">Shipping</span><span className="font-semibold text-[#1a3f6f]">{formatCurrency(shippingCost)}</span></div>
              <div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-[0.2em] text-[#6b7c8d]">Estimated Tax</span><span className="font-semibold text-[#1a3f6f]">{formatCurrency(tax)}</span></div>
            </div>
            <div className="my-6 border-t border-[#1a3f6f]/20"></div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-lg font-bold uppercase tracking-[0.12em] text-[#1a3f6f]">Total</span>
              <span className="text-4xl font-black tracking-tight text-[#1a3f6f]">{formatCurrency(total)}</span>
            </div>
            <button
              type="button"
              onClick={onPlaceOrder}
              className="mt-8 w-full rounded-xl bg-[#1a3f6f] px-8 py-4 text-sm font-bold uppercase tracking-[0.12em] text-white shadow-[0_4px_16px_rgba(26,63,111,0.3)] transition-all hover:bg-[#15345c] hover:shadow-[0_6px_20px_rgba(26,63,111,0.4)]"
            >
              Place Your Order
            </button>
            <p className="mt-5 text-xs leading-relaxed text-[#6b7c8d]">
              By clicking "Place Your Order", you agree to Havtel's Termes of Service and Privacy Policy.
            </p>
            <div className="mt-5 rounded-xl bg-[#255a8a] p-5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/20 text-white">
                  <ShieldCheck size={16} />
                </div>
                <p className="text-xs leading-relaxed text-blue-100/80">
                  Secure checkout with AES-256 encryption. Your payment information is never stored on our servers.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <footer className="bg-[#1a3f6f] px-8 py-8 md:px-16">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">© 2026 HAVTEL CORP. ALL RIGHTS RESERVED.</div>
          <div className="flex flex-wrap gap-6 text-xs font-bold uppercase tracking-[0.2em] text-white/50">
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
      <header className="border-b border-white/5 bg-[#10151d]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-8 py-7 md:px-16">
          <button type="button" onClick={onGoHome} className="text-2xl font-black tracking-tighter text-[#b5cbff]">Havtel</button>
          <nav className="hidden md:flex items-center gap-10 text-sm">
            {['Cart', 'Shipping', 'Payment', 'Review'].map((step, index) => (
              <div key={step} className={`border-b-2 pb-2 ${index === 3 ? 'border-[#aac7ff] text-[#d6e4ff]' : 'border-transparent text-slate-300'}`}>
                {step}
              </div>
            ))}
          </nav>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-[#b5cbff] transition-colors hover:bg-white/5 hover:text-white">
            <X size={28} />
          </button>
        </div>
      </header>

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
  const subtotal = cartItems.reduce((sum, item) => {
    const product = PRODUCTS.find((entry) => entry.id === item.productId);
    return sum + (product?.price ?? 0) * item.quantity;
  }, 0);
  const shippingCost = shippingMethod === 'priority' ? 12 : 35;
  const tax = subtotal * 0.08;
  const total = subtotal + shippingCost + tax;
  const trackingSteps = [
    { key: 'confirmed', title: 'Order Confirmed', detail: 'Payment verified and order created in the Havtel system.' },
    { key: 'processing', title: 'Hardware Assembly', detail: 'Components are being prepared and packaged for dispatch.' },
    { key: 'in_transit', title: 'In Transit', detail: 'Carrier manifest created and shipment is on the move.' },
    { key: 'delivered', title: 'Delivered', detail: 'Final delivery to your registered destination.' },
  ];

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
      <header className="border-b border-white/5 bg-[#10151d]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-8 py-7 md:px-16">
          <button type="button" onClick={onGoHome} className="text-2xl font-black tracking-tighter text-[#b5cbff]">Havtel</button>
          <div className="hidden md:flex items-center gap-10 text-sm text-slate-300">
            <span className="border-b-2 border-[#aac7ff] pb-2 text-[#d6e4ff]">Tracking</span>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-[#b5cbff] transition-colors hover:bg-white/5 hover:text-white">
            <X size={28} />
          </button>
        </div>
      </header>

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
              <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="text-sm font-bold uppercase tracking-[0.3em] text-slate-400">Current Status</div>
                  <div className="mt-3 text-4xl font-black capitalize text-[#9dd6ff]">{order?.status?.replaceAll('_', ' ') ?? 'Loading'}</div>
                </div>
                <div className="text-xl text-slate-400">{order?.tracking_code ? `Tracking code: ${order.tracking_code}` : 'Tracking code pending'}</div>
              </div>

              <div className="space-y-8">
                {trackingSteps.map((step, index) => {
                  const currentIndex = Math.max(0, trackingSteps.findIndex((entry) => entry.key === (order?.status ?? 'confirmed')));
                  const done = index < currentIndex || (index === currentIndex && step.key !== order?.status);
                  const current = step.key === order?.status;
                  return (
                  <div key={step.title} className="flex gap-5">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full ${
                          done ? 'bg-[#9ee3ff] text-[#041521]' : current ? 'bg-[#223b53] text-[#b9d1ff] ring-4 ring-[#223b53]/40' : 'bg-[#252d39] text-slate-500'
                        }`}
                      >
                        {done ? <Check size={22} /> : <div className="h-3 w-3 rounded-full bg-current"></div>}
                      </div>
                      {index < trackingSteps.length - 1 && (
                        <div className={`mt-3 h-20 w-1 rounded-full ${done ? 'bg-[#5abaf0]' : 'bg-white/8'}`}></div>
                      )}
                    </div>
                    <div className="pt-1">
                      <h2 className="text-2xl font-bold text-slate-100">{step.title}</h2>
                      <p className="mt-2 max-w-2xl text-xl leading-relaxed text-slate-400">{step.detail}</p>
                    </div>
                  </div>
                )})}
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
                <div className="flex items-center justify-between"><span className="text-slate-300">Subtotal</span><span>{formatCurrency(Number(order?.subtotal_amount ?? subtotal))}</span></div>
                <div className="flex items-center justify-between"><span className="text-slate-300">Shipping</span><span>{formatCurrency(Number(order?.shipping_amount ?? shippingCost))}</span></div>
                <div className="flex items-center justify-between"><span className="text-slate-300">Tax</span><span>{formatCurrency(Number(order?.tax_amount ?? tax))}</span></div>
              </div>
              <div className="my-8 border-t border-white/5"></div>
              <div className="flex items-end justify-between gap-4">
                <span className="text-2xl font-bold text-slate-100">Total</span>
                <span className="text-5xl font-black tracking-tight text-[#a9c7ff]">{formatCurrency(Number(order?.total_amount ?? total))}</span>
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
  product,
  onAddToCart,
  onBackToShop,
  onProductSelect,
}: {
  product: Product;
  onAddToCart: (name: string) => void;
  onBackToShop: () => void;
  onProductSelect: (productId: number) => void;
  key?: string;
}) {
  const [selectedTab, setSelectedTab] = useState<'description' | 'specs' | 'reviews'>('description');
  const [selectedConfig, setSelectedConfig] = useState('16-Core / 32-Thread');
  const [selectedImage, setSelectedImage] = useState(0);
  const gallery = [product.img, PRODUCTS[1]?.img, PRODUCTS[6]?.img, PRODUCTS[3]?.img].filter(Boolean);
  const relatedProducts = PRODUCTS.filter((item) => item.id !== product.id).slice(0, 4);
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
      className="pt-20 min-h-screen bg-[#0f141b]"
    >
      <section className="px-6 py-10 md:px-12 xl:px-20">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#aac7ff]">Flagship Core</span>
            <button type="button" onClick={onBackToShop} className="ml-4 text-sm text-slate-400 hover:text-white">
              Back to Catalog
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,0.92fr)_560px] xl:items-start">
          <div>
            <div className="rounded-[30px] border border-white/5 bg-[#151b23] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.24)] xl:max-w-[720px]">
              <div className="aspect-[0.96/0.82] overflow-hidden rounded-[24px] bg-[#0a0f14]">
                <img src={gallery[selectedImage]} alt={product.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              </div>
            </div>

            <div className="mt-6 flex gap-4 overflow-x-auto pb-2">
              {gallery.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  className={`h-20 min-w-20 overflow-hidden rounded-2xl border p-1 transition-all md:h-24 md:min-w-24 ${
                    selectedImage === index ? 'border-[#aac7ff] bg-[#182130]' : 'border-white/8 bg-[#121821]'
                  }`}
                >
                  <img src={image} alt={`${product.name} preview ${index + 1}`} className="h-full w-full rounded-xl object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="inline-flex rounded-full bg-[#13273b] px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-[#b5cbff]">
              Flagship Core
            </span>
            <h1 className="mt-4 text-5xl font-black tracking-tighter text-slate-100 md:text-6xl">{product.name}</h1>
            <div className="mt-3 flex items-center gap-3">
              <span className="text-4xl font-black text-[#d8e7ff]">{product.priceString}</span>
              <span className="text-sm uppercase tracking-[0.22em] text-emerald-300">In Stock - Limited Edition</span>
            </div>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-slate-400">
              Engineered for the next generation of computational dominance. The {product.name} leverages Havtel's proprietary photonic-bridge architecture to deliver unprecedented throughput.
            </p>

            <div className="mt-10">
              <div className="mb-4 text-xs font-bold uppercase tracking-[0.28em] text-slate-300">Select Configuration</div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  '16-Core / 32-Thread',
                  '24-Core / 48-Thread',
                ].map((config) => (
                  <button
                    key={config}
                    type="button"
                    onClick={() => setSelectedConfig(config)}
                    className={`rounded-2xl border px-5 py-4 text-left transition-all ${
                      selectedConfig === config ? 'border-[#aac7ff] bg-[#172131]' : 'border-white/8 bg-[#141a22]'
                    }`}
                  >
                    <div className="text-sm font-bold text-slate-100">{config}</div>
                    <div className="mt-1 text-xs text-slate-400">{config.includes('24-Core') ? 'X-8200 Ultra Edition' : 'Standard Performance'}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <button
                type="button"
                onClick={() => onAddToCart(product.name)}
                className="w-full rounded-[18px] bg-gradient-to-r from-[#a9c7ff] to-[#4d93f7] px-8 py-5 text-lg font-bold text-[#03192f] shadow-[0_20px_50px_rgba(77,147,247,0.28)]"
              >
                Add to Cart
              </button>
              <button type="button" className="w-full rounded-[18px] border border-white/10 px-8 py-5 text-lg font-bold text-slate-200 transition-colors hover:bg-white/5">
                Pre-order Now
              </button>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
              <div className="rounded-2xl border border-white/5 bg-[#141a22] px-3 py-4">Secure Payment</div>
              <div className="rounded-2xl border border-white/5 bg-[#141a22] px-3 py-4">3 Year Warranty</div>
              <div className="rounded-2xl border border-white/5 bg-[#141a22] px-3 py-4">Global Priority</div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-6 z-30 mt-6 rounded-[24px] border border-white/8 bg-[#151b23]/95 px-5 py-4 shadow-[0_24px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl md:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 overflow-hidden rounded-xl bg-[#0b1016]">
                <img src={product.img} alt={product.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-100">{product.name}</div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{selectedConfig} configuration</div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Subtotal</div>
                <div className="text-2xl font-black text-[#d8e7ff]">{product.priceString}</div>
              </div>
              <button
                type="button"
                onClick={() => onAddToCart(product.name)}
                className="rounded-2xl bg-gradient-to-r from-[#a9c7ff] to-[#4d93f7] px-8 py-4 text-base font-bold text-[#03192f]"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 border-b border-white/8">
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
                className={`border-b-2 px-1 py-4 text-sm font-bold ${selectedTab === id ? 'border-[#aac7ff] text-[#d8e7ff]' : 'border-transparent text-slate-400'}`}
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
                <h2 className="text-4xl font-black tracking-tight text-slate-100">The Future of Compute</h2>
                <p className="mt-6 max-w-4xl text-lg leading-relaxed text-slate-400">
                  The Havtel Quantum X-8000 isn't just a processor; it's a paradigm shift. Utilizing the Lumina v4 microarchitecture, we've optimized every nanometer to ensure that bottlenecking is a relic of the past. Whether you're compiling massive codebases, rendering 8K cinema-grade visuals, or training deep neural networks, the X-8000 adapts in real-time.
                </p>
                <blockquote className="mt-8 max-w-2xl rounded-[24px] border border-white/5 bg-[#161c24] px-6 py-5 text-base italic leading-relaxed text-slate-300">
                  "The benchmark results for the X-8000 defy current expectations of a co-equal silicon. It's in a league of its own."
                  <div className="mt-3 text-xs not-italic font-bold uppercase tracking-[0.2em] text-slate-500">Technexus Review Lab</div>
                </blockquote>
              </>
            )}

            {selectedTab === 'specs' && (
              <>
                <h2 className="text-4xl font-black tracking-tight text-slate-100">Technical Specifications</h2>
                <div className="mt-8 grid grid-cols-1 gap-y-5 sm:grid-cols-2">
                  {specifications.map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between gap-6 border-b border-white/5 py-4 sm:pr-8">
                      <span className="text-sm text-slate-400">{label}</span>
                      <span className="text-sm font-bold text-slate-100">{value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {selectedTab === 'reviews' && (
              <>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-4xl font-black tracking-tight text-slate-100">User Feedback</h2>
                    <div className="mt-3 flex items-center gap-3 text-slate-300">
                      <div className="flex gap-1 text-[#aac7ff]">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={16} fill="currentColor" />)}</div>
                      <span className="text-sm">4.9/5 (Based on 142 reviews)</span>
                    </div>
                  </div>
                  <button type="button" className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-bold text-slate-200 transition-colors hover:bg-white/5">
                    Write a Review
                  </button>
                </div>
                <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
                  {[
                    ['Marcus Jensen', 'Lead 3D Artist', 'The transition from my previous gen to the Quantum X-8000 was night and day. Render times in Blender dropped by nearly 45%.'],
                    ['Sarah Lin', 'Systems Engineer', 'Installation was a breeze. The thermals are incredibly stable even under 100% load during long simulation runs.'],
                    ['David Byrne', 'Game Developer', 'High price tag, but you absolutely get what you pay for. The multi-threaded performance is unmatched in the consumer space.'],
                  ].map(([name, role, review]) => (
                    <div key={name} className="rounded-[24px] border border-white/5 bg-[#161c24] p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex gap-1 text-[#aac7ff]">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} fill="currentColor" />)}</div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Verified</span>
                      </div>
                      <p className="text-sm leading-relaxed text-slate-300">"{review}"</p>
                      <div className="mt-5">
                        <div className="text-sm font-bold text-slate-100">{name}</div>
                        <div className="text-xs text-slate-500">{role}</div>
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
                <div key={label} className="flex items-center justify-between gap-6 border-b border-white/5 py-3">
                  <span className="text-sm text-slate-400">{label}</span>
                  <span className="text-sm font-bold text-slate-100">{value}</span>
                </div>
              ))}
          </div>
        </div>

        <section className="mt-16 overflow-hidden rounded-[34px] border border-white/5 bg-[radial-gradient(circle_at_top_right,rgba(55,116,173,0.18),transparent_30%),#151b23]">
          <div className="grid grid-cols-1 gap-10 px-8 py-10 md:grid-cols-[0.85fr_1.15fr] md:px-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.32em] text-[#aac7ff]">Innovative Cooling</span>
              <h2 className="mt-5 text-5xl font-black tracking-tighter text-slate-100">AI-Driven Thermal Management</h2>
              <p className="mt-6 text-lg leading-relaxed text-slate-400">
                The X-8000 monitors its own thermal signatures at 10,000 intervals per second. Our neural-mesh adjusts power delivery dynamically, ensuring you hit peak performance without the thermal throttle common in standard high-performance chips.
              </p>
              <button type="button" className="mt-8 inline-flex items-center gap-3 text-sm font-bold text-[#b9d1ff]">
                Learn about Havtel Mesh Technology <ArrowRight size={16} />
              </button>
            </div>
            <div className="min-h-[320px] rounded-[28px] bg-[radial-gradient(circle_at_center,rgba(77,147,247,0.22),transparent_30%),linear-gradient(135deg,#10161f,#0b1016)]"></div>
          </div>
        </section>

        <section className="mt-20">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-4xl font-black tracking-tight text-slate-100">Complete Your Build</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {relatedProducts.map((related) => (
              <button
                key={related.id}
                type="button"
                onClick={() => onProductSelect(related.id)}
                className="rounded-[24px] border border-white/5 bg-[#161c24] p-5 text-left transition-all hover:border-[#aac7ff]/30"
              >
                <div className="aspect-square overflow-hidden rounded-2xl bg-[#0b1016]">
                  <img src={related.img} alt={related.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-100">{related.name}</h3>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{related.series}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-black text-slate-100">{related.priceString}</span>
                  <span className="rounded-lg bg-white/5 px-3 py-2 text-xs font-bold text-[#aac7ff]">View</span>
                </div>
              </button>
            ))}
          </div>
        </section>
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
              onClick={() => window.location.hash = ''}
              className="rounded-[22px] border border-white/10 px-10 py-6 text-xl font-bold text-[#b9d1ff] transition-colors hover:bg-white/5"
            >
              Clear Hash
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-20 min-h-screen bg-[#0f141b]">
      <section className="relative overflow-hidden px-8 py-20 md:px-16">
        <div className="absolute inset-0">
          <div className="absolute left-[-8%] top-[12%] h-[420px] w-[420px] rounded-full bg-[#aac7ff]/10 blur-[140px]"></div>
          <div className="absolute right-[-8%] bottom-[10%] h-[360px] w-[360px] rounded-full bg-[#3e90ff]/10 blur-[120px]"></div>
        </div>
        <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 gap-10 xl:grid-cols-[0.95fr_520px]">
          <div className="pt-8">
            <span className="text-xs font-bold uppercase tracking-[0.34em] text-[#aac7ff]">Access Layer</span>
            <h1 className="mt-6 text-6xl font-black tracking-tighter text-slate-100 md:text-7xl">Welcome Back</h1>
            <p className="mt-6 max-w-2xl text-2xl leading-relaxed text-slate-400">
              Sign in to manage your account center, delivery contacts, order history, and saved checkout flow.
            </p>
            <button type="button" onClick={onGoHome} className="mt-10 text-lg font-bold text-[#b9d1ff] hover:text-white">
              Return Home
            </button>
          </div>
          <div className="rounded-[32px] border border-white/5 bg-[#1b2129] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.3)] md:p-10">
            <h2 className="text-4xl font-black tracking-tight text-slate-100">Login</h2>
            <form
              onSubmit={async (event) => {
                event.preventDefault();
                await onLogin({ email, password });
              }}
              className="mt-8 space-y-6"
            >
              <label className="block">
                <span className="mb-4 block text-sm font-bold uppercase tracking-[0.24em] text-slate-300">Email Address</span>
                <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@domain.tech" className="w-full rounded-2xl border border-white/5 bg-[#0b1016] px-6 py-5 text-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#aac7ff]/40" />
              </label>
              <label className="block">
                <span className="mb-4 block text-sm font-bold uppercase tracking-[0.24em] text-slate-300">Password</span>
                <input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" className="w-full rounded-2xl border border-white/5 bg-[#0b1016] px-6 py-5 text-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#aac7ff]/40" />
              </label>
              {errorMessage ? (
                <p className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{errorMessage}</p>
              ) : null}
              <div className="flex items-center justify-between gap-4 text-sm">
                <button type="button" onClick={onGoToForgot} className="font-bold text-[#b9d1ff] hover:text-white">Forgot password?</button>
                <button type="button" onClick={onGoToSignup} className="font-bold text-slate-400 hover:text-white">Create account</button>
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full rounded-[22px] bg-gradient-to-r from-[#a9c7ff] to-[#4d93f7] px-8 py-5 text-xl font-bold text-[#03192f] shadow-[0_24px_60px_rgba(77,147,247,0.35)] disabled:cursor-not-allowed disabled:opacity-70">
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

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-20 min-h-screen bg-[#0f141b]">
      <section className="relative overflow-hidden px-8 py-20 md:px-16">
        <div className="absolute inset-0">
          <div className="absolute left-[5%] top-[14%] h-[320px] w-[320px] rounded-full bg-[#aac7ff]/10 blur-[120px]"></div>
          <div className="absolute right-[0%] bottom-[10%] h-[380px] w-[380px] rounded-full bg-[#3e90ff]/8 blur-[120px]"></div>
        </div>
        <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 gap-10 xl:grid-cols-[0.95fr_560px]">
          <div className="pt-8">
            <span className="text-xs font-bold uppercase tracking-[0.34em] text-[#aac7ff]">Identity Setup</span>
            <h1 className="mt-6 text-6xl font-black tracking-tighter text-slate-100 md:text-7xl">Create Your Account</h1>
            <p className="mt-6 max-w-2xl text-2xl leading-relaxed text-slate-400">
              Join the Havtel ecosystem to save addresses, review orders, track shipments, and streamline future purchases.
            </p>
            <button type="button" onClick={onGoHome} className="mt-10 text-lg font-bold text-[#b9d1ff] hover:text-white">
              Return Home
            </button>
          </div>
          <div className="rounded-[32px] border border-white/5 bg-[#1b2129] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.3)] md:p-10">
            <h2 className="text-4xl font-black tracking-tight text-slate-100">Sign Up</h2>
            <form
              onSubmit={async (event) => {
                event.preventDefault();
                await onSignup({ accountType, firstName, lastName, companyName, email, password });
              }}
              className="mt-8 grid grid-cols-1 gap-6"
            >
              <div className="grid grid-cols-1 gap-3 rounded-[24px] border border-white/5 bg-[#141a22] p-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setAccountType('b2c')}
                  className={`rounded-2xl px-5 py-4 text-left transition-all ${
                    accountType === 'b2c'
                      ? 'bg-gradient-to-r from-[#a9c7ff] to-[#4d93f7] text-[#03192f]'
                      : 'bg-[#0b1016] text-slate-300 hover:bg-[#111823]'
                  }`}
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                    <CircleUserRound size={22} />
                  </div>
                  <div className="text-sm font-black uppercase tracking-[0.24em]">Personal</div>
                  <div className={`mt-2 text-sm ${accountType === 'b2c' ? 'text-[#0a2745]' : 'text-slate-400'}`}>
                    Create an individual account for personal purchases and saved preferences.
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType('b2b')}
                  className={`rounded-2xl px-5 py-4 text-left transition-all ${
                    accountType === 'b2b'
                      ? 'bg-gradient-to-r from-[#a9c7ff] to-[#4d93f7] text-[#03192f]'
                      : 'bg-[#0b1016] text-slate-300 hover:bg-[#111823]'
                  }`}
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                    <Building2 size={22} />
                  </div>
                  <div className="text-sm font-black uppercase tracking-[0.24em]">Company</div>
                  <div className={`mt-2 text-sm ${accountType === 'b2b' ? 'text-[#0a2745]' : 'text-slate-400'}`}>
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
                  className="w-full rounded-2xl border border-white/5 bg-[#0b1016] px-6 py-5 text-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#aac7ff]/40"
                />
              ) : (
                <>
                  <input required value={firstName} onChange={(event) => setFirstName(event.target.value)} placeholder="First name" className="w-full rounded-2xl border border-white/5 bg-[#0b1016] px-6 py-5 text-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#aac7ff]/40" />
                  <input required value={lastName} onChange={(event) => setLastName(event.target.value)} placeholder="Last name" className="w-full rounded-2xl border border-white/5 bg-[#0b1016] px-6 py-5 text-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#aac7ff]/40" />
                </>
              )}
              <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email address" className="w-full rounded-2xl border border-white/5 bg-[#0b1016] px-6 py-5 text-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#aac7ff]/40" />
              <input required type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Create password" className="w-full rounded-2xl border border-white/5 bg-[#0b1016] px-6 py-5 text-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#aac7ff]/40" />
              {errorMessage ? (
                <p className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{errorMessage}</p>
              ) : null}
              <button type="submit" disabled={isSubmitting} className="w-full rounded-[22px] bg-gradient-to-r from-[#a9c7ff] to-[#4d93f7] px-8 py-5 text-xl font-bold text-[#03192f] shadow-[0_24px_60px_rgba(77,147,247,0.35)] disabled:cursor-not-allowed disabled:opacity-70">
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </button>
              <button type="button" onClick={onGoToLogin} className="text-sm font-bold text-[#b9d1ff] hover:text-white">
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

function Home({ onShopClick, onProductSelect }: { onShopClick: () => void; onProductSelect: (productId: number) => void; key?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-20"
    >
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden px-8 md:px-24">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-[#aac7ff]/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-[#14d1ff]/5 rounded-full blur-[100px]"></div>
        </div>

        <div className="relative z-10 max-w-4xl">
          <span className="text-xs uppercase tracking-[0.3em] text-[#aac7ff] font-bold mb-6 block">Future of Infrastructure</span>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 text-slate-100 leading-[0.9]">
            Next-generation technology for <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#aac7ff] via-[#14d1ff] to-[#3e90ff]">modern infrastructure</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed">
            Experience innovation and performance for the digital luminary. Engineered for high-speed connectivity and unparalleled processing power.
          </p>
          <div className="flex flex-col sm:flex-row gap-6">
            <button 
              onClick={onShopClick}
              className="px-10 py-5 rounded-2xl bg-gradient-to-br from-[#aac7ff] to-[#3e90ff] text-[#003064] font-bold text-lg hover:shadow-[0_0_40px_rgba(62,144,255,0.3)] transition-all active:scale-95"
            >
              Explore Products
            </button>
            <button className="px-10 py-5 rounded-2xl border border-white/10 text-[#aac7ff] font-bold text-lg hover:bg-white/5 transition-all active:scale-95">
              Discover Solutions
            </button>
          </div>
        </div>

        <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden lg:block w-1/3 opacity-60">
          <img 
            alt="Server hardware" 
            className="w-full h-auto object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCeXEaeKk1WrUB63SMo-N0cvovLpsfDPgi_lU1uQn7WbOXEsvQd1e5Wa0mPxH01_MvWhnH23rVgSGBgySVbvxNZ1G5NRYL2iGiYvwJzUYAZA45IyNxd0WeyODidlBbA7SXhutS2ly2hnhVjsaR0vEtCtiDZ_qDu8vSqOh3ZlNZuQgY5Tw0RaA24azrde8u846g24ICmUxvB3RKn4x-raoDlGyz17gy9WleyEkbhSltX1Hl-0EmHTFLnWuS6CFp7i6DOkplqNArAwbtC"
            referrerPolicy="no-referrer"
          />
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-32 px-8 md:px-24 bg-[#181c21]">
        <div className="mb-20 text-center">
          <h2 className="text-4xl font-bold tracking-tight text-slate-100 mb-4">Curated Engineering</h2>
          <div className="h-1 w-24 bg-[#aac7ff] mx-auto rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { title: "Processors", desc: "Ultra-efficient multi-core compute engines.", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDp0KEdaGdGbkMYURtpl7ALxvrwOa4iLj3c8O4D8gHYYqUnkrad2_dtvDBKrCUH43eXN3bz0_UFSZnOp5yUlfvoWIDcyOve3usV2EcMerkkx1DcRmLscU3gcymcCTrcnNf5Pu9NYTZIgVho6mLrI4aI9ty5EAVVbkt14bT__UjoJMteub1sv_sK9hsm-vIN-pkFErL7mOMYatN1aLahjQxMdn0xsAVFeLNBga_s6IDgH9XzobThpSwOeSB0osXssqyTKoiNDQ9LcrKM" },
            { title: "Graphics", desc: "Real-time rendering at scale.", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAcuB_UEL0socYjiXJrmJfjieRWPCENBYpqcvEdmp1ruY7rpY0dHupkPIlUDD3JL2q4NjcLSaF2EuVBr22h89qTN0UzE7S_RvpXA6STywJ1Pp6gDRY8ShPRuCmcDLK71ctSO2eNO6KVCwpMVA1ByjmEIyUqMdxVGASvY1GSmXQKBb4wiGN9yMlvRqI-qgvoSluZAaSsDqn1yqhWYMYw1iDOiXrkwmaGhWCkQdET-FFXVenC-x5S1J_K4GV25sl4z3fRAYfJBzdJpTZl" },
            { title: "Memory", desc: "Low-latency high-bandwidth modules.", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCFdZRDgwUS5nKcimTjlsRKUe3kIBzmTQMNm6X2QdFI6JqOrWlso3geYu1kV5UKzsto5tCIdqEuYJeUEcl0bqD2JHXCH_hCDJ6ACsgGo1TzeuAKcR5BU9K3bkScipCQvki4QMt83a9XmX6DfKnVdP-fgC6A-owmF7Jx1dP1zpNFOYiWj8sfwAf-uMK745L70qKNojQDxbMS6z-GUyAnmn6td9TC_vMaDYf1DYR32cckwHFDDH0OovQQdJbcRP-cY5aEWIE8gtX2vYFi" },
            { title: "Networking", desc: "Enterprise-grade connectivity solutions.", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDSIJpFpMHRsS6REaRZytWom7r8oxl9phlKNLPwFpPru9GAwSMdUCoR3g0bLegLOsb6yHQjSOWXY404oqbxHBGO6uUstPK6FqiBdFGcHZvnGp9YfZcFEI5bG4w6zxVPxOrHL-fHu2j5JB5iJGaTXo1byCHkG8C_5lDLwPPFYQNK7CpqhOetrAAw5c82qD6x4LV7-5uUhO12qxj2Yjdgj9Evfte2YnV5BEKJZkFr0gOc_gvf42Gs5NuLYf8WoGuTvsy2qXR8qnrV39Gr" }
          ].map((cat, i) => (
            <div key={i} className="bg-[#262a30]/50 backdrop-blur-md p-8 rounded-2xl border border-white/5 hover:border-[#aac7ff]/30 transition-all group cursor-pointer">
              <div className="aspect-square mb-8 overflow-hidden rounded-xl bg-[#0a0e13]">
                <img 
                  alt={cat.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  src={cat.img}
                  referrerPolicy="no-referrer"
                />
              </div>
              <h3 className="text-2xl font-bold text-slate-100 mb-2">{cat.title}</h3>
              <p className="text-slate-400 mb-6 text-sm">{cat.desc}</p>
              <button onClick={onShopClick} className="text-[#aac7ff] font-bold text-xs tracking-widest uppercase flex items-center gap-2 group-hover:gap-4 transition-all">
                View More <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-32 px-8 md:px-24">
        <div className="flex justify-between items-end mb-16">
          <div>
            <h2 className="text-4xl font-bold tracking-tight text-slate-100 mb-4">Best Sellers</h2>
            <p className="text-slate-400">The most sought-after components in the industry.</p>
          </div>
          <button onClick={onShopClick} className="text-[#aac7ff] font-bold text-sm flex items-center gap-2 hover:gap-4 transition-all">
            View All Catalog <ChevronRight size={18} />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {PRODUCTS.slice(0, 4).map((prod) => (
            <div
              key={prod.id}
              onClick={() => onProductSelect(prod.id)}
              className="bg-[#1c2025]/50 border border-white/5 rounded-2xl overflow-hidden group hover:border-[#aac7ff]/30 transition-all cursor-pointer"
            >
              <div className="aspect-square relative overflow-hidden bg-[#0a0e13]">
                <img 
                  src={prod.img} 
                  alt={prod.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-6">
                <span className="text-[10px] font-black tracking-widest text-slate-500 mb-2 block">{prod.series}</span>
                <h3 className="text-lg font-bold text-slate-100 mb-6">{prod.name}</h3>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-black text-slate-100">{prod.priceString}</span>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      onProductSelect(prod.id);
                    }}
                    className="p-2 bg-white/5 rounded-lg text-slate-400 hover:bg-[#aac7ff] hover:text-[#003064] transition-all"
                  >
                    <ShoppingCart size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Promo Banner */}
      <section className="px-8 md:px-24 py-20">
        <div className="relative rounded-[40px] overflow-hidden bg-gradient-to-br from-[#1c2025] to-[#0a0e13] border border-white/5 p-12 md:p-24 flex flex-col md:flex-row items-center gap-12">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-[#aac7ff]/5 blur-[120px] pointer-events-none"></div>
          <div className="flex-1 relative z-10">
            <span className="bg-[#aac7ff]/10 text-[#aac7ff] px-4 py-1 rounded-full text-[10px] font-black tracking-widest mb-8 inline-block">FLAGSHIP RELEASE</span>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-100 mb-8 leading-none">Quantum <br/>X-Series</h2>
            <p className="text-slate-400 text-lg mb-12 max-w-md">The pinnacle of silicon engineering. 128 cores of pure, unadulterated processing power for the next generation of AI and rendering.</p>
            <button onClick={onShopClick} className="bg-white text-[#003064] px-10 py-5 rounded-2xl font-bold text-lg hover:bg-[#aac7ff] transition-all">
              Pre-order Now
            </button>
          </div>
          <div className="flex-1 relative z-10">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDp0KEdaGdGbkMYURtpl7ALxvrwOa4iLj3c8O4D8gHYYqUnkrad2_dtvDBKrCUH43eXN3bz0_UFSZnOp5yUlfvoWIDcyOve3usV2EcMerkkx1DcRmLscU3gcymcCTrcnNf5Pu9NYTZIgVho6mLrI4aI9ty5EAVVbkt14bT__UjoJMteub1sv_sK9hsm-vIN-pkFErL7mOMYatN1aLahjQxMdn0xsAVFeLNBga_s6IDgH9XzobThpSwOeSB0osXssqyTKoiNDQ9LcrKM" 
              alt="Quantum X-Series" 
              className="w-full h-auto drop-shadow-[0_0_50px_rgba(170,199,255,0.2)]"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </section>

      {/* Brand Trust */}
      <section className="py-32 px-8 md:px-24 border-t border-white/5">
        <div className="text-center mb-16">
          <p className="text-xs font-bold tracking-[0.3em] text-slate-500 uppercase">Trusted by Industry Leaders</p>
        </div>
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-30 grayscale hover:grayscale-0 transition-all">
          <div className="text-2xl font-black tracking-tighter">NVIDIA</div>
          <div className="text-2xl font-black tracking-tighter">INTEL</div>
          <div className="text-2xl font-black tracking-tighter">AMD</div>
          <div className="text-2xl font-black tracking-tighter">ASUS</div>
          <div className="text-2xl font-black tracking-tighter">CORSAIR</div>
        </div>
      </section>

    </motion.div>
  );
}

function Shop({ onAddToCart, onProductSelect }: { onAddToCart: (name: string) => void; onProductSelect: (productId: number) => void; key?: string }) {
  const [activeCategory, setActiveCategory] = useState('PROCESSORS');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Popularity');
  const [selectedBrands, setSelectedBrands] = useState<string[]>(['Havtel Core']);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const filteredProducts = PRODUCTS.filter(prod => {
    const matchesCategory = prod.category === activeCategory;
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         prod.series.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(prod.brand);
    return matchesCategory && matchesSearch && matchesBrand;
  }).sort((a, b) => {
    if (sortBy === 'Price: Low to High') return a.price - b.price;
    if (sortBy === 'Price: High to Low') return b.price - a.price;
    return 0; // Popularity (default order)
  });

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-20 px-4 md:px-12 flex flex-col md:flex-row gap-8 md:gap-12 min-h-screen relative"
    >
      {/* Mobile Sidebar Toggle */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed bottom-28 left-8 z-[60] w-14 h-14 bg-[#1c2025] border border-white/10 rounded-full flex items-center justify-center text-[#aac7ff] shadow-2xl"
      >
        <Search size={20} />
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed inset-0 z-[70] bg-[#101419] p-8 md:relative md:inset-auto md:z-0 md:bg-transparent md:p-0
        w-full md:w-64 flex-shrink-0 transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex justify-between items-center mb-12 md:block">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold block mb-2">Catalog</span>
            <span className="text-xs text-slate-400 font-medium">HIGH-PERFORMANCE HARDWARE</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400">
            <ChevronLeft size={24} />
          </button>
        </div>

        <nav className="space-y-2 mb-12">
          {[
            { id: 'PROCESSORS', icon: Cpu, label: 'PROCESSORS' },
            { id: 'GRAPHICS', icon: Monitor, label: 'GRAPHICS' },
            { id: 'MEMORY', icon: Database, label: 'MEMORY' },
            { id: 'STORAGE', icon: HardDrive, label: 'STORAGE' },
            { id: 'PERIPHERALS', icon: MousePointer2, label: 'PERIPHERALS' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-xs font-bold transition-all ${
                activeCategory === cat.id 
                ? 'bg-[#3e90ff]/10 text-[#aac7ff] border-l-2 border-[#aac7ff]' 
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
            >
              <cat.icon size={16} />
              {cat.label}
            </button>
          ))}
        </nav>

        <div className="space-y-8">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold block mb-6">Price Range</span>
            <div className="px-2">
              <div className="h-1 bg-white/10 rounded-full relative">
                <div className="absolute left-0 right-1/4 h-full bg-[#3e90ff] rounded-full"></div>
                <div className="absolute left-[75%] top-1/2 -translate-y-1/2 w-4 h-4 bg-[#aac7ff] rounded-full shadow-[0_0_10px_rgba(170,199,255,0.5)] cursor-pointer"></div>
              </div>
              <div className="flex justify-between mt-4 text-[10px] text-slate-500 font-bold">
                <span>$0</span>
                <span>$2,500</span>
              </div>
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold block mb-6">Brands</span>
            <div className="space-y-4">
              {['Havtel Core', 'Titan Series', 'Aether Tech'].map((brand) => (
                <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                  <div 
                    onClick={() => toggleBrand(brand)}
                    className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${
                      selectedBrands.includes(brand) ? 'border-[#aac7ff] bg-[#aac7ff]/10' : 'border-white/20 group-hover:border-[#aac7ff]'
                    }`}
                  >
                    {selectedBrands.includes(brand) && <div className="w-2 h-2 bg-[#aac7ff] rounded-sm"></div>}
                  </div>
                  <span className={`text-xs transition-colors ${
                    selectedBrands.includes(brand) ? 'text-slate-200' : 'text-slate-400 group-hover:text-slate-200'
                  }`}>{brand}</span>
                </label>
              ))}
            </div>
          </div>

          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="w-full py-4 bg-[#3e90ff] text-white font-bold text-xs rounded-xl hover:shadow-[0_0_20px_rgba(62,144,255,0.3)] transition-all"
          >
            APPLY FILTERS
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 py-12">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-8 mb-12">
          <div>
            <h1 className="text-5xl font-black tracking-tighter text-slate-100 mb-4 capitalize">{activeCategory.toLowerCase()}</h1>
            <p className="text-slate-400 text-sm max-w-lg">
              Browse our selection of next-generation {activeCategory.toLowerCase()}, engineered for extreme performance.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search components..." 
                className="bg-[#1c2025] border border-white/5 rounded-xl pl-12 pr-6 py-3 text-xs text-slate-300 focus:outline-none focus:border-[#aac7ff]/50 w-full sm:w-64"
              />
            </div>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#1c2025] border border-white/5 rounded-xl px-6 py-3 text-xs text-slate-300 focus:outline-none appearance-none cursor-pointer min-w-[140px]"
            >
              <option>Popularity</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                onClick={() => onProductSelect(prod.id)}
                className="bg-[#1c2025]/50 border border-white/5 rounded-2xl overflow-hidden group hover:border-[#aac7ff]/30 transition-all cursor-pointer"
              >
                <div className="aspect-square relative overflow-hidden bg-[#0a0e13]">
                  {prod.tag && (
                    <span className={`absolute top-4 right-4 z-10 px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${
                      prod.tag === 'LIMITED' ? 'bg-[#f06627] text-white' : 'bg-[#aac7ff] text-[#003064]'
                    }`}>
                      {prod.tag}
                    </span>
                  )}
                  <img 
                    src={prod.img} 
                    alt={prod.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-6">
                  <span className="text-[10px] font-black tracking-widest text-slate-500 mb-2 block">{prod.series}</span>
                  <h3 className="text-lg font-bold text-slate-100 mb-6">{prod.name}</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-black text-slate-100">{prod.priceString}</span>
                    <button 
                      onClick={(event) => {
                        event.stopPropagation();
                        onAddToCart(prod.name);
                      }}
                      className="p-2 bg-white/5 rounded-lg text-slate-400 hover:bg-[#aac7ff] hover:text-[#003064] transition-all"
                    >
                      <ShoppingCart size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-500">
              <Search size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-100 mb-2">No products found</h3>
            <p className="text-slate-400">Try adjusting your filters or search query.</p>
          </div>
        )}

        {/* Pagination */}
        {filteredProducts.length > 0 && (
          <div className="flex justify-center items-center gap-2">
            <button className="p-2 text-slate-500 hover:text-slate-300"><ChevronLeft size={20} /></button>
            {[1, 2, 3].map((n) => (
              <button 
                key={n} 
                className={`w-10 h-10 rounded-lg text-xs font-bold transition-all ${
                  n === 1 ? 'bg-[#aac7ff] text-[#003064]' : 'text-slate-500 hover:bg-white/5'
                }`}
              >
                {n}
              </button>
            ))}
            <span className="text-slate-500 px-2">...</span>
            <button className="w-10 h-10 rounded-lg text-xs font-bold text-slate-500 hover:bg-white/5">12</button>
            <button className="p-2 text-slate-500 hover:text-slate-300"><ChevronRight size={20} /></button>
          </div>
        )}
      </main>
    </motion.div>
  );
}


function Account({
  authSession,
  onExit,
  onOpenOrders,
  onSessionUpdate,
}: {
  authSession: AuthSession;
  onExit: () => void;
  onOpenOrders: () => void;
  onSessionUpdate: (session: AuthResponse | null) => void;
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
                          const updated = await updateUserAddressRequest(authSession.access_token, editingContactId, payload);
                          setDeliveryContacts((prev) =>
                            prev.map((contact) => (contact.id === updated.id ? updated : contact))
                          );
                        } else {
                          const created = await createUserAddressRequest(authSession.access_token, payload);
                          setDeliveryContacts((prev) => {
                            const next = [...prev, created];
                            return next.sort((a, b) => Number(b.is_default) - Number(a.is_default));
                          });
                        }

                        resetDeliveryForm();
                      } catch (error) {
                        setDeliveryError(error instanceof ApiError ? error.message : 'Unable to save this delivery contact right now.');
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

                            try {
                              await deleteUserAddressRequest(authSession.access_token, contact.id);
                              setDeliveryContacts((prev) => prev.filter((item) => item.id !== contact.id));
                            } catch (error) {
                              setDeliveryError(error instanceof ApiError ? error.message : 'Unable to delete this delivery contact right now.');
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
      className="pt-20 min-h-screen bg-[#11161c]"
    >
      <section className="relative overflow-hidden px-8 md:px-24 py-20 md:py-28">
        <div className="absolute inset-0">
          <div className="absolute top-12 left-0 w-[520px] h-[520px] bg-[#aac7ff]/10 rounded-full blur-[140px]"></div>
          <div className="absolute bottom-0 right-0 w-[460px] h-[460px] bg-[#3e90ff]/8 rounded-full blur-[120px]"></div>
        </div>

        <div className="relative z-10 max-w-4xl mb-16 md:mb-20">
          <span className="text-xs uppercase tracking-[0.35em] text-[#aac7ff] font-bold mb-6 block">Connect With Excellence</span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-8 text-slate-100 leading-[0.95] drop-shadow-[0_0_20px_rgba(170,199,255,0.15)]">
            How can we help you?
          </h1>
          <p className="text-lg md:text-2xl text-slate-400 max-w-3xl leading-relaxed">
            Welcome to HAVTEL CORP. Here you'll find the best technology solutions on the market. Place your order with confidence and connect with our team for fast, reliable assistance.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-1 xl:grid-cols-[minmax(0,1.35fr)_420px] gap-10 xl:gap-16 items-start">
          <div className="rounded-[32px] border border-white/5 bg-gradient-to-br from-[#20252d] via-[#1c2129] to-[#161b22] p-6 md:p-10 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
            <div className="grid grid-cols-1 gap-8">
              <label className="block">
                <span className="text-[11px] uppercase tracking-[0.28em] text-[#b5cbff] font-bold block mb-4">Full Identity</span>
                <input
                  type="text"
                  placeholder="Enter your name"
                  className="w-full rounded-2xl bg-[#0b1016] border border-white/5 px-6 py-5 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#aac7ff]/40 focus:shadow-[0_0_0_4px_rgba(170,199,255,0.08)] transition-all"
                />
              </label>

              <label className="block">
                <span className="text-[11px] uppercase tracking-[0.28em] text-[#b5cbff] font-bold block mb-4">Digital Coordinates</span>
                <input
                  type="email"
                  placeholder="email@address.com"
                  className="w-full rounded-2xl bg-[#0b1016] border border-white/5 px-6 py-5 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#aac7ff]/40 focus:shadow-[0_0_0_4px_rgba(170,199,255,0.08)] transition-all"
                />
              </label>

              <label className="block">
                <span className="text-[11px] uppercase tracking-[0.28em] text-[#b5cbff] font-bold block mb-4">Inquiry Details</span>
                <textarea
                  placeholder="How may we assist you today?"
                  rows={6}
                  className="w-full resize-none rounded-2xl bg-[#0b1016] border border-white/5 px-6 py-5 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#aac7ff]/40 focus:shadow-[0_0_0_4px_rgba(170,199,255,0.08)] transition-all"
                />
              </label>

              <div className="pt-2">
                <button className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-br from-[#aac7ff] to-[#3e90ff] px-8 py-5 text-lg font-bold text-[#003064] shadow-[0_12px_35px_rgba(62,144,255,0.25)] transition-all hover:scale-[1.02] hover:shadow-[0_20px_45px_rgba(62,144,255,0.35)] active:scale-[0.99]">
                  Send Message
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
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
                lines: ['786-332-4868', 'Monday - Friday 9AM - 05:00 PM'],
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-5 rounded-[28px] border border-white/5 bg-white/[0.03] p-5 md:p-6 backdrop-blur-sm">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-[#aac7ff]">
                  <item.icon size={22} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold tracking-tight text-slate-100 mb-3">{item.title}</h3>
                  <div className="space-y-1 text-lg text-slate-400">
                    {item.lines.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            <div className="relative overflow-hidden rounded-[32px] border border-white/5 bg-gradient-to-br from-white/10 via-white/[0.06] to-transparent min-h-[260px] p-8">
              <div className="absolute inset-0 opacity-25" style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)',
                backgroundSize: '24px 24px'
              }}></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(170,199,255,0.12),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(62,144,255,0.14),transparent_30%)]"></div>
              <div className="absolute left-[15%] top-[20%] w-3 h-3 rounded-full bg-[#aac7ff]/60"></div>
              <div className="absolute right-[20%] top-[28%] w-2 h-2 rounded-full bg-white/40"></div>
              <div className="absolute left-[55%] bottom-[24%] w-3 h-3 rounded-full bg-[#3e90ff]/50"></div>
              <div className="relative z-10 flex h-full min-h-[196px] items-center justify-center">
                <button className="rounded-full border border-[#aac7ff]/35 bg-[#7288b4]/30 px-8 py-4 text-lg font-medium text-[#cfe0ff] backdrop-blur-md transition-all hover:bg-[#7f96c6]/40">
                  Miami Location
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
