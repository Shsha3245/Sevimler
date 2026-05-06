import { Send, Mail, Phone, MapPin, CreditCard, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FaInstagram } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-white pt-24 pb-12 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        
        {/* 1. KOLON: LOGO VE MİSYON */}
        <div className="space-y-8">
          <div className="flex items-center space-x-3">
             <div className="relative group">
               <img src="https://api.sevimlerkuruyemis.com/assets/logo.jpeg" alt="Sevimler Logo" className="w-12 h-12 object-contain" />
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

        {/* 2. KOLON: HIZLI ERİŞİM */}
        <div className="space-y-8">
          <h3 className="text-[#1c1917] font-black uppercase tracking-widest text-xs">Hızlı Erişim</h3>
          <ul className="space-y-4 text-stone-600 text-sm font-medium">
            <li><Link to="/" className="hover:text-[#d97706] transition-colors">Ana Sayfa</Link></li>
            <li><a href="/#products" className="hover:text-[#d97706] transition-colors">Tüm Ürünler</a></li>
            <li><Link to="/sss" className="hover:text-[#d97706] transition-colors">Sıkça Sorulan Sorular</Link></li>
          </ul>
        </div>

        {/* 3. KOLON: DESTEK & YASAL SÖZLEŞMELER */}
        <div className="space-y-8">
          <h3 className="text-[#1c1917] font-black uppercase tracking-widest text-xs">Destek & Yasal</h3>
          <ul className="space-y-4 text-stone-600 text-sm font-medium">
            <li><Link to="/kvkk" className="hover:text-[#d97706] transition-colors">KVKK Aydınlatma Metni</Link></li>
            <li><Link to="/iade-kosullari" className="hover:text-[#d97706] transition-colors">İptal ve İade Koşulları</Link></li>
            {/* 🚀 PayTR Onayı İçin Zorunlu Link */}
            <li><Link to="/mesafeli-satis-sozlesmesi" className="hover:text-[#d97706] transition-colors">Mesafeli Satış Sözleşmesi</Link></li>
            <li><Link to="/sss" className="hover:text-[#d97706] transition-colors">Destek Merkez</Link></li>
          </ul>
        </div>

        {/* 4. KOLON: İLETİŞİM, ADRES VE İŞ ORTAKLARI */}
        <div className="space-y-8">
          <h3 className="text-[#1c1917] font-black uppercase tracking-widest text-xs">İletişim & Kurumsal</h3>
          <div className="space-y-4">
             
             {/* 🚀 PayTR Onayı İçin Zorunlu Telefon Alanı */}
             <div className="flex items-center space-x-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <Phone className="w-6 h-6 text-[#d97706]" />
                <div>
                   <p className="text-[#1c1917] text-[10px] font-black uppercase tracking-widest">Müşteri Hattı</p>
                   <a href="tel:+905534328947" className="text-stone-600 text-[11px] font-bold hover:text-[#d97706] transition-colors">
                     0 (553) 432 89 47
                   </a>
                </div>
             </div>

             {/* 🚀 PayTR Onayı İçin Zorunlu Açık Adres Alanı */}
             <div className="flex items-start space-x-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <MapPin className="w-6 h-6 text-[#d97706] shrink-0 mt-0.5" />
                <div>
                   <p className="text-[#1c1917] text-[10px] font-black uppercase tracking-widest">Merkez Merkez/Diğer</p>
                   <p className="text-stone-500 text-[10px] leading-relaxed mt-0.5">
                     Halkapınar mahallesi 1203/1 sokak no:1 Konak/İzmir
                   </p>
                </div>
             </div>

             {/* PayTR Bilgi Kutusu */}
             <div className="flex items-center space-x-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <CreditCard className="w-6 h-6 text-[#d97706]" />
                <div>
                   <p className="text-[#1c1917] text-[10px] font-black uppercase tracking-widest">PayTR</p>
                   <p className="text-stone-400 text-[10px]">Güvenli Ödeme Alt Yapısı</p>
                </div>
             </div>

             {/* Kargo Bilgi Kutusu */}
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

      {/* ALT BAR ALANI */}
      <div className="max-w-7xl mx-auto px-6 pt-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
         <p className="text-stone-400 text-[10px] uppercase tracking-widest font-bold">
            © 2026 Sevimler Kuruyemiş. Tüm Hakları Saklıdır.
         </p>
         <div className="flex space-x-8 text-[10px] text-stone-400 uppercase tracking-widest font-bold">
            <Link to="/kvkk" className="hover:text-[#d97706] transition-colors">KVKK</Link>
            <Link to="/iade-kosullari" className="hover:text-[#d97706] transition-colors">İade</Link>
            {/* 🚀 Alt link alanına da Mesafeli Satış Sözleşmesi eklendi */}
            <Link to="/mesafeli-satis-sozlesmesi" className="hover:text-[#d97706] transition-colors">Sözleşme</Link>
            <Link to="/sss" className="hover:text-[#d97706] transition-colors">SSS</Link>
         </div>
      </div>
    </footer>
  );
};

export default Footer;
