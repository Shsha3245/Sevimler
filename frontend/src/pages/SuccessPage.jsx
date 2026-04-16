import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Truck, ArrowRight, ShoppingBag, Clock } from 'lucide-react';
import api from '../services/api';

const SuccessPage = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const orderId = query.get('orderId');
  const isMock = query.get('mode') === 'mock';
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${orderId}`);
        setOrder(res.data);
      } catch (err) {
        console.error("Order fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    if (orderId) fetchOrder();
    else setLoading(false);
  }, [orderId]);

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 flex items-center justify-center bg-white text-[#1c1917]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full bg-white border border-gray-100 p-12 rounded-[3rem] shadow-2xl text-center space-y-8"
      >
        <div className="flex justify-center">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 12 }}
            className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-green-500 shadow-inner"
          >
            <CheckCircle2 className="w-12 h-12" />
          </motion.div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-serif font-bold text-[#1c1917]">Siparişiniz Alındı!</h1>
          <p className="text-stone-500 font-medium">Harika bir seçim yaptınız. Ürünleriniz en kısa sürede yola çıkacak.</p>
        </div>

        {loading ? (
           <div className="p-8 bg-gray-50 rounded-3xl animate-pulse text-stone-400 text-xs font-bold uppercase tracking-widest">
              Sipariş Bilgileri Yükleniyor...
           </div>
        ) : order && (
           <div className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100 space-y-6 text-left">
              <div className="flex justify-between items-center pb-4 border-b border-gray-200/50">
                 <span className="text-[10px] uppercase tracking-widest font-black text-stone-400">Sipariş No</span>
                 <span className="font-mono font-bold text-[#1c1917]">#{order.id}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-200/50">
                 <span className="text-[10px] uppercase tracking-widest font-black text-stone-400">Durum</span>
                 <div className="flex items-center space-x-2">
                    {order.status === 'paid' && <Clock className="w-3 h-3 text-blue-500" />}
                    {order.status === 'shipped' && <Truck className="w-3 h-3 text-[#d97706]" />}
                    <span className={`text-[10px] uppercase tracking-widest font-black ${
                        order.status === 'shipped' ? 'text-[#d97706]' : 
                        order.status === 'paid' ? 'text-blue-500' : 'text-stone-500'
                    }`}>
                      {order.status === 'paid' ? 'Ödeme Onaylandı' : order.status === 'shipped' ? 'Kargoya Verildi' : order.status}
                    </span>
                 </div>
              </div>
              {order.tracking_number && (
                <div className="flex justify-between items-center">
                   <span className="text-[10px] uppercase tracking-widest font-black text-stone-400">Takip No</span>
                   <span className="font-bold text-[#d97706] tracking-tighter">{order.tracking_number}</span>
                </div>
              )}
              {isMock && (
                <div className="pt-2 text-center">
                  <span className="text-[9px] bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-black uppercase tracking-[0.2em]">Test Modu Aktif</span>
                </div>
              )}
           </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link to="/" className="flex items-center justify-center space-x-2 bg-[#1c1917] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl">
            <ShoppingBag className="w-4 h-4" />
            <span>Alışverişe Devam</span>
          </Link>
          <Link to="/my-orders" className="flex items-center justify-center space-x-2 bg-gray-50 text-[#1c1917] py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all border border-gray-100">
            <span>Siparişlerimi Gör</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default SuccessPage;
