import React, { useState, useEffect } from 'react';
import api from '../../services/api';
// Edit2 ve Save iconlarını ekledik
import { Plus, Trash2, Camera, Check, X, Package, Edit2, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null); // Düzenlenen ürünün ID'si
  
  const initialFormState = {
    name: '',
    description: 'Taze ve doğal.',
    price: '',
    stock: '100',
    weight: '1.0',
    category: 'Kuruyemiş',
    image_url: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [uploading, setUploading] = useState(false);

  const categories = ['Kuruyemiş', 'Kuru Meyve'];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Düzenleme modunu açan fonksiyon
  const startEdit = (product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      weight: product.weight.toString(),
      category: product.category,
      image_url: product.image_url
    });
    setEditingId(product.id);
    setIsAdding(true); // Modal'ı aç
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const data = new FormData();
    data.append('file', file);

    try {
      const res = await api.post('/admin/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData({ ...formData, image_url: res.data.url });
    } catch (err) {
      alert("Yükleme başarısız!");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.image_url) return alert("Lütfen ürün resmi yükleyin!");

    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      weight: parseFloat(formData.weight)
    };

    try {
      if (editingId) {
        // GÜNCELLEME (PUT)
        await api.put(`/products/${editingId}`, payload);
        alert("Ürün güncellendi.");
      } else {
        // YENİ EKLEME (POST)
        await api.post('/admin/products', payload);
        alert("Ürün eklendi.");
      }
      
      closeModal();
      fetchProducts();
    } catch (err) {
      alert("İşlem başarısız. Lütfen bilgileri kontrol edin.");
    }
  };

  const closeModal = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData(initialFormState);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bu ürünü silmek istediğinizden emin misiniz?")) return;
    try {
      const token = localStorage.getItem('access_token');
      await api.delete(`/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      alert("Yetkiniz olmayabilir veya bir hata oluştu.");
    }
  };

  return (
    <div className="space-y-8 bg-white min-h-full p-4">
      {/* HEADER */}
      <div className="flex justify-between items-center bg-gray-50 p-8 rounded-2xl border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-[#1c1917]">Ürün Yönetimi</h2>
          <p className="text-gray-500 text-sm mt-1">Stok ve fiyatları buradan güncelleyebilirsiniz.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-[#d97706] hover:bg-[#b45309] text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center space-x-3"
        >
          <Plus className="w-5 h-5" />
          <span>Yeni Ürün</span>
        </button>
      </div>

      {/* MODAL (ADD & EDIT) */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
               className="bg-white p-10 rounded-3xl w-full max-w-2xl relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto">
              
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-[#1c1917]">
                  {editingId ? 'Ürünü Düzenle' : 'Yeni Ürün Oluştur'}
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-black"><X className="w-6 h-6" /></button>
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">Ürün Adı</label>
                    <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 px-6 focus:border-[#d97706] outline-none" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">Kategori</label>
                      <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 px-6 outline-none">
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">KG Birim</label>
                      <input type="number" step="0.1" required value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 px-6 outline-none" />
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <div className="flex-1">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">Fiyat (₺)</label>
                      <input type="number" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 px-6 outline-none" />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">Stok</label>
                      <input type="number" required value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 px-6 outline-none" />
                    </div>
                  </div>
                </div>

                {/* IMAGE UPLOAD */}
                <div className="space-y-6">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">Görsel</label>
                  <div className="w-full aspect-[4/3] bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center relative overflow-hidden group">
                    {formData.image_url ? (
                      <>
                        <img src={formData.image_url.startsWith('http') ? formData.image_url : `https://api.sevimlerkuruyemis.com${formData.image_url}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <label className="cursor-pointer bg-white p-4 rounded-full shadow-xl">
                              <Camera className="w-6 h-6" />
                              <input type="file" className="hidden" onChange={handleImageUpload} />
                           </label>
                        </div>
                      </>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center text-gray-400">
                        <Camera className="w-10 h-10 mb-2" />
                        <span className="text-[10px] font-bold">GÖRSEL SEÇ</span>
                        <input type="file" className="hidden" onChange={handleImageUpload} />
                      </label>
                    )}
                    {uploading && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#d97706] border-t-transparent animate-spin rounded-full"></div></div>}
                  </div>
                  
                  <button type="submit" className="w-full bg-[#1c1917] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center space-x-3 shadow-xl hover:bg-black">
                    {editingId ? <><Save className="w-5 h-5" /> <span>Değişiklikleri Kaydet</span></> : <><Check className="w-5 h-5" /> <span>Ürünü Ekle</span></>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
            <tr>
              <th className="px-8 py-6">Ürün Detayı</th>
              <th className="px-8 py-6 text-center">Fiyat</th>
              <th className="px-8 py-6 text-center">Stok</th>
              <th className="px-8 py-6 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center space-x-4">
                    <img src={p.image_url.startsWith('http') ? p.image_url : `https://api.sevimlerkuruyemis.com${p.image_url}`} className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                    <div>
                      <p className="font-bold text-[#1c1917]">{p.name}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest">{p.category} • {p.weight}KG</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 text-center font-bold text-[#d97706]">{p.price} ₺</td>
                <td className="px-8 py-6 text-center text-sm font-bold">{p.stock}</td>
                <td className="px-8 py-6 text-right space-x-2">
                  {/* DÜZENLE BUTONU */}
                  <button onClick={() => startEdit(p)} className="p-3 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all">
                    <Edit2 className="w-5 h-5" />
                  </button>
                  {/* SİL BUTONU */}
                  <button onClick={() => handleDelete(p.id)} className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductManager;
