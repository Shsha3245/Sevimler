import React from 'react';
import { useCart } from '../../context/CartContext';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const CartDrawer = ({ isOpen, onClose }) => {
  const { cart, updateQuantity, removeFromCart, total } = useCart();
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />
          
          {/* Drawer */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 250 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[70] shadow-2xl flex flex-col border-l border-gray-100"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <h2 className="text-xl font-serif text-[#1c1917] font-bold">Sepetim</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full transition-all text-stone-400">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-stone-300 space-y-4">
                  <ShoppingBag className="w-16 h-16 opacity-20" />
                  <p className="text-lg font-bold">Sepetiniz şu an boş.</p>
                  <button 
                    onClick={onClose}
                    className="text-[#d97706] hover:underline font-bold text-sm uppercase tracking-widest"
                  >Alışverişe Başla</button>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex space-x-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 transition-all hover:shadow-md">
                    <img 
                      src={item.image_url.startsWith('https') ? item.image_url : `https://api.sevimlerkuruyemis.com${item.image_url}`} 
                      alt={item.name} 
                      className="w-20 h-20 object-cover rounded-xl border border-gray-200"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-[#1c1917] text-sm leading-tight">{item.name}</h3>
                        <p className="text-[#d97706] font-black mt-1">{item.price.toLocaleString('tr-TR')} ₺</p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-1 bg-white border border-gray-200 rounded-lg p-1">
                          <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:text-[#d97706] text-stone-400">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-black text-[#1c1917]">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:text-[#d97706] text-stone-400">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-stone-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-gray-100 bg-white space-y-4 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
                <div className="flex justify-between items-center">
                  <span className="text-stone-400 text-sm font-bold uppercase tracking-widest">Toplam</span>
                  <span className="text-[#1c1917] font-black text-2xl tracking-tight">{total.toLocaleString('tr-TR')} ₺</span>
                </div>
                <button 
                  onClick={() => { onClose(); navigate('/checkout'); }}
                  className="w-full bg-[#d97706] hover:bg-amber-700 text-white py-4 rounded-2xl font-black transition-all transform active:scale-[0.98] uppercase tracking-[0.2em] text-xs shadow-lg shadow-amber-900/10"
                >
                  Siparişi Tamamla
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
