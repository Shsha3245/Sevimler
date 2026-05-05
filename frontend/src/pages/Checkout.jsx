import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import axios from 'axios'; // Eğer api nesnesi login istiyorsa ham axios ile aşacağız

const Checkout = () => {
  const { cart, total, clearCart } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    city: '', 
    district: '', 
    country: 'Türkiye',
    first_name: '',
    last_name: '',
    company: '',
    address: '',
    apartment: '',
    zip_code: '',
    town: '', 
    phone: '',
    save_info: false
  });

  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [iframeToken, setIframeToken] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    // Şehir ve ilçe kontrolü
    if (!formData.city || !formData.district) {
      setStatus('error');
      setErrorMessage("Lütfen İl ve İlçe seçimini yapın.");
      return;
    }

    try {
      const orderPayload = {
        full_name: `${formData.first_name} ${formData.last_name}`,
        email: `${formData.phone}@guest.com`, 
        address: `${formData.address} ${formData.apartment} ${formData.district}/${formData.city}`,
        phone: formData.phone,
        items: cart.map(item => ({ product_id: item.id, quantity: item.quantity }))
      };

      console.log("SENDING PAYLOAD TO ORDERS:", orderPayload);

      // KRİTİK: Eğer api nesneniz (api.post) interceptor yüzünden login sayfasına atıyorsa 
      // burayı geçici olarak ham axios çağrısına (axios.post('URL/orders', ...)) çevirebilirsiniz.
      const orderRes = await api.post('/orders', orderPayload);
      
      console.log("ORDER CREATED SUCCESS:", orderRes.data);

      // 2. PayTR Token al
      const paymentRes = await api.post('/payment/create', { 
        order_id: orderRes.data.id 
      });

      console.log("PAYTR SESSION SUCCESS:", paymentRes.data);

      if (paymentRes.data && paymentRes.data.paytr_token) {
        setIframeToken(paymentRes.data.paytr_token);
        clearCart();
      } else {
        throw new Error("PayTR'den token dönmedi. API yanıtını kontrol edin.");
      }

    } catch (err) {
      console.error("CHECKOUT ERROR DETAILS:", err);
      setStatus('error');
      
      // Backend'den gelen gerçek hatayı ekrana basıyoruz ki kör uçuşu yapmayalım
      const backendError = err.response?.data?.detail || err.message || "Bir hata oluştu.";
      setErrorMessage(`Ödeme Başlatılamadı: ${backendError}`);
    }
  };

  if (iframeToken) {
    return (
      <div className="pt-32 pb-20 px-4 max-w-4xl mx-auto">
        <div className="bg-blue-50 p-4 rounded-md mb-4 text-sm text-blue-700">
          Güvenli ödeme sayfasına yönlendiriliyorsunuz, lütfen bekleyiniz...
        </div>
        {/* PayTR iframe src linkinde 'token' yerine doğrudan iframeToken'ın kendisi basılmalı */}
        <iframe 
          src={`https://www.paytr.com/odeme/guvenli/${iframeToken}`} 
          id="paytriframe" 
          frameBorder="0" 
          scrolling="no" 
          className="w-full min-h-[650px] border-none rounded-lg shadow-md"
        ></iframe>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20 px-4">
      <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-sm">
        <h2 className="text-2xl font-semibold mb-2">Teslimat Bilgileri</h2>
        <p className="text-gray-500 text-sm mb-6">Lütfen fatura ve teslimat adresinizi eksiksiz doldurun.</p>

        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md mb-6 flex items-start gap-3">
            <AlertTriangle size={20} className="shrink-0 mt-0.5" /> 
            <span className="text-sm font-medium whitespace-pre-line">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleCheckout} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <select name="city" required value={formData.city} onChange={handleInputChange} className="border p-3 rounded-md w-full focus:border-red-800 outline-none">
              <option value="">İl Seçiniz</option>
              <option value="İstanbul">İstanbul</option>
              <option value="İzmir">İzmir</option>
              <option value="Ankara">Ankara</option>
            </select>
            <select name="district" required value={formData.district} onChange={handleInputChange} className="border p-3 rounded-md w-full focus:border-red-800 outline-none">
              <option value="">İlçe Seçiniz</option>
              {formData.city === 'İzmir' && <option value="Bornova">Bornova</option>}
              {formData.city === 'İzmir' && <option value="Konak">Konak</option>}
              {formData.city === 'İstanbul' && <option value="Körfez">Kadıköy</option>}
              <option value="Merkez">Merkez/Diğer</option>
            </select>
          </div>

          <div className="relative">
            <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-500">Ülke/Bölge</label>
            <select disabled className="border p-3 rounded-md w-full bg-gray-50 outline-none">
              <option>Türkiye</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input name="first_name" placeholder="Ad" required onChange={handleInputChange} className="border p-3 rounded-md focus:ring-1 focus:ring-gray-300 outline-none" />
            <input name="last_name" placeholder="Soyadı" required onChange={handleInputChange} className="border p-3 rounded-md focus:ring-1 focus:ring-gray-300 outline-none" />
          </div>

          <input name="company" placeholder="Şirket (isteğe bağlı)" onChange={handleInputChange} className="border p-3 rounded-md w-full outline-none" />
          <input name="address" placeholder="Adres (Mahalle, Cadde, Sokak)" required onChange={handleInputChange} className="border p-3 rounded-md w-full outline-none" />
          <input name="apartment" placeholder="Apartman Daire v.b" onChange={handleInputChange} className="border p-3 rounded-md w-full outline-none" />

          <div className="grid grid-cols-2 gap-4">
            <input name="zip_code" placeholder="Posta kodu (isteğe bağlı)" onChange={handleInputChange} className="border p-3 rounded-md outline-none" />
            <input name="town" placeholder="Şehir" required onChange={handleInputChange} className="border p-3 rounded-md outline-none" />
          </div>

          <input name="phone" placeholder="Telefon" required onChange={handleInputChange} className="border p-3 rounded-md w-full outline-none" />

          <button type="submit" disabled={status === 'loading'} className="w-full bg-red-700 hover:bg-red-800 text-white py-4 rounded-md font-bold mt-6 transition-all">
            {status === 'loading' ? 'İşleniyor...' : 'Ödemeye Geç'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
