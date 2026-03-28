import { useEffect, useRef, useState } from 'react';
import { 
  ShoppingCart, 
  User, 
  CircleUserRound,
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
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const PRODUCTS: Product[] = [
  { id: 1, name: "Quantum X-8000", series: "HAVTEL CORE", price: 799, priceString: "$799.00", tag: "IN STOCK", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDp0KEdaGdGbkMYURtpl7ALxvrwOa4iLj3c8O4D8gHYYqUnkrad2_dtvDBKrCUH43eXN3bz0_UFSZnOp5yUlfvoWIDcyOve3usV2EcMerkkx1DcRmLscU3gcymcCTrcnNf5Pu9NYTZIgVho6mLrI4aI9ty5EAVVbkt14bT__UjoJMteub1sv_sK9hsm-vIN-pkFErL7mOMYatN1aLahjQxMdn0xsAVFeLNBga_s6IDgH9XzobThpSwOeSB0osXssqyTKoiNDQ9LcrKM", category: "PROCESSORS", brand: "Havtel Core" },
  { id: 2, name: "Omni-Board V2", series: "TITAN SERIES", price: 450, priceString: "$450.00", tag: null, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAKGTECuD0CaVI9MaPpUsO-MchWsoDRbjPoAeS02V1-VfsRn3-cXfICGfqICxtOcZfR9rTuMCGzhOiDOounNof4qLEwSSkeBjYUmnc2CaNDyPE3Q9uQF9EPNCGlXe1OAWhtBg7vMSC7bLkRLdmj0atUVaweB4oLKWagBzHJToW9URUUjMZ90w_iG-iH4F9sKKPb0L9_Ujxmts1mKzgZ6L5GXw7PYlzZvuJqFf3_NUAmrGFCk8dA1VE4O-W14pJVw0hxh2BLX6k11MKd", category: "PROCESSORS", brand: "Titan Series" },
  { id: 3, name: "Aether G-Force RTX", series: "AETHER TECH", price: 1299, priceString: "$1,299.00", tag: "LIMITED", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAcuB_UEL0socYjiXJrmJfjieRWPCENBYpqcvEdmp1ruY7rpY0dHupkPIlUDD3JL2q4NjcLSaF2EuVBr22h89qTN0UzE7S_RvpXA6STywJ1Pp6gDRY8ShPRuCmcDLK71ctSO2eNO6KVCwpMVA1ByjmEIyUqMdxVGASvY1GSmXQKBb4wiGN9yMlvRqI-qgvoSluZAaSsDqn1yqhWYMYw1iDOiXrkwmaGhWCkQdET-FFXVenC-x5S1J_K4GV25sl4z3fRAYfJBzdJpTZl", category: "GRAPHICS", brand: "Aether Tech" },
  { id: 4, name: "Hyper-Pulse DDR5", series: "HAVTEL CORE", price: 215, priceString: "$215.00", tag: null, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCFdZRDgwUS5nKcimTjlsRKUe3kIBzmTQMNm6X2QdFI6JqOrWlso3geYu1kV5UKzsto5tCIdqEuYJeUEcl0bqD2JHXCH_hCDJ6ACsgGo1TzeuAKcR5BU9K3bkScipCQvki4QMt83a9XmX6DfKnVdP-fgC6A-owmF7Jx1dP1zpNFOYiWj8sfwAf-uMK745L70qKNojQDxbMS6z-GUyAnmn6td9TC_vMaDYf1DYR32cckwHFDDH0OovQQdJbcRP-cY5aEWIE8gtX2vYFi", category: "MEMORY", brand: "Havtel Core" },
  { id: 5, name: "Quantum Lite-Z", series: "HAVTEL CORE", price: 349, priceString: "$349.00", tag: null, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAfy9AEiXSt8ticdcUrVyztADCQkhnmK0k04QXZDGHnIrf5K_PiaIyCVELrLsQ4y53Yj4Wq4tmIUgpxQUmdNJRN63VDjdICN2Kj1oWwBHLDeqWBquMYWoPVy_eAzf6UWgRt4PmRgEaY_dE_YatBWeMDUykhqtUHgmNN9_epg2Jmz8rn4FIeFlNR_w5EHMGK9BHHF8rsNiZp8vUOBV870uLdVcdzRMU8pCS_Jcs-hkT55CYISxoUe8enKv3wUnEx2Xa27E1wc9aTCwoM", category: "PROCESSORS", brand: "Havtel Core" },
  { id: 6, name: "Frost-Bite Cooler", series: "TITAN SERIES", price: 125, priceString: "$125.00", tag: null, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAKGTECuD0CaVI9MaPpUsO-MchWsoDRbjPoAeS02V1-VfsRn3-cXfICGfqICxtOcZfR9rTuMCGzhOiDOounNof4qLEwSSkeBjYUmnc2CaNDyPE3Q9uQF9EPNCGlXe1OAWhtBg7vMSC7bLkRLdmj0atUVaweB4oLKWagBzHJToW9URUUjMZ90w_iG-iH4F9sKKPb0L9_Ujxmts1mKzgZ6L5GXw7PYlzZvuJqFf3_NUAmrGFCk8dA1VE4O-W14pJVw0hxh2BLX6k11MKd", category: "PERIPHERALS", brand: "Titan Series" },
  { id: 7, name: "Aether NVMe 4TB", series: "AETHER TECH", price: 580, priceString: "$580.00", tag: null, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCNurIX-nFpwLYqp9-2Gaoi1L74qYjYacZf2VNl98eQb7URYLloYdWLZq5amj55iRWRV33DBbtrABuQw3ga1MZfW2wSP2iQWJF53gSdACxc1aSoaSCqR-l4pI0XCcMqwYx8PKgGuya9ov7w_0URDkBa2LmpCHO6FCNxpHHPYtGUqxBycPlsrrPtgEEZ2GjuegCmbf0gN6lxb5wl84WHelZl_gB4kPnUjp0sGfgoVZhn71v4UvJDHmgOdiKKQPM-sGrrrJVN_qPunQxZ", category: "STORAGE", brand: "Aether Tech" },
  { id: 8, name: "Mechanical Elite X", series: "TITAN SERIES", price: 210, priceString: "$210.00", tag: null, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuApXUDZkueOvrnbiWh7wNIHjF7YluGpyA_ScedqgBw4j2Luxm6kXkVCQM8knT6qI-0LNezAoOJRaoSdPa3tPpQxCmJUoeisiD8MlHfZ1E-YFsFyywRWCjLyyV-kP9Q5d_XoVr0h5vBpQ1iIkMbvvfAfnxvQHUcXz5ADkzJGlgFBDTTyro8RkH7OBQgpIphrrq0visdFfuipYsf7y365wHMGCt7BDvThmqbioUg5en_-sLc86eCngtUBrSJXOqPY9_mo9wypuWyznpqY", category: "PERIPHERALS", brand: "Titan Series" }
];

export default function App() {
  const [view, setView] = useState<View>('home');
  const [selectedProductId, setSelectedProductId] = useState<number>(1);
  const [notification, setNotification] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { productId: 3, quantity: 1, variant: 'Aether Black | Founders Edition' },
    { productId: 5, quantity: 1, variant: 'Core Silver | Performance Bundle' },
    { productId: 8, quantity: 2, variant: 'Titanium Slate | Precision Switches' },
  ]);
  const [shippingMethod, setShippingMethod] = useState<'priority' | 'express'>('priority');

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

  return (
    <div className="min-h-screen bg-[#101419] text-[#e0e2ea] font-sans selection:bg-[#aac7ff]/30 antialiased">
      {!isCheckoutView && (
      <>
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 bg-[#101419]/50 backdrop-blur-lg border-b border-white/5 flex justify-between items-center px-8 md:px-12 h-20">
        <div 
          className="text-2xl font-black tracking-tighter text-slate-100 cursor-pointer"
          onClick={() => setView('home')}
        >
          Havtel
        </div>
        <div className="hidden md:flex items-center gap-10">
          <button 
            onClick={() => setView('home')}
            className={`text-sm font-medium transition-colors pb-1 ${view === 'home' ? 'text-[#aac7ff] border-b-2 border-[#aac7ff]' : 'text-slate-400 hover:text-slate-100'}`}
          >
            Home
          </button>
          <button 
            onClick={() => setView('shop')}
            className={`text-sm font-medium transition-colors pb-1 ${view === 'shop' ? 'text-[#aac7ff] border-b-2 border-[#aac7ff]' : 'text-slate-400 hover:text-slate-100'}`}
          >
            Shop
          </button>
          <button className="text-slate-400 hover:text-slate-100 transition-colors text-sm font-medium">Discover</button>
          <button 
            onClick={() => setView('support')}
            className={`text-sm font-medium transition-colors pb-1 ${view === 'support' ? 'text-[#aac7ff] border-b-2 border-[#aac7ff]' : 'text-slate-400 hover:text-slate-100'}`}
          >
            Support
          </button>
          <button className="text-slate-400 hover:text-slate-100 transition-colors text-sm font-medium">Pre-order</button>
        </div>
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => setView('cart')}
            className="text-slate-400 hover:text-slate-100 transition-colors p-2 rounded-full hover:bg-white/5 relative"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#3e90ff] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
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
              className={`transition-colors p-2 rounded-full hover:bg-white/5 ${isUserMenuOpen ? 'text-slate-100 bg-white/5' : 'text-slate-400 hover:text-slate-100'}`}
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
                  className="absolute right-0 top-[calc(100%+12px)] z-[70] w-52 rounded-2xl border border-white/10 bg-[#161b22]/95 p-2 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl"
                >
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setView(isAuthenticated ? 'account' : 'login');
                        setIsUserMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-200 transition-colors hover:bg-white/6 hover:text-white"
                    >
                      <CircleUserRound size={18} className="text-slate-400" />
                      <span>My Account</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setView('orders');
                        setIsUserMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-200 transition-colors hover:bg-white/6 hover:text-white"
                    >
                      <Package size={18} className="text-slate-400" />
                      <span>Orders</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setView('home');
                        setIsAuthenticated(false);
                        setIsUserMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-200 transition-colors hover:bg-white/6 hover:text-white"
                    >
                      <LogOut size={18} className="text-slate-400" />
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
            onLogin={() => {
              setIsAuthenticated(true);
              setView('account');
            }}
            onGoHome={() => setView('home')}
            onGoToSignup={() => setView('signup')}
            onGoToForgot={() => setView('forgot')}
          />
        ) : view === 'signup' ? (
          <AuthSignupView
            key="signup"
            onSignup={() => {
              setIsAuthenticated(true);
              setView('account');
            }}
            onGoHome={() => setView('home')}
            onGoToLogin={() => setView('login')}
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
            onBackToShipping={() => setView('shipping')}
            onBackToCart={() => setView('cart')}
            onProceedToReview={() => setView('review')}
          />
        ) : view === 'review' ? (
          <ReviewView
            key="review"
            cartItems={cartItems}
            shippingMethod={shippingMethod}
            onClose={() => setView('home')}
            onGoHome={() => setView('home')}
            onBackToPayment={() => setView('payment')}
            onBackToShipping={() => setView('shipping')}
            onBackToCart={() => setView('cart')}
            onPlaceOrder={() => setView('confirmed')}
          />
        ) : view === 'tracking' ? (
          <TrackOrderView
            key="tracking"
            cartItems={cartItems}
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
            shippingMethod={shippingMethod}
            onClose={() => setView('home')}
            onGoHome={() => setView('home')}
            onTrackOrder={() => setView('tracking')}
            onContinueShopping={() => setView('shop')}
          />
        ) : view === 'shipping' ? (
          <ShippingView
            key="shipping"
            cartItems={cartItems}
            shippingMethod={shippingMethod}
            onShippingMethodChange={setShippingMethod}
            onClose={() => setView('home')}
            onGoHome={() => setView('home')}
            onBackToCart={() => setView('cart')}
            onProceedToPayment={() => setView('payment')}
          />
        ) : view === 'cart' ? (
          <ShoppingBagView
            key="cart"
            cartItems={cartItems}
            onClose={() => setView('home')}
            onGoHome={() => setView('home')}
            onProceedToShipping={() => setView('shipping')}
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
          <OrderHistory key="orders" onBackToAccount={() => setView('account')} onGoHome={() => setView('home')} />
        ) : view === 'account' ? (
          <Account key="account" onExit={() => setView('home')} onOpenOrders={() => setView('orders')} />
        ) : (
          <Support key="support" />
        )}
      </AnimatePresence>


      {!isCheckoutView && (
      <>
      {/* Footer */}
      <footer className="bg-[#0a0e13] border-t border-white/5 px-8 md:px-24 py-20 text-sm text-slate-400">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-1">
            <div className="text-xl font-bold text-slate-100 mb-4">Havtel</div>
            <p className="leading-relaxed mb-6">Redefining the boundaries of hardware performance and digital infrastructure since 2018.</p>
            <div className="flex gap-4">
              <Globe size={20} className="hover:text-[#aac7ff] cursor-pointer" />
              <Share2 size={20} className="hover:text-[#aac7ff] cursor-pointer" />
              <ShieldCheck size={20} className="hover:text-[#aac7ff] cursor-pointer" />
            </div>
          </div>
          <div>
            <h4 className="text-slate-100 font-bold mb-6 uppercase tracking-wider text-xs">Resources</h4>
            <ul className="space-y-4">
              <li><a className="hover:text-[#aac7ff] transition-colors" href="#">Support</a></li>
              <li><a className="hover:text-[#aac7ff] transition-colors" href="#">Investors</a></li>
              <li><a className="hover:text-[#aac7ff] transition-colors" href="#">Sustainability</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-slate-100 font-bold mb-6 uppercase tracking-wider text-xs">Legal</h4>
            <ul className="space-y-4">
              <li><a className="hover:text-[#aac7ff] transition-colors" href="#">Privacy Policy</a></li>
              <li><a className="hover:text-[#aac7ff] transition-colors" href="#">Terms of Service</a></li>
              <li><a className="hover:text-[#aac7ff] transition-colors" href="#">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-slate-100 font-bold mb-6 uppercase tracking-wider text-xs">Stay Updated</h4>
            <p className="mb-6">Forging the next era of high-performance computing through uncompromising engineering and design.</p>
            <div className="bg-[#1c2025] rounded-xl p-1 flex items-center border border-white/5">
              <input 
                className="bg-transparent border-none focus:outline-none px-4 py-2 text-xs flex-1" 
                placeholder="Email" 
                type="text"
              />
              <button className="bg-[#3e90ff] text-white p-2 rounded-lg">
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
        <div className="pt-12 border-t border-white/5 text-center text-xs opacity-50">
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
  cartItems,
  shippingMethod,
  onShippingMethodChange,
  onClose,
  onGoHome,
  onBackToCart,
  onProceedToPayment,
}: {
  cartItems: CartItem[];
  shippingMethod: 'priority' | 'express';
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
                  <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-[#172131] px-2 text-xs font-black tracking-[0.2em] text-[#aac7ff]">01</span>
                  <h2 className="text-4xl font-bold tracking-tight">Contact Information</h2>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-4 block text-sm font-bold uppercase tracking-[0.24em] text-slate-300">Email Address</span>
                    <input
                      type="email"
                      placeholder="name@domain.tech"
                      className="w-full rounded-2xl border border-white/5 bg-[#0b1016] px-6 py-5 text-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#aac7ff]/40"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-4 block text-sm font-bold uppercase tracking-[0.24em] text-slate-300">Phone Number</span>
                    <input
                      type="tel"
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
                    <input className="w-full rounded-2xl border border-white/5 bg-[#0b1016] px-6 py-5 text-xl text-slate-200 focus:outline-none focus:border-[#aac7ff]/40" />
                  </label>
                  <label className="block">
                    <span className="mb-4 block text-sm font-bold uppercase tracking-[0.24em] text-slate-300">Last Name</span>
                    <input className="w-full rounded-2xl border border-white/5 bg-[#0b1016] px-6 py-5 text-xl text-slate-200 focus:outline-none focus:border-[#aac7ff]/40" />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="mb-4 block text-sm font-bold uppercase tracking-[0.24em] text-slate-300">Street Address</span>
                    <input
                      placeholder="123 Tech Boulevard"
                      className="w-full rounded-2xl border border-white/5 bg-[#0b1016] px-6 py-5 text-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#aac7ff]/40"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-4 block text-sm font-bold uppercase tracking-[0.24em] text-slate-300">City</span>
                    <input className="w-full rounded-2xl border border-white/5 bg-[#0b1016] px-6 py-5 text-xl text-slate-200 focus:outline-none focus:border-[#aac7ff]/40" />
                  </label>
                  <label className="block">
                    <span className="mb-4 block text-sm font-bold uppercase tracking-[0.24em] text-slate-300">State / Province</span>
                    <input className="w-full rounded-2xl border border-white/5 bg-[#0b1016] px-6 py-5 text-xl text-slate-200 focus:outline-none focus:border-[#aac7ff]/40" />
                  </label>
                  <label className="block">
                    <span className="mb-4 block text-sm font-bold uppercase tracking-[0.24em] text-slate-300">Postal Code</span>
                    <input className="w-full rounded-2xl border border-white/5 bg-[#0b1016] px-6 py-5 text-xl text-slate-200 focus:outline-none focus:border-[#aac7ff]/40" />
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
                  onClick={onProceedToPayment}
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
  shippingMethod,
  onClose,
  onGoHome,
  onBackToPayment,
  onBackToShipping,
  onBackToCart,
  onPlaceOrder,
}: {
  cartItems: CartItem[];
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
                  if (index === 2) onBackToPayment();
                }}
                className={`border-b-2 pb-2 ${
                  index === 3 ? 'border-[#aac7ff] text-[#d6e4ff]' : 'border-transparent text-slate-300 hover:text-white'
                }`}
              >
                {step}
              </button>
            ))}
          </nav>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-[#b5cbff] transition-colors hover:bg-white/5 hover:text-white">
            <X size={28} />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-8 py-14 md:px-16">
        <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_410px]">
          <section>
            <div className="mb-14 max-w-4xl">
              <h1 className="text-6xl font-black tracking-tighter md:text-7xl">Review your order.</h1>
              <p className="mt-6 text-2xl leading-relaxed text-slate-400">
                Please verify your details before confirming your purchase. Once placed, your items will be prepared for immediate dispatch.
              </p>
            </div>

            <div className="mb-8 flex items-center justify-between gap-4">
              <span className="text-sm font-bold uppercase tracking-[0.32em] text-[#b5cbff]">Items in Shipment</span>
              <button type="button" onClick={onBackToCart} className="text-xl text-slate-300 hover:text-white">Edit Cart</button>
            </div>

            <div className="space-y-6">
              {cartItems.map((item) => {
                const product = PRODUCTS.find((entry) => entry.id === item.productId);
                if (!product) return null;

                return (
                  <div key={item.productId} className="rounded-[28px] border border-white/5 bg-[#232831] p-7">
                    <div className="flex flex-col gap-6 md:flex-row">
                      <div className="h-40 w-40 overflow-hidden rounded-2xl bg-[#0b1016]">
                        <img src={product.img} alt={product.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col gap-4 md:flex-row md:justify-between">
                          <div>
                            <h2 className="text-3xl font-bold tracking-tight">{product.name}</h2>
                            <p className="mt-2 text-xl text-slate-400">{item.variant}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-black text-[#a9c7ff]">{formatCurrency(product.price * item.quantity)}</div>
                            <div className="mt-2 text-lg text-slate-400">Qty: {item.quantity}</div>
                          </div>
                        </div>
                        <div className="mt-8 flex flex-wrap gap-3">
                          <span className="rounded-lg bg-[#1e4257] px-4 py-2 text-sm font-bold uppercase tracking-[0.18em] text-[#75d3ff]">In Stock</span>
                          <span className="rounded-lg bg-white/8 px-4 py-2 text-sm font-bold uppercase tracking-[0.18em] text-slate-300">
                            {shippingMethod === 'priority' ? 'Expedited Shipping' : 'Ships Next Day'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div className="rounded-[28px] border border-white/5 bg-[#161c24] p-8">
                <div className="mb-8 flex items-center justify-between">
                  <span className="text-sm font-bold uppercase tracking-[0.32em] text-[#b5cbff]">Shipping Address</span>
                  <button type="button" onClick={onBackToShipping} className="text-lg font-bold text-[#b9d1ff]">Edit</button>
                </div>
                <div className="space-y-2 text-2xl text-slate-100">
                  <p>Alex Thompson</p>
                  <p className="text-slate-400">1284 Tech Plaza, Suite 402</p>
                  <p className="text-slate-400">San Francisco, CA 94103</p>
                  <p className="text-slate-400">United States</p>
                </div>
                <div className="mt-10 border-t border-white/5 pt-8">
                  <div className="inline-flex items-center gap-3 text-lg uppercase tracking-[0.18em] text-slate-300">
                    <Truck size={18} />
                    {shippingLabel}
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-white/5 bg-[#161c24] p-8">
                <div className="mb-8 flex items-center justify-between">
                  <span className="text-sm font-bold uppercase tracking-[0.32em] text-[#b5cbff]">Payment Method</span>
                  <button type="button" onClick={onBackToPayment} className="text-lg font-bold text-[#b9d1ff]">Edit</button>
                </div>
                <div className="flex items-start gap-5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#2a3446] text-[#b9d1ff]">
                    <CreditCard size={24} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-100">Visa ending in 8842</div>
                    <div className="mt-1 text-xl text-slate-400">Expires 12/26</div>
                  </div>
                </div>
                <div className="mt-8 border-t border-white/5 pt-8">
                  <div className="text-lg text-slate-400">Billing Address</div>
                  <div className="mt-2 text-xl text-slate-200">Same as shipping address</div>
                </div>
              </div>
            </div>
          </section>

          <aside className="rounded-[32px] border border-white/5 bg-[#232831] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.3)] h-fit">
            <h2 className="mb-10 text-4xl font-black tracking-tight">Order Summary</h2>
            <div className="space-y-5 text-xl">
              <div className="flex items-center justify-between"><span className="text-slate-300">Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
              <div className="flex items-center justify-between"><span className="text-slate-300">Shipping</span><span className="text-[#75d3ff]">{formatCurrency(shippingCost)}</span></div>
              <div className="flex items-center justify-between"><span className="text-slate-300">Estimated Tax</span><span>{formatCurrency(tax)}</span></div>
            </div>
            <div className="my-8 border-t border-white/5"></div>
            <div className="flex items-end justify-between gap-4">
              <span className="text-3xl text-slate-100">Total</span>
              <span className="text-6xl font-black tracking-tight text-[#a9c7ff]">{formatCurrency(total)}</span>
            </div>
            <button
              type="button"
              onClick={onPlaceOrder}
              className="mt-10 w-full rounded-[24px] bg-gradient-to-r from-[#4d93f7] to-[#2482ff] px-8 py-6 text-2xl font-bold text-white shadow-[0_24px_60px_rgba(77,147,247,0.35)] transition-transform hover:scale-[1.01]"
            >
              Place Your Order
            </button>
            <p className="mt-8 text-lg leading-relaxed text-slate-400">
              By clicking "Place Your Order", you agree to Havtel's Terms of Service and Privacy Policy.
            </p>
            <div className="mt-8 rounded-[20px] bg-[#0f141b] p-6">
              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-lg bg-[#1e4257] text-[#75d3ff]">
                  <ShieldCheck size={20} />
                </div>
                <p className="text-lg leading-relaxed text-slate-300">
                  Secure checkout with AES-256 encryption. Your payment information is never stored on our servers.
                </p>
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

function OrderConfirmedView({
  cartItems,
  shippingMethod,
  onClose,
  onGoHome,
  onTrackOrder,
  onContinueShopping,
}: {
  cartItems: CartItem[];
  shippingMethod: 'priority' | 'express';
  onClose: () => void;
  onGoHome: () => void;
  onTrackOrder: () => void;
  onContinueShopping: () => void;
  key?: string;
}) {
  const shippingCost = shippingMethod === 'priority' ? 12 : 35;
  const subtotal = cartItems.reduce((sum, item) => {
    const product = PRODUCTS.find((entry) => entry.id === item.productId);
    return sum + (product?.price ?? 0) * item.quantity;
  }, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + shippingCost + tax;

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
                    <div className="text-3xl font-bold text-slate-100">Thursday, Oct 24 - Saturday, Oct 26</div>
                    <div className="mt-3 text-2xl text-slate-400">
                      {shippingMethod === 'priority' ? 'Standard High-Priority Logistics' : 'Quantum Express Priority Lane'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="rounded-[32px] border border-white/5 bg-[#232831] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.3)] h-fit">
            <div className="mb-8 flex items-center justify-between gap-4">
              <h2 className="text-4xl font-black tracking-tight">Order Summary</h2>
              <span className="rounded-full bg-white/6 px-4 py-2 text-lg text-slate-300">#HAV-99281-X</span>
            </div>

            <div className="space-y-8">
              {cartItems.map((item) => {
                const product = PRODUCTS.find((entry) => entry.id === item.productId);
                if (!product) return null;
                return (
                  <div key={item.productId} className="flex gap-5">
                    <div className="h-24 w-24 overflow-hidden rounded-2xl bg-[#0b1016]">
                      <img src={product.img} alt={product.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-2xl font-bold text-slate-100">{product.name}</h3>
                          <p className="mt-2 text-xl text-slate-400">{item.variant}</p>
                        </div>
                        <span className="text-2xl text-slate-100">{formatCurrency(product.price * item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="my-8 border-t border-white/5"></div>
            <div className="space-y-4 text-xl">
              <div className="flex items-center justify-between"><span className="text-slate-300">Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
              <div className="flex items-center justify-between"><span className="text-slate-300">Shipping</span><span className="text-[#75d3ff]">{shippingMethod === 'express' ? 'Express Complimentary' : formatCurrency(shippingCost)}</span></div>
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
                  <div className="mt-3">Alex Thompson</div>
                  <div>742 Digital Horizon Parkway, Ste 402</div>
                  <div>Neo-City, CA 94103</div>
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
  cartItems,
  shippingMethod,
  onClose,
  onGoHome,
  onBackToOrders,
  onContinueShopping,
}: {
  cartItems: CartItem[];
  shippingMethod: 'priority' | 'express';
  onClose: () => void;
  onGoHome: () => void;
  onBackToOrders: () => void;
  onContinueShopping: () => void;
  key?: string;
}) {
  const subtotal = cartItems.reduce((sum, item) => {
    const product = PRODUCTS.find((entry) => entry.id === item.productId);
    return sum + (product?.price ?? 0) * item.quantity;
  }, 0);
  const shippingCost = shippingMethod === 'priority' ? 12 : 35;
  const tax = subtotal * 0.08;
  const total = subtotal + shippingCost + tax;
  const trackingSteps = [
    { title: 'Order Confirmed', detail: 'Payment verified and order created in the Havtel system.', done: true },
    { title: 'Hardware Assembly', detail: 'Components are being prepared and packaged for dispatch.', done: true },
    { title: 'In Transit', detail: 'Carrier manifest created. Pickup window scheduled for tonight.', done: false, current: true },
    { title: 'Delivered', detail: 'Final delivery to your registered destination.', done: false },
  ];

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
                Follow your hardware package in real time and review the latest fulfillment milestones for order `#HAV-99281-X`.
              </p>
            </div>

            <div className="rounded-[30px] border border-white/5 bg-[#171d26] p-8 md:p-10">
              <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="text-sm font-bold uppercase tracking-[0.3em] text-slate-400">Current Status</div>
                  <div className="mt-3 text-4xl font-black text-[#9dd6ff]">In Transit</div>
                </div>
                <div className="text-xl text-slate-400">Estimated arrival: Thursday, Oct 24 - Saturday, Oct 26</div>
              </div>

              <div className="space-y-8">
                {trackingSteps.map((step, index) => (
                  <div key={step.title} className="flex gap-5">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full ${
                          step.done ? 'bg-[#9ee3ff] text-[#041521]' : step.current ? 'bg-[#223b53] text-[#b9d1ff] ring-4 ring-[#223b53]/40' : 'bg-[#252d39] text-slate-500'
                        }`}
                      >
                        {step.done ? <Check size={22} /> : <div className="h-3 w-3 rounded-full bg-current"></div>}
                      </div>
                      {index < trackingSteps.length - 1 && (
                        <div className={`mt-3 h-20 w-1 rounded-full ${step.done ? 'bg-[#5abaf0]' : 'bg-white/8'}`}></div>
                      )}
                    </div>
                    <div className="pt-1">
                      <h2 className="text-2xl font-bold text-slate-100">{step.title}</h2>
                      <p className="mt-2 max-w-2xl text-xl leading-relaxed text-slate-400">{step.detail}</p>
                    </div>
                  </div>
                ))}
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
                <span className="rounded-full bg-white/6 px-4 py-2 text-lg text-slate-300">ZX-44-NEO-81</span>
              </div>
              <div className="space-y-6">
                {cartItems.map((item) => {
                  const product = PRODUCTS.find((entry) => entry.id === item.productId);
                  if (!product) return null;
                  return (
                    <div key={item.productId} className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 overflow-hidden rounded-xl bg-[#0b1016]">
                          <img src={product.img} alt={product.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div>
                          <div className="text-xl font-bold text-slate-100">{product.name}</div>
                          <div className="text-base text-slate-400">Qty: {item.quantity}</div>
                        </div>
                      </div>
                      <span className="text-lg text-slate-300">{formatCurrency(product.price * item.quantity)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="my-8 border-t border-white/5"></div>
              <div className="space-y-4 text-lg">
                <div className="flex items-center justify-between"><span className="text-slate-300">Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                <div className="flex items-center justify-between"><span className="text-slate-300">Shipping</span><span>{formatCurrency(shippingCost)}</span></div>
                <div className="flex items-center justify-between"><span className="text-slate-300">Tax</span><span>{formatCurrency(tax)}</span></div>
              </div>
              <div className="my-8 border-t border-white/5"></div>
              <div className="flex items-end justify-between gap-4">
                <span className="text-2xl font-bold text-slate-100">Total</span>
                <span className="text-5xl font-black tracking-tight text-[#a9c7ff]">{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/5 bg-[#161c24] p-8">
              <div className="text-sm font-bold uppercase tracking-[0.32em] text-[#b5cbff] mb-6">Destination</div>
              <div className="space-y-2 text-xl text-slate-300">
                <div>Alex Thompson</div>
                <div>742 Digital Horizon Parkway, Ste 402</div>
                <div>Neo-City, CA 94103</div>
                <div>United States</div>
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
}: {
  onLogin: () => void;
  onGoHome: () => void;
  onGoToSignup: () => void;
  onGoToForgot: () => void;
  key?: string;
}) {
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
              onSubmit={(event) => {
                event.preventDefault();
                onLogin();
              }}
              className="mt-8 space-y-6"
            >
              <label className="block">
                <span className="mb-4 block text-sm font-bold uppercase tracking-[0.24em] text-slate-300">Email Address</span>
                <input type="email" required placeholder="name@domain.tech" className="w-full rounded-2xl border border-white/5 bg-[#0b1016] px-6 py-5 text-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#aac7ff]/40" />
              </label>
              <label className="block">
                <span className="mb-4 block text-sm font-bold uppercase tracking-[0.24em] text-slate-300">Password</span>
                <input type="password" required placeholder="Enter your password" className="w-full rounded-2xl border border-white/5 bg-[#0b1016] px-6 py-5 text-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#aac7ff]/40" />
              </label>
              <div className="flex items-center justify-between gap-4 text-sm">
                <button type="button" onClick={onGoToForgot} className="font-bold text-[#b9d1ff] hover:text-white">Forgot password?</button>
                <button type="button" onClick={onGoToSignup} className="font-bold text-slate-400 hover:text-white">Create account</button>
              </div>
              <button type="submit" className="w-full rounded-[22px] bg-gradient-to-r from-[#a9c7ff] to-[#4d93f7] px-8 py-5 text-xl font-bold text-[#03192f] shadow-[0_24px_60px_rgba(77,147,247,0.35)]">
                Sign In
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
}: {
  onSignup: () => void;
  onGoHome: () => void;
  onGoToLogin: () => void;
  key?: string;
}) {
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
              onSubmit={(event) => {
                event.preventDefault();
                onSignup();
              }}
              className="mt-8 grid grid-cols-1 gap-6"
            >
              <input required placeholder="First name" className="w-full rounded-2xl border border-white/5 bg-[#0b1016] px-6 py-5 text-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#aac7ff]/40" />
              <input required placeholder="Last name" className="w-full rounded-2xl border border-white/5 bg-[#0b1016] px-6 py-5 text-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#aac7ff]/40" />
              <input required type="email" placeholder="Email address" className="w-full rounded-2xl border border-white/5 bg-[#0b1016] px-6 py-5 text-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#aac7ff]/40" />
              <input required type="password" placeholder="Create password" className="w-full rounded-2xl border border-white/5 bg-[#0b1016] px-6 py-5 text-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#aac7ff]/40" />
              <button type="submit" className="w-full rounded-[22px] bg-gradient-to-r from-[#a9c7ff] to-[#4d93f7] px-8 py-5 text-xl font-bold text-[#03192f] shadow-[0_24px_60px_rgba(77,147,247,0.35)]">
                Create Account
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


function Account({ onExit, onOpenOrders }: { onExit: () => void; onOpenOrders: () => void; key?: string }) {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [personalForm, setPersonalForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
  });
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [editingContactId, setEditingContactId] = useState<number | null>(null);
  const [deliveryForm, setDeliveryForm] = useState({
    email: '',
    phone: '',
    address: '',
    ci: '',
  });
  const [deliveryContacts, setDeliveryContacts] = useState([
    {
      id: 1,
      email: 'procurement@northstar.io',
      phone: '+1 (786) 332-4868',
      address: '2531 NW 72nd Ave Unit A, Miami, FL 33122',
      ci: 'A1429087',
    },
  ]);

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
      email: '',
      phone: '',
      address: '',
      ci: '',
    });
    setEditingContactId(null);
    setShowDeliveryForm(false);
  };

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
          <span className="text-xs uppercase tracking-[0.35em] text-[#aac7ff] font-bold mb-6 block">Account Center</span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-8 text-slate-100 leading-[0.95] drop-shadow-[0_0_20px_rgba(170,199,255,0.15)]">
            My Account
          </h1>
          <p className="text-lg md:text-2xl text-slate-400 max-w-3xl leading-relaxed">
            Access your profile details, delivery contacts, and full order history from one streamlined control center.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-1 xl:grid-cols-[minmax(0,1.35fr)_360px] gap-10 xl:gap-16 items-start">
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  className={`group text-left rounded-[28px] border p-6 md:p-8 shadow-[0_30px_80px_rgba(0,0,0,0.35)] transition-all hover:-translate-y-1 ${
                    selectedSection === section.id
                      ? 'border-[#aac7ff]/35 bg-gradient-to-br from-[#263242] via-[#1d2630] to-[#161b22]'
                      : 'border-white/5 bg-gradient-to-br from-[#20252d] via-[#1c2129] to-[#161b22] hover:border-[#aac7ff]/20'
                  }`}
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#aac7ff]/10 text-[#aac7ff] mb-8 group-hover:bg-[#aac7ff]/15">
                    <section.icon size={28} />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-100 mb-4">{section.title}</h2>
                  <p className="text-slate-400 leading-relaxed">{section.description}</p>
                </button>
              ))}
            </div>

            {selectedSection === 'personal' && (
              <div className="rounded-[32px] border border-[#aac7ff]/15 bg-gradient-to-br from-[#20252d] via-[#1c2129] to-[#161b22] p-6 md:p-10 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
                <div className="mb-8">
                  <span className="text-[11px] uppercase tracking-[0.28em] text-[#b5cbff] font-bold block mb-3">Profile Details</span>
                  <h3 className="text-3xl font-bold tracking-tight text-slate-100 mb-3">Personal Information</h3>
                  <p className="text-slate-400">All fields are required before saving your profile details.</p>
                </div>

                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    setSelectedSection(null);
                  }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <label className="block">
                    <span className="text-[11px] uppercase tracking-[0.28em] text-[#b5cbff] font-bold block mb-4">First Name</span>
                    <input
                      required
                      type="text"
                      value={personalForm.firstName}
                      onChange={(event) => setPersonalForm((prev) => ({ ...prev, firstName: event.target.value }))}
                      placeholder="Enter your first name"
                      className="w-full rounded-2xl bg-[#0b1016] border border-white/5 px-6 py-5 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#aac7ff]/40 focus:shadow-[0_0_0_4px_rgba(170,199,255,0.08)] transition-all"
                    />
                  </label>

                  <label className="block">
                    <span className="text-[11px] uppercase tracking-[0.28em] text-[#b5cbff] font-bold block mb-4">Last Name</span>
                    <input
                      required
                      type="text"
                      value={personalForm.lastName}
                      onChange={(event) => setPersonalForm((prev) => ({ ...prev, lastName: event.target.value }))}
                      placeholder="Enter your last name"
                      className="w-full rounded-2xl bg-[#0b1016] border border-white/5 px-6 py-5 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#aac7ff]/40 focus:shadow-[0_0_0_4px_rgba(170,199,255,0.08)] transition-all"
                    />
                  </label>

                  <label className="block">
                    <span className="text-[11px] uppercase tracking-[0.28em] text-[#b5cbff] font-bold block mb-4">Phone</span>
                    <input
                      required
                      type="tel"
                      value={personalForm.phone}
                      onChange={(event) => setPersonalForm((prev) => ({ ...prev, phone: event.target.value }))}
                      placeholder="Enter your phone number"
                      className="w-full rounded-2xl bg-[#0b1016] border border-white/5 px-6 py-5 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#aac7ff]/40 focus:shadow-[0_0_0_4px_rgba(170,199,255,0.08)] transition-all"
                    />
                  </label>

                  <label className="block">
                    <span className="text-[11px] uppercase tracking-[0.28em] text-[#b5cbff] font-bold block mb-4">Email Address</span>
                    <input
                      required
                      type="email"
                      value={personalForm.email}
                      onChange={(event) => setPersonalForm((prev) => ({ ...prev, email: event.target.value }))}
                      placeholder="Enter your email address"
                      className="w-full rounded-2xl bg-[#0b1016] border border-white/5 px-6 py-5 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#aac7ff]/40 focus:shadow-[0_0_0_4px_rgba(170,199,255,0.08)] transition-all"
                    />
                  </label>

                  <div className="md:col-span-2 flex flex-col sm:flex-row gap-4 pt-2">
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-br from-[#aac7ff] to-[#3e90ff] px-8 py-5 text-lg font-bold text-[#003064] shadow-[0_12px_35px_rgba(62,144,255,0.25)] transition-all hover:scale-[1.02] hover:shadow-[0_20px_45px_rgba(62,144,255,0.35)] active:scale-[0.99]"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedSection(null)}
                      className="inline-flex items-center justify-center rounded-2xl border border-white/10 px-8 py-5 text-lg font-bold text-slate-200 transition-all hover:bg-white/5"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {selectedSection === 'delivery' && (
              <div className="rounded-[32px] border border-[#aac7ff]/15 bg-gradient-to-br from-[#20252d] via-[#1c2129] to-[#161b22] p-6 md:p-10 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
                  <div>
                    <span className="text-[11px] uppercase tracking-[0.28em] text-[#b5cbff] font-bold block mb-3">Shipping Directory</span>
                    <h3 className="text-3xl font-bold tracking-tight text-slate-100 mb-3">Delivery Contacts</h3>
                    <p className="text-slate-400">Add and manage your saved delivery contacts from this section.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingContactId(null);
                      setDeliveryForm({
                        email: '',
                        phone: '',
                        address: '',
                        ci: '',
                      });
                      setShowDeliveryForm(true);
                    }}
                    className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#aac7ff] to-[#3e90ff] px-6 py-4 text-base font-bold text-[#003064] shadow-[0_12px_35px_rgba(62,144,255,0.25)] transition-all hover:scale-[1.02] hover:shadow-[0_20px_45px_rgba(62,144,255,0.35)] active:scale-[0.99]"
                  >
                    Add Contact
                  </button>
                </div>

                {showDeliveryForm && (
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();

                      if (editingContactId !== null) {
                        setDeliveryContacts((prev) =>
                          prev.map((contact) =>
                            contact.id === editingContactId ? { ...contact, ...deliveryForm } : contact
                          )
                        );
                      } else {
                        setDeliveryContacts((prev) => [
                          ...prev,
                          {
                            id: Date.now(),
                            ...deliveryForm,
                          },
                        ]);
                      }

                      resetDeliveryForm();
                    }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 rounded-[28px] border border-white/5 bg-[#0f141b]/80 p-6 md:p-8 mb-8"
                  >
                    <label className="block">
                      <span className="text-[11px] uppercase tracking-[0.28em] text-[#b5cbff] font-bold block mb-4">Email</span>
                      <input
                        required
                        type="email"
                        value={deliveryForm.email}
                        onChange={(event) => setDeliveryForm((prev) => ({ ...prev, email: event.target.value }))}
                        placeholder="contact@email.com"
                        className="w-full rounded-2xl bg-[#0b1016] border border-white/5 px-6 py-5 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#aac7ff]/40 focus:shadow-[0_0_0_4px_rgba(170,199,255,0.08)] transition-all"
                      />
                    </label>

                    <label className="block">
                      <span className="text-[11px] uppercase tracking-[0.28em] text-[#b5cbff] font-bold block mb-4">Phone</span>
                      <input
                        required
                        type="tel"
                        value={deliveryForm.phone}
                        onChange={(event) => setDeliveryForm((prev) => ({ ...prev, phone: event.target.value }))}
                        placeholder="Enter phone number"
                        className="w-full rounded-2xl bg-[#0b1016] border border-white/5 px-6 py-5 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#aac7ff]/40 focus:shadow-[0_0_0_4px_rgba(170,199,255,0.08)] transition-all"
                      />
                    </label>

                    <label className="block md:col-span-2">
                      <span className="text-[11px] uppercase tracking-[0.28em] text-[#b5cbff] font-bold block mb-4">Address</span>
                      <input
                        required
                        type="text"
                        value={deliveryForm.address}
                        onChange={(event) => setDeliveryForm((prev) => ({ ...prev, address: event.target.value }))}
                        placeholder="Enter delivery address"
                        className="w-full rounded-2xl bg-[#0b1016] border border-white/5 px-6 py-5 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#aac7ff]/40 focus:shadow-[0_0_0_4px_rgba(170,199,255,0.08)] transition-all"
                      />
                    </label>

                    <label className="block">
                      <span className="text-[11px] uppercase tracking-[0.28em] text-[#b5cbff] font-bold block mb-4">CI</span>
                      <input
                        required
                        type="text"
                        value={deliveryForm.ci}
                        onChange={(event) => setDeliveryForm((prev) => ({ ...prev, ci: event.target.value }))}
                        placeholder="Enter CI"
                        className="w-full rounded-2xl bg-[#0b1016] border border-white/5 px-6 py-5 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#aac7ff]/40 focus:shadow-[0_0_0_4px_rgba(170,199,255,0.08)] transition-all"
                      />
                    </label>

                    <div className="md:col-span-2 flex flex-col sm:flex-row gap-4 pt-2">
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#aac7ff] to-[#3e90ff] px-8 py-5 text-lg font-bold text-[#003064] shadow-[0_12px_35px_rgba(62,144,255,0.25)] transition-all hover:scale-[1.02] hover:shadow-[0_20px_45px_rgba(62,144,255,0.35)] active:scale-[0.99]"
                      >
                        {editingContactId !== null ? 'Save Changes' : 'Save Contact'}
                      </button>
                      <button
                        type="button"
                        onClick={resetDeliveryForm}
                        className="inline-flex items-center justify-center rounded-2xl border border-white/10 px-8 py-5 text-lg font-bold text-slate-200 transition-all hover:bg-white/5"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {deliveryContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="rounded-[28px] border border-white/5 bg-white/[0.03] p-6 md:p-7 backdrop-blur-sm"
                    >
                      <div className="space-y-5">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#aac7ff]/10 text-[#aac7ff]">
                            <Mail size={20} />
                          </div>
                          <div>
                            <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500 font-bold mb-2">Email</p>
                            <p className="text-slate-200 break-all">{contact.email}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#aac7ff]/10 text-[#aac7ff]">
                            <Phone size={20} />
                          </div>
                          <div>
                            <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500 font-bold mb-2">Phone</p>
                            <p className="text-slate-200">{contact.phone}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#aac7ff]/10 text-[#aac7ff]">
                            <MapPin size={20} />
                          </div>
                          <div>
                            <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500 font-bold mb-2">Address</p>
                            <p className="text-slate-200">{contact.address}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#aac7ff]/10 text-[#aac7ff]">
                            <IdCard size={20} />
                          </div>
                          <div>
                            <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500 font-bold mb-2">CI</p>
                            <p className="text-slate-200">{contact.ci}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 pt-6 mt-6 border-t border-white/5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingContactId(contact.id);
                            setDeliveryForm({
                              email: contact.email,
                              phone: contact.phone,
                              address: contact.address,
                              ci: contact.ci,
                            });
                            setShowDeliveryForm(true);
                          }}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 px-5 py-4 text-sm font-bold text-slate-200 transition-all hover:bg-white/5"
                        >
                          <Pencil size={16} />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeliveryContacts((prev) => prev.filter((item) => item.id !== contact.id))}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#f87171]/20 bg-[#f87171]/8 px-5 py-4 text-sm font-bold text-[#ffb2b2] transition-all hover:bg-[#f87171]/14"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-[32px] border border-white/5 bg-white/[0.03] p-6 md:p-8 backdrop-blur-sm shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#aac7ff] to-[#3e90ff] text-[#003064] flex items-center justify-center mb-8 shadow-[0_12px_35px_rgba(62,144,255,0.25)]">
              <LogOut size={28} />
            </div>
            <h3 className="text-3xl font-bold tracking-tight text-slate-100 mb-4">Exit Account</h3>
            <p className="text-slate-400 leading-relaxed mb-8">
              Return to the homepage while keeping the same premium storefront experience.
            </p>
            <button
              onClick={onExit}
              className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-br from-[#aac7ff] to-[#3e90ff] px-8 py-5 text-lg font-bold text-[#003064] shadow-[0_12px_35px_rgba(62,144,255,0.25)] transition-all hover:scale-[1.02] hover:shadow-[0_20px_45px_rgba(62,144,255,0.35)] active:scale-[0.99]"
            >
              Exit to Home
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>
    </motion.div>
  );
}


function OrderHistory({
  onBackToAccount,
  onGoHome,
}: {
  onBackToAccount: () => void;
  onGoHome: () => void;
  key?: string;
}) {
  const orders = [
    {
      id: 'HV-2026-001',
      date: 'March 12, 2026',
      total: '$1,458.00',
      paymentType: 'Credit Card',
      status: 'Delivered',
      details: '2 items shipped to Miami, FL. Tracking completed and signed at delivery.',
    },
    {
      id: 'HV-2026-002',
      date: 'March 07, 2026',
      total: '$349.00',
      paymentType: 'Bank Transfer',
      status: 'Cancelled',
      details: 'Order cancelled before fulfillment. Refund issued to the original payment method.',
    },
    {
      id: 'HV-2026-003',
      date: 'February 28, 2026',
      total: '$2,094.00',
      paymentType: 'PayPal',
      status: 'Processing',
      details: 'Warehouse confirmation completed. Final packaging and dispatch are in progress.',
    },
  ];
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(orders[0].id);

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

        <div className="relative z-10 max-w-5xl mb-14 md:mb-16">
          <span className="text-xs uppercase tracking-[0.35em] text-[#aac7ff] font-bold mb-6 block">Order Records</span>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 text-slate-100 leading-[0.95] drop-shadow-[0_0_20px_rgba(170,199,255,0.15)]">
            Order History & Details
          </h1>
          <p className="text-lg md:text-2xl text-slate-400 max-w-4xl leading-relaxed">
            Review your previous purchases, payment methods, fulfillment status, and order-level details from one place.
          </p>
        </div>

        <div className="relative z-10 rounded-[32px] border border-white/5 bg-gradient-to-br from-[#20252d] via-[#1c2129] to-[#161b22] p-4 md:p-8 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="px-4 py-4 text-[11px] uppercase tracking-[0.28em] text-[#b5cbff] font-bold">Order No</th>
                  <th className="px-4 py-4 text-[11px] uppercase tracking-[0.28em] text-[#b5cbff] font-bold">Date</th>
                  <th className="px-4 py-4 text-[11px] uppercase tracking-[0.28em] text-[#b5cbff] font-bold">Total Price</th>
                  <th className="px-4 py-4 text-[11px] uppercase tracking-[0.28em] text-[#b5cbff] font-bold">Payment Type</th>
                  <th className="px-4 py-4 text-[11px] uppercase tracking-[0.28em] text-[#b5cbff] font-bold">Status</th>
                  <th className="px-4 py-4 text-[11px] uppercase tracking-[0.28em] text-[#b5cbff] font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-white/5 last:border-b-0">
                    <td className="px-4 py-5 text-slate-100 font-semibold whitespace-nowrap">{order.id}</td>
                    <td className="px-4 py-5 text-slate-300 whitespace-nowrap">{order.date}</td>
                    <td className="px-4 py-5 text-slate-100 font-semibold whitespace-nowrap">{order.total}</td>
                    <td className="px-4 py-5 text-slate-300 whitespace-nowrap">{order.paymentType}</td>
                    <td className="px-4 py-5 whitespace-nowrap">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                          order.status === 'Delivered'
                            ? 'bg-emerald-500/12 text-emerald-300'
                            : order.status === 'Cancelled'
                              ? 'bg-rose-500/12 text-rose-300'
                              : 'bg-amber-500/12 text-amber-300'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-5">
                      <button
                        type="button"
                        onClick={() => setSelectedOrderId(order.id)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm font-bold text-slate-200 transition-all hover:bg-white/5"
                      >
                        <Eye size={16} />
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 rounded-[28px] border border-white/5 bg-white/[0.03] p-6 md:p-8 backdrop-blur-sm">
            {orders
              .filter((order) => order.id === selectedOrderId)
              .map((order) => (
                <div key={order.id}>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
                    <div>
                      <span className="text-[11px] uppercase tracking-[0.28em] text-[#b5cbff] font-bold block mb-2">Selected Order</span>
                      <h2 className="text-3xl font-bold tracking-tight text-slate-100">{order.id}</h2>
                    </div>
                    <span className="text-sm text-slate-400">Placed on {order.date}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed mb-6">{order.details}</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-2xl border border-white/5 bg-[#0f141b]/80 p-5">
                      <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500 font-bold mb-2">Payment</p>
                      <p className="text-slate-100 font-semibold">{order.paymentType}</p>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-[#0f141b]/80 p-5">
                      <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500 font-bold mb-2">Total</p>
                      <p className="text-slate-100 font-semibold">{order.total}</p>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-[#0f141b]/80 p-5">
                      <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500 font-bold mb-2">Status</p>
                      <p className="text-slate-100 font-semibold">{order.status}</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={onBackToAccount}
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 px-8 py-5 text-lg font-bold text-slate-200 transition-all hover:bg-white/5"
            >
              Back to My Account
            </button>
            <button
              type="button"
              onClick={onGoHome}
              className="inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-br from-[#aac7ff] to-[#3e90ff] px-8 py-5 text-lg font-bold text-[#003064] shadow-[0_12px_35px_rgba(62,144,255,0.25)] transition-all hover:scale-[1.02] hover:shadow-[0_20px_45px_rgba(62,144,255,0.35)] active:scale-[0.99]"
            >
              Home
              <ArrowRight size={20} />
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
