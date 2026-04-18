import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, LogOut, Menu, X, LayoutDashboard, Package, User as UserIcon, ListChecks } from 'lucide-react';
import CartDrawer from './Cart/CartDrawer';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname.startsWith('/sevimler-panel-2026-secure')) return null;

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Production Restricted Categories
  const categories = [
    { name: 'Kuruyemiş', href: '#products' },
    { name: 'Kuru Meyve', href: '#products' }
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 px-4 md:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <img 
            src="https://api.sevimlerkuruyemis.com/assets/logo.jpeg" 
            alt="Sevimler Logo" 
            className="h-17 w-auto object-contain"
          />
          <div className="flex flex-col leading-tight">
            <span className="text-xl font-bold text-[#1c1917] tracking-tight">Sevimler</span>
            <span className="text-xs font-medium text-[#d97706] tracking-widest uppercase">Kuruyemiş</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center space-x-12">
          <div className="flex space-x-8 text-xs font-bold uppercase tracking-[0.15em] text-[#1c1917]/70">
            {categories.map((cat) => (
              <a key={cat.name} href={cat.href} className="hover:text-[#d97706] transition-colors">
                {cat.name}
              </a>
            ))}
          </div>

          <div className="flex items-center space-x-6">
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 hover:bg-gray-50 rounded-full transition-all group"
            >
              <ShoppingCart className="w-5 h-5 text-[#1c1917] group-hover:text-[#d97706]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#d97706] text-white text-[10px] font-bold w-4.5 h-4.5 flex items-center justify-center rounded-full shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>

            {user ? (
              <div className="flex items-center space-x-6">
                <Link 
                  to="/my-orders" 
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1c1917] hover:text-[#d97706] transition-colors flex items-center gap-2"
                >
                  <ListChecks className="w-4 h-4" />
                  <span>Siparişlerim</span>
                </Link>

                {user.is_admin && (
                  <Link 
                    to="/sevimler-panel-2026-secure" 
                    className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d97706] hover:text-[#b45309] transition-colors flex items-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Panel</span>
                  </Link>
                )}
                <button 
                  onClick={() => { logout(); navigate('/'); }}
                  className="p-2 hover:bg-gray-50 rounded-full transition-all group"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5 text-[#1c1917] group-hover:text-red-500" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1c1917] px-4 py-2 hover:text-[#d97706] transition-colors">Giriş</Link>
                <Link to="/register" className="text-[10px] font-black uppercase tracking-[0.2em] bg-[#1c1917] text-white px-5 py-2.5 rounded-full hover:bg-black transition-all">Kayıt Ol</Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Toggle */}
        <div className="flex lg:hidden items-center space-x-2">
           <button onClick={() => setIsCartOpen(true)} className="relative p-2">
              <ShoppingCart className="w-6 h-6 text-[#1c1917]" />
              {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-[#d97706] text-white text-[10px] font-bold w-4.5 h-4.5 flex items-center justify-center rounded-full">{cartCount}</span>}
           </button>
           <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-[#1c1917]">
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
           </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-0 top-16 z-40 bg-white lg:hidden p-8 flex flex-col space-y-8"
          >
             <div className="flex flex-col space-y-6">
                {categories.map((cat) => (
                  <a 
                    key={cat.name} 
                    href={cat.href} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-2xl font-playfair font-bold text-[#1c1917] hover:text-[#d97706] transition-colors"
                  >
                    {cat.name}
                  </a>
                ))}
                {user && (
                   <Link 
                    to="/my-orders" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-2xl font-playfair font-bold text-[#1c1917] hover:text-[#d97706] transition-colors flex items-center gap-4"
                  >
                    <ListChecks className="w-6 h-6" />
                    <span>Siparişlerim</span>
                  </Link>
                )}
             </div>
             <div className="pt-8 border-t border-gray-100 flex flex-col space-y-4">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold uppercase tracking-widest text-[#1c1917]">Giriş Yap</Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="bg-[#1c1917] text-white px-6 py-4 rounded-xl font-bold uppercase tracking-widest text-center">Kayıt Ol</Link>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Navbar;
