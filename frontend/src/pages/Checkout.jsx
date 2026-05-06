import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import { AlertTriangle } from 'lucide-react';

const Checkout = () => {
  const { cart, clearCart } = useCart();

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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("BUTONA BASILDI - handleCheckout TETİKLENDİ!");
    setStatus('loading');
    setErrorMessage('');

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

      console.log("1. BACKEND'E GİDEN SİPARİŞ PAKETİ:", orderPayload);

      // 1. Backend siparişi oluşturur
      const orderRes = await api.post('/orders/', orderPayload);
      console.log("2. SİPARİŞ BAŞARIYLA OLUŞTU:", orderRes.data);

      console.log("3. PAYTR TOKEN İSTEĞİ GÖNDERİLİYOR, ORDER_ID:", orderRes.data.id);
      
      // 2. Backend PayTR'den tokenı alır
      const paymentRes = await api.post('/payment/create', { 
        order_id: orderRes.data.id 
      });

      console.log("4. PAYTR'DEN DÖNEN YANIT:", paymentRes.data);

      if (paymentRes.data && paymentRes.data.status === "success" && paymentRes.data.paytr_token) {
        console.log("5. TOKEN ALINDI. TARAYICI GÜVENLİK DUVARLARINI AŞAN OTO-POST BAŞLATILIYOR...");
        
        // Sepeti sıfırla
        clearCart();

        // 🚀 TARAYICI ENGELİNİ YIKAN KESİN FORM SİMÜLASYONU:
        // Sayfa üzerinde sanal bir form oluşturup doğrudan ana pencereden PayTR'ye POST fırlatıyoruz.
        const mapForm = document.createElement('form');
        mapForm.target = '_top'; // İframe hatasını çözen sihirli satır
        mapForm.method = 'POST';
        mapForm.action = 'https://www.paytr.com/odeme';

        const tokenInput = document.createElement('input');
        tokenInput.type = 'hidden';
        tokenInput.name = 'token';
        tokenInput.value = paymentRes.data.paytr_token;

        mapForm.appendChild(tokenInput);
        document.body.appendChild(mapForm);
        
        // Formu gönder
        mapForm.submit();
        
      } else {
        const errorDetail = paymentRes.data?.detail || "PayTR entegrasyonu doğrulanamadı.";
        throw new Error(errorDetail);
      }

    } catch (err) {
      console.error("YAZILIMSAL HATA DETAYI:", err);
      setStatus('error');
      const backendError = err.response?.data?.detail || err.message || "Bir hata oluştu.";
      setErrorMessage(`Ödeme Başlatılamadı: ${backendError}`);
    }
  };

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

        <form onSubmit={handleCheckout} autoComplete="off" className="space-y-4">
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
              {formData.city === 'İstanbul' && <option value="Kadıköy">Kadıköy</option>}
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
            <input name="first_name" placeholder="Ad" required value={formData.first_name} onChange={handleInputChange} className="border p-3 rounded-md focus:ring-1 focus:ring-gray-300 outline-none" />
            <input name="last_name" placeholder="Soyadı" required value={formData.last_name} onChange={handleInputChange} className="border p-3 rounded-md focus:ring-1 focus:ring-gray-300 outline-none" />
          </div>

          <input name="company" placeholder="Şirket (isteğe bağlı)" value={formData.company} onChange={handleInputChange} className="border p-3 rounded-md w-full outline-none" />
          <input name="address" placeholder="Adres (Mahalle, Cadde, Sokak)" required value={formData.address} onChange={handleInputChange} className="border p-3 rounded-md w-full outline-none" />
          <input name="apartment" placeholder="Apartman Daire v.b" value={formData.apartment} onChange={handleInputChange} className="border p-3 rounded-md w-full outline-none" />

          <div className="grid grid-cols-2 gap-4">
            <input name="zip_code" placeholder="Posta kodu (isteğe bağlı)" value={formData.zip_code} onChange={handleInputChange} className="border p-3 rounded-md outline-none" />
            <input name="town" placeholder="Şehir" required value={formData.town} onChange={handleInputChange} className="border p-3 rounded-md outline-none" />
          </div>

          <input name="phone" placeholder="Telefon" required value={formData.phone} onChange={handleInputChange} className="border p-3 rounded-md w-full outline-none" />

          <button type="submit" disabled={status === 'loading'} className="w-full bg-red-700 hover:bg-red-800 text-white py-4 rounded-md font-bold mt-6 transition-all">
            {status === 'loading' ? 'İşleniyor...' : 'Ödemeye Geç'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
