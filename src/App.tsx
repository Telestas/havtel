import { useEffect, useRef, useState } from 'react';
import { 
  ShoppingCart, 
  User, 
  CircleUserRound,
  ArrowRight, 
  ChevronRight, 
  Globe, 
  Share2, 
  ShieldCheck, 
  MessageSquare,
  Search,
  MapPin,
  Mail,
  AtSign,
  Phone,
  Pencil,
  Trash2,
  IdCard,
  Eye,
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

type View = 'home' | 'shop' | 'support' | 'account' | 'orders';

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
  const [cartCount, setCartCount] = useState(0);
  const [notification, setNotification] = useState<string | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  const addToCart = (productName: string) => {
    setCartCount(prev => prev + 1);
    setNotification(`Added ${productName} to cart`);
    setTimeout(() => setNotification(null), 3000);
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

  return (
    <div className="min-h-screen bg-[#101419] text-[#e0e2ea] font-sans selection:bg-[#aac7ff]/30 antialiased">
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
          <button className="text-slate-400 hover:text-slate-100 transition-colors p-2 rounded-full hover:bg-white/5 relative">
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
                        setView('account');
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

      <AnimatePresence mode="wait">
        {view === 'home' ? (
          <Home key="home" onShopClick={() => setView('shop')} />
        ) : view === 'shop' ? (
          <Shop key="shop" onAddToCart={addToCart} />
        ) : view === 'orders' ? (
          <OrderHistory key="orders" onBackToAccount={() => setView('account')} onGoHome={() => setView('home')} />
        ) : view === 'account' ? (
          <Account key="account" onExit={() => setView('home')} onOpenOrders={() => setView('orders')} />
        ) : (
          <Support key="support" />
        )}
      </AnimatePresence>


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
    </div>
  );
}

function Home({ onShopClick }: { onShopClick: () => void; key?: string }) {
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
            <div key={prod.id} className="bg-[#1c2025]/50 border border-white/5 rounded-2xl overflow-hidden group hover:border-[#aac7ff]/30 transition-all">
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
                  <button onClick={onShopClick} className="p-2 bg-white/5 rounded-lg text-slate-400 hover:bg-[#aac7ff] hover:text-[#003064] transition-all">
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

function Shop({ onAddToCart }: { onAddToCart: (name: string) => void; key?: string }) {
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
              <div key={prod.id} className="bg-[#1c2025]/50 border border-white/5 rounded-2xl overflow-hidden group hover:border-[#aac7ff]/30 transition-all">
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
                      onClick={() => onAddToCart(prod.name)}
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
