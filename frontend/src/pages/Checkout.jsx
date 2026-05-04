import React, { useState, useMemo } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, AlertTriangle, Weight, Truck } from 'lucide-react';

const Checkout = () => {
  const { cart, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: '',
    address: '',
    phone: '',
  });

  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

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

      // 1. ORDER OLUŞTUR
      const orderResponse = await api.post('/orders', {
        ...formData,
        items: orderItems
      });

      const orderId = orderResponse.data.id;

      // 2. PAYTR TOKEN AL
      const paymentRes = await api.post('/payment/create', {
        order_id: orderId
      });

      // 3. MOCK MODE
      if (paymentRes.data.mode === 'MOCK') {
        clearCart();
        navigate(`/success?orderId=${orderId}&mode=mock`);
        return;
      }

      // 4. GERÇEK ÖDEME → PAYTR'A GİT
      window.location.href = `https://www.paytr.com/odeme/guvenli/${paymentRes.data.token}`;

    } catch (err) {
      setStatus('error');
      setErrorMessage(
        err.response?.data?.detail ||
        'Sipariş sırasında hata oluştu.'
      );
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 max-w-6xl mx-auto bg-white">

      <div onClick={() => navigate(-1)} className="cursor-pointer mb-6">
        <ArrowLeft /> Geri Dön
      </div>

      <form onSubmit={handleCheckout} className="space-y-6">

        <input
          name="full_name"
          placeholder="Ad Soyad"
          required
          value={formData.full_name}
          onChange={handleInputChange}
        />

        <textarea
          name="address"
          placeholder="Adres"
          required
          value={formData.address}
          onChange={handleInputChange}
        />

        <input
          name="phone"
          placeholder="Telefon"
          required
          value={formData.phone}
          onChange={handleInputChange}
        />

        <div>
          <Weight /> {totalWeight.toFixed(2)} KG
          {!isWeightValid && <p>Ağırlık hatalı (1-100kg)</p>}
        </div>

        {status === 'error' && (
          <div>
            <AlertTriangle /> {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={status === 'loading' || !isWeightValid}
        >
          {status === 'loading' ? 'Yükleniyor...' : 'Ödemeye Git'}
        </button>

      </form>

      <div>
        <h3>Toplam: {total} ₺</h3>
      </div>

    </div>
  );
};

export default Checkout;
