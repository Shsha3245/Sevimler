import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Trash2, Camera, Check, X, Package, AlertCircle, Weight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    stock: '100',
    weight: '1.0',
    category: 'Kuruyemiş',
    image_url: ''
  });
  const [uploading, setUploading] = useState(false);

  // Production Restricted Categories
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setNewProduct({ ...newProduct, image_url: res.data.url });
    } catch (err) {
      alert("Yükleme başarısız!");
    } finally {
      setUploading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.image_url) {
      alert("Lütfen ürün resmi yükleyin!");
      return;
    }
    try {
      await api.post('/admin/products', {
        ...newProduct,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock),
        weight: parseFloat(newProduct.weight)
      });
      setIsAdding(false);
      setNewProduct({ name: '', description: 'Taze ve doğal.', price: '', stock: '100', weight: '1.0', category: 'Kuruyemiş', image_url: '' });
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("Hata oluştu. Lütfen bilgileri kontrol edin.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bu ürünü silmek istediğinizden emin misiniz?")) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert("Hata oluştu.");
    }
  };

  return (
    <div className="space-y-8 bg-white min-h-full">
      <div className="flex justify-between items-center bg-gray-50 p-8 rounded-2xl border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-[#1c1917]">Ürün Yönetimi</h2>
          <p className="text-gray-500 text-sm mt-1">Envanterinizdeki ürünleri buradan düzenleyin.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-[#d97706] hover:bg-[#b45309] text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center space-x-3"
        >
          <Plus className="w-5 h-5" />
          <span>Ürün Ekle</span>
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/50 backdrop-blur-sm"
               onClick={() => setIsAdding(false)}
            />
            <motion.div 
               initial={{ scale: 0.95, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.95, opacity: 0 }}
               className="bg-white p-10 rounded-3xl w-full max-w-2xl relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-[#1c1917]">Yeni Ürün Oluştur</h3>
                <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-black">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">Ürün Adı</label>
                    <input 
                      type="text" placeholder="Örn: Antep Fıstığı" required
                      value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 px-6 text-[#1c1917] focus:outline-none focus:border-[#d97706] font-medium"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">Kategori</label>
                      <select 
                        value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 px-6 text-[#1c1917] focus:outline-none focus:border-[#d97706] font-medium appearance-none"
                      >
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">Birim Ağırlık (KG)</label>
                      <input 
                        type="number" step="0.1" placeholder="1.0" required
                        value={newProduct.weight} onChange={e => setNewProduct({...newProduct, weight: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 px-6 text-[#1c1917] focus:outline-none focus:border-[#d97706] font-medium"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    <div className="flex-1">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">Fiyat (TL)</label>
                      <input 
                        type="number" placeholder="500" required
                        value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 px-6 text-[#1c1917] focus:outline-none focus:border-[#d97706] font-medium"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">Stok</label>
                      <input 
                        type="number" placeholder="100" required
                        value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 px-6 text-[#1c1917] focus:outline-none focus:border-[#d97706] font-medium"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">Açıklama</label>
                    <textarea 
                      placeholder="Ürün özellikleri..." required
                      value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 px-6 text-[#1c1917] focus:outline-none focus:border-[#d97706] font-medium h-24 italic"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">Ürün Görseli</label>
                  <div className="w-full aspect-[4/3] bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center relative group overflow-hidden">
                    {newProduct.image_url ? (
                      <>
                        <img src={`http://localhost:8000${newProduct.image_url}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <label className="cursor-pointer bg-white text-black p-4 rounded-full shadow-lg hover:bg-[#d97706] hover:text-white transition-all">
                              <Camera className="w-6 h-6" />
                              <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                           </label>
                        </div>
                      </>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center space-y-4 p-8 text-center text-gray-400 hover:text-[#d97706] transition-colors">
                        <div className="p-5 bg-white rounded-full shadow-sm ring-1 ring-gray-100"><Camera className="w-10 h-10" /></div>
                        <span className="text-[10px] font-black uppercase tracking-widest">Görsel Seç</span>
                        <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                      </label>
                    )}
                    {uploading && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><div className="w-10 h-10 border-4 border-[#d97706] border-t-transparent animate-spin rounded-full"></div></div>}
                  </div>
                  
                  <div className="pt-4 space-y-3">
                     <button type="submit" className="w-full bg-[#1c1917] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center space-x-3 shadow-xl hover:bg-black transition-all">
                        <Check className="w-5 h-5" /> <span>Ürünü Kaydet</span>
                     </button>
                     <button type="button" onClick={() => setIsAdding(false)} className="w-full bg-gray-50 text-gray-400 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all">
                        Vazgeç
                     </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
            <tr>
              <th className="px-8 py-6">Ürün Detayı</th>
              <th className="px-8 py-6 text-center">Kategori / Ağırlık</th>
              <th className="px-8 py-6 text-center">Fiyat</th>
              <th className="px-8 py-6 text-center">Stok</th>
              <th className="px-8 py-6 text-right">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-gray-50 group transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center space-x-6">
                    <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden ring-1 ring-gray-100">
                      <img src={p.image_url.startsWith('http') ? p.image_url : `http://localhost:8000${p.image_url}`} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="font-bold text-[#1c1917] uppercase tracking-tight">{p.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5 line-clamp-1 italic">{p.description}</div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 text-center">
                    <div className="flex flex-col items-center space-y-1">
                        <span className="px-3 py-1 bg-gray-100 text-[10px] font-black text-gray-500 rounded-full uppercase tracking-widest">{p.category}</span>
                        <span className="text-[10px] font-bold text-gray-400 italic">{p.weight} KG / Birim</span>
                    </div>
                </td>
                <td className="px-8 py-6 text-center font-bold text-[#d97706]">{p.price.toLocaleString()} ₺</td>
                <td className="px-8 py-6 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${p.stock > 10 ? 'bg-green-500' : p.stock > 0 ? 'bg-amber-500' : 'bg-red-500'} shadow-sm`}></span>
                    <span className="text-sm font-bold text-gray-600">{p.stock}</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <button onClick={() => handleDelete(p.id)} className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className="p-32 text-center space-y-6">
             <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-200"><Package className="w-12 h-12" /></div>
             <p className="text-gray-400 font-medium italic">Henüz koleksiyonunuzda ürün bulunmuyor.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductManager;
