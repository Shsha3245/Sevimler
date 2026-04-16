import { Send, Mail, Phone, MapPin, CreditCard, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FaInstagram } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-white pt-24 pb-12 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        <div className="space-y-8">
          <div className="flex items-center space-x-3">
             <div className="relative group">
               <img src="http://localhost:8000/assets/logo.jpeg" alt="Sevimler Logo" className="w-12 h-12 object-contain" />
               <div className="absolute inset-0 border border-gray-100 rounded-full" />
             </div>
             <div className="flex flex-col">
               <span className="text-xl font-bold text-[#1c1917] tracking-tight">Sevimler</span>
               <span className="text-[10px] font-bold text-[#d97706] uppercase tracking-[0.2em] -mt-1">Kuruyemiş</span>
             </div>
          </div>
          <p className="text-stone-500 text-sm leading-relaxed max-w-xs italic">
            1985'ten beri doğanın en taze mahsullerini Sevimler kalitesi ve güvencesiyle sofralarınıza taşıyoruz.
          </p>
          <div className="flex space-x-3">
             <a 
               href="https://instagram.com/sevimlerkuruyemis" 
               target="_blank" 
               rel="noopener noreferrer"
               className="text-stone-600 hover:text-[#d97706] transition text-xl"
             >
               <FaInstagram />
             </a>
             <a href="mailto:destek@sevimlerkuruyemis.com" className="text-stone-600 hover:text-[#d97706] transition text-xl">
                <Mail className="w-5 h-5" />
             </a>
          </div>
        </div>

        <div className="space-y-8">
          <h3 className="text-[#1c1917] font-black uppercase tracking-widest text-xs">Hızlı Erişim</h3>
          <ul className="space-y-4 text-stone-600 text-sm font-medium">
            <li><Link to="/" className="hover:text-[#d97706] transition-colors">Ana Sayfa</Link></li>
            <li><a href="/#products" className="hover:text-[#d97706] transition-colors">Tüm Ürünler</a></li>
            <li><Link to="/sss" className="hover:text-[#d97706] transition-colors">Sıkça Sorulan Sorular</Link></li>
          </ul>
        </div>

        <div className="space-y-8">
          <h3 className="text-[#1c1917] font-black uppercase tracking-widest text-xs">Destek & Yasal</h3>
          <ul className="space-y-4 text-stone-600 text-sm font-medium">
            <li><Link to="/kvkk" className="hover:text-[#d97706] transition-colors">KVKK Aydınlatma Metni</Link></li>
            <li><Link to="/iade-kosullari" className="hover:text-[#d97706] transition-colors">İptal ve İade Koşulları</Link></li>
            <li><Link to="/sss" className="hover:text-[#d97706] transition-colors">Destek Merkezi</Link></li>
          </ul>
        </div>

        <div className="space-y-8">
          <h3 className="text-[#1c1917] font-black uppercase tracking-widest text-xs">İş Ortaklarımız</h3>
          <div className="space-y-4">
             <div className="flex items-center space-x-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <CreditCard className="w-6 h-6 text-[#d97706]" />
                <div>
                   <p className="text-[#1c1917] text-[10px] font-black uppercase tracking-widest">PayTR</p>
                   <p className="text-stone-400 text-[10px]">Güvenli Ödeme</p>
                </div>
             </div>
             <div className="flex items-center space-x-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <Truck className="w-6 h-6 text-[#d97706]" />
                <div>
                   <p className="text-[#1c1917] text-[10px] font-black uppercase tracking-widest">Yurtiçi Kargo</p>
                   <p className="text-stone-400 text-[10px]">Hızlı Teslimat</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
         <p className="text-stone-400 text-[10px] uppercase tracking-widest font-bold">
           © 2026 Sevimler Kuruyemiş. Tüm Hakları Saklıdır.
         </p>
         <div className="flex space-x-8 text-[10px] text-stone-400 uppercase tracking-widest font-bold">
            <Link to="/kvkk" className="hover:text-[#d97706] transition-colors">KVKK</Link>
            <Link to="/iade-kosullari" className="hover:text-[#d97706] transition-colors">İade</Link>
            <Link to="/sss" className="hover:text-[#d97706] transition-colors">SSS</Link>
         </div>
      </div>
    </footer>
  );
};

export default Footer;
