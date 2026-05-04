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

  const isCartValid = Array.isArray(cart) && cart.length > 0;

  const totalWeight = useMemo(() => {
    if (!isCartValid) return 0;

    return cart.reduce(
      (acc, item) => acc + (item.weight || 1) * item.quantity,
      0
    );
  }, [cart]);

  const isWeightValid = totalWeight >= 1 && totalWeight <= 100;

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

      // MOCK varsa direkt geç
      if (paymentData.mode === 'MOCK') {
        clearCart();
        navigate(`/success?orderId=${orderId}&mode=mock`);
        return;
      }

      // 3️⃣ PAYTR FORM (FULL PARAMS)
      const form = document.createElement("form");
      form.method = "POST";
      form.action = "https://www.paytr.com/odeme/guvenli/";

      Object.keys(paymentData).forEach((key) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = paymentData[key];
        form.appendChild(input);
      });

      document.body.appendChild(form);

      clearCart();
      form.submit();

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

      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10">

        {/* FORM */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">

          <div
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 cursor-pointer mb-6"
          >
            <ArrowLeft size={18} />
            Geri Dön
          </div>

          <h2 className="text-2xl font-bold mb-6">Teslimat</h2>

          <form onSubmit={handleCheckout} className="space-y-4">

            <input name="full_name" placeholder="Ad Soyad" required
              value={formData.full_name}
              onChange={handleInputChange}
              className="w-full border p-3 rounded-lg"
            />

            <textarea name="address" placeholder="Adres" required
              value={formData.address}
              onChange={handleInputChange}
              className="w-full border p-3 rounded-lg"
              rows={4}
            />

            <input name="phone" placeholder="Telefon" required
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full border p-3 rounded-lg"
            />

            <input name="email" placeholder="Email" required
              value={formData.email}
              onChange={handleInputChange}
              className="w-full border p-3 rounded-lg"
            />

            <div className="flex items-center gap-2 text-sm">
              <Weight size={16} />
              {totalWeight.toFixed(2)} KG
            </div>

            {!isWeightValid && (
              <p className="text-red-500 text-sm">
                Ağırlık 1-100 KG arası olmalı
              </p>
            )}

            {status === 'error' && (
              <div className="bg-red-100 text-red-600 p-3 rounded flex gap-2">
                <AlertTriangle size={16} />
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-green-600 text-white py-3 rounded-lg"
            >
              {status === 'loading' ? 'İşleniyor...' : 'Ödemeye Git'}
            </button>

          </form>
        </div>

        {/* SUMMARY */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">

          <h2 className="text-xl font-bold mb-4">Özet</h2>

          {isCartValid && cart.map((item) => (
            <div key={item.id} className="flex justify-between text-sm border-b py-2">
              <span>{item.name} x {item.quantity}</span>
              <span>{(item.price * item.quantity).toFixed(2)} ₺</span>
            </div>
          ))}

          <div className="mt-4 font-bold flex justify-between">
            <span>Toplam</span>
            <span>{total.toFixed(2)} ₺</span>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Checkout;
