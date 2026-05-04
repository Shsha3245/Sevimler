import React, { useState, useMemo } from 'react';
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

  // ---------------------------
  // TOTAL WEIGHT
  // ---------------------------
  const totalWeight = useMemo(() => {
    return cart.reduce(
      (acc, item) => acc + (item.weight || 1.0) * item.quantity,
      0
    );
  }, [cart]);

  const isWeightValid = totalWeight >= 1 && totalWeight <= 100;

  // ---------------------------
  // INPUT
  // ---------------------------
  const handleInputChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // ---------------------------
  // CHECKOUT
  // ---------------------------
  const handleCheckout = async (e) => {
    e.preventDefault();

    if (!isWeightValid || cart.length === 0) return;

    setStatus('loading');
    setErrorMessage('');

    try {
      const orderItems = cart.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
      }));

      // 1) ORDER
      const orderRes = await api.post('/orders', {
        ...formData,
        items: orderItems,
      });

      const orderId = orderRes.data.id;

      // 2) PAYMENT
      const paymentRes = await api.post('/payment/create', {
        order_id: orderId,
      });

      // 3) MOCK MODE
      if (paymentRes.data.mode === 'MOCK') {
        clearCart();
        navigate(`/success?orderId=${orderId}&mode=mock`);
        return;
      }

      // 4) PAYTR REDIRECT (CORRECT FLOW)
      const token = paymentRes.data.token;

      if (!token) {
        throw new Error('Payment token alınamadı');
      }

      clearCart();

      // PayTR secure redirect
      window.location.href = `https://www.paytr.com/odeme/guvenli/${token}`;

    } catch (err) {
      setStatus('error');
      setErrorMessage(
        err.response?.data?.detail ||
        err.message ||
        'Ödeme işlemi başarısız'
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20 px-4">

      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10">

        {/* FORM */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">

          <div
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 cursor-pointer mb-6 text-gray-600 hover:text-black"
          >
            <ArrowLeft size={18} />
            Geri Dön
          </div>

          <h2 className="text-2xl font-bold mb-6">Teslimat Bilgileri</h2>

          <form onSubmit={handleCheckout} className="space-y-4">

            <input
              name="full_name"
              placeholder="Ad Soyad"
              required
              value={formData.full_name}
              onChange={handleInputChange}
              className="w-full border p-3 rounded-lg"
            />

            <textarea
              name="address"
              placeholder="Adres"
              required
              value={formData.address}
              onChange={handleInputChange}
              rows="4"
              className="w-full border p-3 rounded-lg"
            />

            <input
              name="phone"
              placeholder="Telefon"
              required
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full border p-3 rounded-lg"
            />

            <input
              name="email"
              placeholder="Email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="w-full border p-3 rounded-lg"
            />

            {/* WEIGHT */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Weight size={16} />
              {totalWeight.toFixed(2)} KG
            </div>

            {!isWeightValid && (
              <p className="text-red-500 text-sm">
                Ağırlık 1 - 100 KG arasında olmalı
              </p>
            )}

            {/* ERROR */}
            {status === 'error' && (
              <div className="bg-red-100 text-red-600 p-3 rounded flex items-center gap-2">
                <AlertTriangle size={18} />
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading' || !isWeightValid || cart.length === 0}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50"
            >
              {status === 'loading' ? 'Yükleniyor...' : 'Ödemeye Git'}
            </button>

          </form>
        </div>

        {/* SUMMARY */}
        <div className="bg-white p-6 rounded-2xl shadow-lg h-fit">

          <h2 className="text-xl font-bold mb-4">Sipariş Özeti</h2>

          <div className="space-y-3 max-h-80 overflow-y-auto">

            {cart.map((item) => (
              <div
                key={item.id}
                className="flex justify-between text-sm border-b pb-2"
              >
                <span>{item.name} x {item.quantity}</span>
                <span>{(item.price * item.quantity).toFixed(2)} ₺</span>
              </div>
            ))}

          </div>

          <div className="mt-6 border-t pt-4 flex justify-between font-bold text-lg">
            <span>Toplam</span>
            <span>{total.toFixed(2)} ₺</span>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Checkout;
