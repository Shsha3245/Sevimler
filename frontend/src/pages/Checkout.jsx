import React, { useState, useMemo } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Truck, ShoppingBag, CheckCircle2, AlertTriangle, ArrowLeft, Weight } from 'lucide-react';

const Checkout = () => {
  const { cart, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: '',
    address: '',
    phone: '',
  });

  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState('');

  // Calculate Total Weight for Production Validation
  const totalWeight = useMemo(() => {
    return cart.reduce((acc, item) => acc + (item.weight || 1.0) * item.quantity, 0);
  }, [cart]);

  const isWeightValid = totalWeight >= 1.0 && totalWeight <= 100.0;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!isWeightValid) return;

    setStatus('loading');
    
    try {
      const orderItems = cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity
      }));

      const orderResponse = await api.post('/orders', {
        ...formData,
        items: orderItems
      });

      const orderId = orderResponse.data.id;

      // Initiate PayTR Payment
      const paymentRes = await api.post('/payment/create', { order_id: orderId });
      
      // Clear cart before moving to success/payment
      clearCart();

      // For Mock Mode: Redirect to success with mode info
      if (paymentRes.data.mode === 'MOCK') {
          navigate(`/success?orderId=${orderId}&mode=mock`);
      } else {
          // Real PayTR integration would handle token/iframe here
          navigate(`/success?orderId=${orderId}`);
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage(err.response?.data?.detail || 'Sipariş sırasında bir hata oluştu. Lütfen bilgileri kontrol edin.');
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 max-w-6xl mx-auto bg-white">
      <div className="flex items-center space-x-2 mb-8 text-stone-400 hover:text-[#d97706] transition-colors cursor-pointer" onClick={() => navigate(-1)}>
        <ArrowLeft className="w-4 h-4" />
        <span className="text-xs uppercase tracking-widest font-bold">Geri Dön</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Left: Form */}
        <div className="space-y-12">
          <div className="space-y-2">
            <h1 className="text-4xl font-serif font-bold text-[#1c1917]">Ödeme Bilgileri</h1>
            <p className="text-stone-400">Siparişinizi tamamlamak için bilgilerinizi girin.</p>
          </div>

          <form onSubmit={handleCheckout} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-stone-400 font-bold ml-1">Ad Soyad</label>
                <input 
                  type="text" 
                  name="full_name"
                  required
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-[#1c1917] focus:outline-none focus:border-[#d97706]/50 transition-all shadow-sm"
                  placeholder="Ahmet Yılmaz"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-stone-400 font-bold ml-1">Teslimat Adresi</label>
                <textarea 
                  name="address"
                  required
                  rows="4"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-[#1c1917] focus:outline-none focus:border-[#d97706]/50 transition-all resize-none shadow-sm"
                  placeholder="Mahalle, Sokak, No, Daire, İlçe/İl"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-stone-400 font-bold ml-1">Telefon Numarası</label>
                <input 
                  type="tel" 
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-[#1c1917] focus:outline-none focus:border-[#d97706]/50 transition-all shadow-sm"
                  placeholder="+90 5XX XXX XX XX"
                />
              </div>
            </div>

            <div className={`p-6 rounded-3xl border transition-all space-y-4 ${isWeightValid ? 'bg-gray-50 border-gray-100' : 'bg-red-50 border-red-100'}`}>
               <div className={`flex items-center space-x-3 ${isWeightValid ? 'text-[#d97706]' : 'text-red-500'}`}>
                  <Weight className="w-5 h-5" />
                  <span className="font-bold text-sm uppercase tracking-wider">Sipariş Ağırlığı: {totalWeight.toFixed(2)} KG</span>
               </div>
                {!isWeightValid && (
                  <p className="text-red-600 text-[10px] font-black uppercase tracking-[0.2em] bg-white/50 p-2 rounded-lg">
                    Ağırlık limitleri: 1 KG - 100 KG arası olmalıdır.
                  </p>
                )}
               <p className="text-stone-500 text-xs">Siparişiniz sonrası PayTR güvenli ödeme sistemine yönlendirileceksiniz. Kredi kartı veya Banka kartı ile ödeme yapabilirsiniz.</p>
            </div>

            {status === 'error' && (
              <div className="flex items-center space-x-3 text-red-500 text-sm bg-red-50 p-4 rounded-xl border border-red-100">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button 
              type="submit" 
              disabled={status === 'loading' || cart.length === 0 || !isWeightValid}
              className="w-full bg-[#1c1917] h-16 text-white rounded-2xl font-bold transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center space-x-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? (
                <div className="w-6 h-6 border-3 border-white border-t-transparent animate-spin rounded-full" />
              ) : (
                <>
                  <span className="uppercase tracking-widest text-sm text-[#d97706]">Siparişi Onayla ve Tamamla</span>
                  <ShoppingBag className="w-5 h-5 text-[#d97706]" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Summary */}
        <div className="lg:sticky lg:top-32 h-fit space-y-8 lg:max-w-md lg:ml-auto w-full">
           <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl space-y-6">
              <h2 className="text-xl font-serif text-[#1c1917] font-bold pb-4 border-b border-gray-50">Sipariş Özeti</h2>
              
              <div className="space-y-4 max-h-[40vh] overflow-y-auto no-scrollbar">
                 {cart.map(item => (
                   <div key={item.id} className="flex justify-between items-center group">
                      <div className="flex items-center space-x-3">
                         <div className="relative">
                            <img src={item.image_url.startsWith('http') ? item.image_url : `http://localhost:8000${item.image_url}`} alt={item.name} className="w-12 h-12 object-cover rounded-lg border border-gray-100" />
                            <span className="absolute -top-1 -right-1 bg-[#d97706] text-white text-[10px] font-bold w-4.5 h-4.5 flex items-center justify-center rounded-full">
                               {item.quantity}
                            </span>
                         </div>
                         <div className="flex flex-col">
                            <span className="text-sm text-stone-600 group-hover:text-[#d97706] transition-colors">{item.name}</span>
                            <span className="text-[10px] text-stone-400 italic">{(item.weight || 1.0)} KG</span>
                         </div>
                      </div>
                      <span className="text-sm font-bold text-[#1c1917]">{(item.price * item.quantity).toLocaleString('tr-TR')} ₺</span>
                   </div>
                 ))}
              </div>

              <div className="pt-6 border-t border-gray-100 space-y-3">
                 <div className="flex justify-between text-sm text-stone-400">
                    <span>Ara Toplam</span>
                    <span>{total.toLocaleString('tr-TR')} ₺</span>
                 </div>
                 <div className="flex justify-between text-sm text-stone-400">
                    <span>Teslimat</span>
                    <span className="text-green-600 font-bold">ÜCRETSİZ</span>
                 </div>
                 <div className="flex justify-between text-xl font-bold pt-4">
                    <span className="text-[#1c1917]">Toplam</span>
                    <span className="text-[#d97706]">{total.toLocaleString('tr-TR')} ₺</span>
                 </div>
              </div>
           </div>

           <div className="flex items-center space-x-4 px-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <div className="p-3 bg-white rounded-full shadow-sm"><Truck className="w-5 h-5 text-[#d97706]" /></div>
              <p className="text-[10px] text-stone-400 uppercase tracking-widest leading-relaxed font-bold">
                Tüm siparişleriniz hijyen kurallarına uygun olarak paketlenir ve aynı gün kargoya verilir.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
