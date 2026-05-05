import React, { useState, useMemo } from 'react';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Weight } from 'lucide-react';

const Checkout = () => {
  const { cart, total, clearCart } = useCart();
  const navigate = useNavigate();

  // Görseldeki form alanlarına göre state
  const [formData, setFormData] = useState({
    city: '', // İl
    district: '', // İlçe
    country: 'Türkiye',
    first_name: '',
    last_name: '',
    company: '',
    address: '',
    apartment: '',
    zip_code: '',
    town: '', // Şehir/Semt
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

    try {
      // Backend'e gidecek birleştirilmiş veriler
      const orderPayload = {
        full_name: `${formData.first_name} ${formData.last_name}`,
        email: `${formData.phone}@guest.com`, // Üyelik yoksa telefon üzerinden sanal email
        address: `${formData.address} ${formData.apartment} ${formData.district}/${formData.city}`,
        phone: formData.phone,
        items: cart.map(item => ({ product_id: item.id, quantity: item.quantity }))
      };

      // 1. Sipariş oluştur
      const orderRes = await api.post('/orders', orderPayload);
      
      // 2. PayTR Token al
      const paymentRes = await api.post('/payment/create', { 
        order_id: orderRes.data.id 
      });

      setIframeToken(paymentRes.data.paytr_token);
      clearCart();
    } catch (err) {
      setStatus('error');
      setErrorMessage("Lütfen tüm alanları doldurun ve tekrar deneyin.");
    }
  };

  if (iframeToken) {
    return (
      <div className="pt-32 pb-20 px-4 max-w-4xl mx-auto">
        <iframe src={`https://www.paytr.com/odeme/guvenli/${iframeToken}`} 
                id="paytriframe" frameBorder="0" scrolling="no" className="w-full min-h-[700px]"></iframe>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20 px-4">
      <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-sm">
        <h2 className="text-2xl font-semibold mb-2">Teslimat</h2>
        <p className="text-gray-500 text-sm mb-6">Aşağıdaki İl ve İlçe Seçimi Kargonuzun Size Daha Hızlı Ulaşması İçindir.</p>

        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md mb-6 flex items-center gap-3">
            <AlertTriangle size={20} /> {errorMessage}
          </div>
        )}

        <form onSubmit={handleCheckout} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <select name="city" onChange={handleInputChange} className="border p-3 rounded-md w-full focus:border-red-800 outline-none">
              <option value="">İl Seçiniz</option>
              <option value="İstanbul">İstanbul</option>
              {/* Buraya İl listesi gelecek */}
            </select>
            <select name="district" onChange={handleInputChange} className="border p-3 rounded-md w-full focus:border-red-800 outline-none">
              <option value="">İlçe Seçiniz</option>
              {/* Seçilen ile göre ilçeler gelecek */}
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

          <div className="space-y-2 pt-4">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" name="save_info" onChange={handleInputChange} className="w-4 h-4" />
              Bir sonraki işlem için bu bilgileri kaydet
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" name="marketing" className="w-4 h-4" />
              Haberler ve teklifler hakkında bana kısa mesaj gönder
            </label>
          </div>

          <button type="submit" disabled={status === 'loading'} className="w-full bg-red-700 hover:bg-red-800 text-white py-4 rounded-md font-bold mt-6 transition-all">
            {status === 'loading' ? 'İşleniyor...' : 'Ödemeye Geç'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
