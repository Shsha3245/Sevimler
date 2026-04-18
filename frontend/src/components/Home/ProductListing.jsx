import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import { ShoppingCart, Plus, Minus, Info, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProductListing = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [activeProduct, setActiveProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showAlert, setShowAlert] = useState(false);
  
  const { addToCart } = useCart();

  const categories = ['Tümü', 'Kuruyemiş', 'Kuru Meyve'];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products');
        const data = Array.isArray(res.data)
          ? res.data
          : res.data?.products;
          console.log("PRODUCT API RESPONSE:", res.data);
          console.log("NORMALIZED DATA:", data);
          setProducts(data || []);
          setFilteredProducts(data || []);
          setProducts(data);
          setFilteredProducts(data);
      } catch (err) {
        console.error("Failed to fetch products", err);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'Tümü') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => p.category === selectedCategory));
    }
  }, [selectedCategory, products]);

  const handleAddToCartClick = (product) => {
    setActiveProduct(product);
    setQuantity(1);
  };

  const handleConfirmAddToCart = () => {
    if (quantity < 1) {
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }
    addToCart({ ...activeProduct, quantity });
    setActiveProduct(null);
  };

  return (
    <div className="px-6 py-20 max-w-7xl mx-auto bg-white" id="products">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-8">
        <div>
          <h2 className="text-4xl font-playfair text-[#1c1917] font-bold mb-4 italic">Seçkin Lezzetler</h2>
          <p className="text-[#1c1917]/60 text-lg">Özenle seçilmiş, taze ve doğal ürün koleksiyonumuz.</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                selectedCategory === cat 
                ? 'bg-[#1c1917] text-white border-[#1c1917]' 
                : 'bg-white text-[#1c1917]/40 border-gray-200 hover:text-[#d97706] hover:border-[#d97706]'
              } border`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <motion.div 
            key={product.id}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 p-4"
          >
            <div className="relative h-64 overflow-hidden rounded-xl bg-gray-50 mb-6">
              <img 
                src={product.image_url.startsWith('https') ? product.image_url : `https://api.sevimlerkuruyemis.com${product.image_url}`} 
                alt={product.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-[#1c1917] uppercase tracking-tight">{product.name}</h3>
                <span className="text-lg font-bold text-[#d97706]">{product.price} ₺ <span className="text-[10px] text-gray-400">/ KG</span></span>
              </div>
              
              <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed italic">
                {product.description}
              </p>
              
              <button 
                onClick={() => handleAddToCartClick(product)}
                className="w-full py-4 bg-[#d97706] text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#b45309] transition-all transform active:scale-95 flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Sepete Ekle</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quantity Modal */}
      <AnimatePresence>
        {activeProduct && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/40 backdrop-blur-sm"
               onClick={() => setActiveProduct(null)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white p-8 rounded-3xl w-full max-w-md relative z-10 shadow-2xl space-y-8"
            >
              <button onClick={() => setActiveProduct(null)} className="absolute top-6 right-6 text-gray-400 hover:text-[#1c1917]">
                <X className="w-6 h-6" />
              </button>
              
              <div className="text-center space-y-2">
                <h3 className="text-3xl font-playfair text-[#1c1917] font-bold italic">{activeProduct.name}</h3>
                <p className="text-gray-500 text-sm font-medium">Lütfen sipariş miktarını belirleyin (Min 1 KG)</p>
              </div>

              <div className="flex items-center justify-center space-x-8">
                 <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-14 h-14 rounded-full border border-gray-100 flex items-center justify-center text-[#1c1917] hover:bg-[#1c1917] hover:text-white transition-all shadow-sm"
                 >
                    <Minus className="w-6 h-6" />
                 </button>
                 <span className="text-5xl font-playfair text-[#1c1917] font-bold">{quantity} <span className="text-xl opacity-40 italic font-medium">KG</span></span>
                 <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-14 h-14 rounded-full border border-gray-100 flex items-center justify-center text-[#1c1917] hover:bg-[#1c1917] hover:text-white transition-all shadow-sm"
                 >
                    <Plus className="w-6 h-6" />
                 </button>
              </div>

              {showAlert && (
                 <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center space-x-2 text-red-600 bg-red-50 p-4 rounded-xl border border-red-100 text-xs font-bold"
                 >
                    <AlertCircle className="w-4 h-4" />
                    <span>Minimum 1kg sipariş verilmelidir.</span>
                 </motion.div>
              )}

              <button 
                onClick={handleConfirmAddToCart}
                className="w-full py-5 bg-[#d97706] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-[#b45309] transition-all shadow-lg"
              >
                Siparişe Ekle • {(activeProduct.price * quantity).toLocaleString('tr-TR')} ₺
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductListing;
