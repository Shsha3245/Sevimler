import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const FaqItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-100 last:border-0 overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-6 text-left group transition-all"
      >
        <span className="text-lg font-bold text-[#1c1917] hover:text-[#d97706] transition-colors">{question}</span>
        <motion.div
           animate={{ rotate: isOpen ? 180 : 0 }}
           className="text-stone-300 group-hover:text-[#d97706]"
        >
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pb-8 text-stone-600 leading-relaxed italic pr-12">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQ = () => {
  const faqs = [
    {
      question: "Ürünleriniz taze mi?",
      answer: "Kesinlikle! Sevimler Kuruyemiş olarak ürünlerimizi her gün taze olarak kavuruyor ve vakumlu ambalajlarımızla tazeliğini koruyarak sizlere ulaştırıyoruz."
    },
    {
      question: "Kargo kaç günde ulaşır?",
      answer: "Hafta içi saat 16:00'ya kadar verilen siparişler aynı gün kargoya teslim edilir. Bölgenize bağlı olarak genellikle 1-3 iş günü içerisinde ulaştırılmaktadır."
    },
    {
      question: "Kapıda ödeme seçeneği var mı?",
      answer: "Şu an için sadece web sitemiz üzerinden kredi kartı, banka kartı ve havale/EFT yöntemleri ile güvenli ödeme kabul etmekteyiz."
    },
    {
      question: "Ürünler nerede üretiliyor?",
      answer: "Ürünlerimizin büyük bir kısmı kendi mahsulümüz olup, bir kısmı ise Türkiye'nin en verimli bölgelerinden doğrudan üreticisinden temin edilmektedir."
    },
    {
      question: "Şubeleriniz var mı?",
      answer: "Evet, merkez şubemiz ve üretim tesisimiz dışında yerel noktalarımız da bulunmaktadır. Ancak tüm Türkiye'ye en hızlı hizmeti online mağazamız üzerinden veriyoruz."
    }
  ];

  return (
    <div className="pt-32 pb-24 bg-white min-h-screen">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <div className="text-center space-y-4">
             <h1 className="text-4xl font-serif font-bold text-[#1c1917]">Sıkça Sorulan Sorular</h1>
             <p className="text-stone-400">Merak ettiğiniz soruların cevaplarını burada bulabilirsiniz.</p>
          </div>
          
          <div className="bg-gray-50/50 rounded-3xl p-8 border border-gray-100">
            {faqs.map((faq, index) => (
              <FaqItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>

          <div className="text-center pt-8 border-t border-gray-100">
            <p className="text-stone-500 mb-4 font-medium">Başka bir sorunuz mu var?</p>
            <a 
              href="mailto:destek@sevimlerkuruyemis.com" 
              className="inline-block bg-[#d97706] text-white px-10 py-4 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              Bize Ulaşın
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FAQ;
