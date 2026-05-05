import React, { useState, useMemo, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Weight } from 'lucide-react';

const Checkout = () => {
  const { cart, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    address: '',
    phone: '',
    email: user?.email || '',
  });

  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [iframeToken, setIframeToken] = useState(null); // PayTR Token için state

  const isCartValid = Array.isArray(cart) && cart.length > 0;

  const totalWeight = useMemo(() => {
    if (!isCartValid) return 0;
    return cart.reduce(
      (acc, item) => acc + (item.weight || 1) * item.quantity,
      0
    );
  }, [cart, isCartValid]);

  const isWeightValid = totalWeight >= 1 && totalWeight <= 100;

  // PayTR iframe scriptini yükle
  useEffect(() => {
    if (iframeToken) {
      const script = document.createElement('script');
      script.src = "https://www.paytr.com/js/iframeResizer.min.js";
      script.async = true;
      document.body.appendChild(script);
      
      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, [iframeToken]);

  const handleInputChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleCheckout = async (e) => {
    e.preventDefault();

    if (!isCartValid) {
      setErrorMessage('Sepet boş');
      return;
    }

    if (!isWeightValid) {
      setErrorMessage('Ağırlık 1-100 KG arası olmalı');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      // 1️⃣ ORDER OLUŞTUR
      const orderItems = cart.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
      }));

      const orderRes = await api.post('/orders', {
        ...formData,
        items: orderItems,
      });

      const orderId = orderRes?.data?.id;
      if (!orderId) throw new Error('Order oluşturulamadı');

      // 2️⃣ PAYTR DATA AL
      const paymentRes = await api.post('/payment/create', {
        order_id: orderId,
      });

      const paymentData = paymentRes?.data;

      if (!paymentData || !paymentData.paytr_token) {
        throw new Error("PAYTR DATA YOK");
      }

      // MOCK varsa direkt yönlendir (Test modu için)
      if (paymentData.mode === 'MOCK') {
        clearCart();
        navigate(`/success?orderId=${orderId}&mode=mock`);
        return;
      }

      // 3️⃣ IFRAME TOKEN SET ET
      // Formu submit etmek yerine token'ı state'e atıyoruz
      setIframeToken(paymentData.paytr_token);
      setStatus('waiting_payment');
      clearCart(); // Ödeme aşamasına geçince sepeti temizleyebiliriz

    } catch (err) {
      setStatus('error');
      setErrorMessage(
        err.response?.data?.detail ||
        err.message ||
        'Ödeme hatası'
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        
        {/* Başlık ve Geri Dön Butonu (Sadece form varken gösterilir) */}
        {!iframeToken && (
          <div
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 cursor-pointer mb-6 text-gray-600 hover:text-black transition-colors"
          >
            <ArrowLeft size={18} />
            Geri Dön
          </div>
        )}

        <div className={iframeToken ? "w-full" : "grid md:grid-cols-2 gap-10"}>
          
          {/* SOL TARAF: FORM VEYA IFRAME */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            {iframeToken ? (
              <div className="w-full">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <span className="w-2 h-8 bg-green-500 rounded-full"></span>
                  Güvenli Ödeme
                </h2>
                <iframe
                  src={`https://www.paytr.com/odeme/guvenli/${iframeToken}`}
                  id="paytriframe"
                  frameBorder="0"
                  scrolling="no"
                  className="w-full min-h-[650px]"
                ></iframe>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-6">Teslimat Bilgileri</h2>
                <form onSubmit={handleCheckout} className="space-y-4">
                  <input name="full_name" placeholder="Ad Soyad" required
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all"
                  />
                  <textarea name="address" placeholder="Adres" required
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all"
                    rows={4}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input name="phone" placeholder="Telefon" required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all"
                    />
                    <input name="email" placeholder="Email" required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all"
                    />
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 p-2 rounded-md w-fit">
                    <Weight size={16} />
                    Toplam Ağırlık: <strong>{totalWeight.toFixed(2)} KG</strong>
                  </div>

                  {!isWeightValid && (
                    <p className="text-red-500 text-sm font-medium">
                      ⚠️ Ağırlık 1-100 KG arası olmalı
                    </p>
                  )}

                  {status === 'error' && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg flex gap-2 items-center">
                      <AlertTriangle size={18} />
                      <span className="text-sm font-medium">{errorMessage}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'loading' || !isWeightValid}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold text-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {status === 'loading' ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Hazırlanıyor...
                      </span>
                    ) : 'Ödemeye Geç'}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* SAĞ TARAF: SİPARİŞ ÖZETİ (Sadece iframe yokken gösterilir) */}
          {!iframeToken && (
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 h-fit sticky top-32">
              <h2 className="text-xl font-bold mb-6 border-b pb-4">Sipariş Özeti</h2>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {isCartValid && cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-800">{item.name}</span>
                      <span className="text-gray-500 text-xs">Adet: {item.quantity}</span>
                    </div>
                    <span className="font-semibold">{(item.price * item.quantity).toFixed(2)} ₺</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-4 border-t border-dashed">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Toplam</span>
                  <span className="text-green-600 text-2xl">{total.toFixed(2)} ₺</span>
                </div>
                <p className="text-xs text-gray-400 mt-2 text-center italic">
                  KDV Dahil fiyatlardır.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Checkout;
