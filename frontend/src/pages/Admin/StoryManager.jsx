import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Trash2, Camera, Check, X, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StoryManager = () => {
  const [stories, setStories] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newStory, setNewStory] = useState({
    title: '',
    image_url: ''
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const res = await api.get('/stories');
      setStories(res.data);
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
      setNewStory({ ...newStory, image_url: res.data.url });
    } catch (err) {
      alert("Yükleme başarısız!");
    } finally {
      setUploading(false);
    }
  };

  const handleAddStory = async (e) => {
    e.preventDefault();
    if (!newStory.image_url) {
      alert("Lütfen bir görsel seçin!");
      return;
    }
    try {
      await api.post('/admin/stories', newStory);
      setIsAdding(false);
      setNewStory({ title: '', image_url: '' });
      fetchStories();
    } catch (err) {
      alert("Hata oluştu.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bu hikayeyi silmek istediğinizden emin misiniz?")) return;
    try {
      await api.delete(`/stories/${id}`);
      fetchStories();
    } catch (err) {
      alert("Hata oluştu.");
    }
  };

  return (
    <div className="space-y-8 bg-white min-h-full">
      <div className="flex justify-between items-center bg-gray-50 p-8 rounded-2xl border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-[#1c1917]">Hikaye Yönetimi</h2>
          <p className="text-gray-500 text-sm mt-1">Ana sayfa hikayelerini buradan düzenleyin.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-[#d97706] hover:bg-[#b45309] text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center space-x-3"
        >
          <Plus className="w-5 h-5" />
          <span>Story Ekle</span>
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
              className="bg-white p-10 rounded-3xl w-full max-w-lg relative z-10 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-[#1c1917]">Yeni Hikaye Paylaş</h3>
                <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-black">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddStory} className="space-y-8">
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">Başlık (Opsiyonel)</label>
                    <input 
                      type="text"
                      value={newStory.title} onChange={e => setNewStory({...newStory, title: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 px-6 text-[#1c1917] focus:outline-none focus:border-[#d97706] font-medium"
                      placeholder="Örn: Haftanın Fırsatı"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">Hikaye Görseli (9:16)</label>
                    <div className="w-full aspect-[9/16] max-w-[200px] mx-auto bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center relative group overflow-hidden">
                      {newStory.image_url ? (
                        <>
                          <img src={`https://api.sevimlerkuruyemis.com${newStory.image_url}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                             <label className="cursor-pointer bg-black/20 p-4 rounded-full hover:bg-black/40 transition-all">
                                <Camera className="w-6 h-6" />
                                <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                             </label>
                          </div>
                        </>
                      ) : (
                        <label className="cursor-pointer flex flex-col items-center space-y-4 text-gray-400 hover:text-[#d97706] transition-colors p-8 text-center">
                          <div className="p-4 bg-white rounded-full shadow-sm ring-1 ring-gray-100"><Camera className="w-8 h-8" /></div>
                          <span className="text-[10px] font-black uppercase tracking-widest leading-relaxed">9:16 Formatında <br/> Görsel Seç</span>
                          <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                        </label>
                      )}
                      {uploading && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#d97706] border-t-transparent animate-spin rounded-full"></div></div>}
                    </div>
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                   <button type="submit" className="w-full bg-[#1c1917] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center space-x-3 shadow-xl hover:bg-black transition-all">
                      <Check className="w-5 h-5" /> <span>Hikayeyi Paylaş</span>
                   </button>
                   <button type="button" onClick={() => setIsAdding(false)} className="w-full bg-gray-50 text-gray-400 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all">
                      Vazgeç
                   </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {stories.map(s => (
          <div key={s.id} className="group relative bg-white rounded-2xl aspect-[9/16] overflow-hidden border border-gray-100 hover:border-[#d97706]/30 transition-all shadow-sm hover:shadow-lg">
            <img src={s.image_url.startsWith('http') ? s.image_url : `https://api.sevimlerkuruyemis.com${s.image_url}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1c1917]/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
            <div className="absolute bottom-4 left-4 right-4">
              <div className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{s.title || "Hikaye"}</div>
            </div>
            <button 
              onClick={() => handleDelete(s.id)}
              className="absolute top-2 right-2 p-3 bg-red-500 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 shadow-lg"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {stories.length === 0 && (
          <div className="col-span-full py-32 text-center space-y-6">
             <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-200"><Play className="w-10 h-10" /></div>
             <p className="text-gray-400 font-medium italic">Henüz aktif bir hikaye bulunmuyor.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryManager;
