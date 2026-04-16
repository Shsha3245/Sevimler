import React from 'react';
import { motion } from 'framer-motion';

const RefundPolicy = () => {
  return (
    <div className="pt-32 pb-24 bg-white min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto px-6"
      >
        <h1 className="text-4xl font-serif font-bold text-[#1c1917] mb-12">İptal ve İade Koşulları</h1>
        
        <div className="space-y-8 text-stone-700 leading-relaxed text-lg">
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#1c1917]">1. Cayma Hakkı</h2>
            <p>
              Alıcı; ürünün kendisine veya gösterdiği adresteki kişi/kuruluşa tesliminden itibaren 14 (on dört) gün içinde hiçbir hukuki ve cezai sorumluluk üstlenmeksizin ve hiçbir gerekçe göstermeksizin malı reddederek sözleşmeden cayma hakkına sahiptir. Ancak, ambalajı açılmış, bozulmuş veya tüketilmiş gıda ürünlerinde cayma hakkı kullanılamaz.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#1c1917]">2. Cayma Hakkı Kullanılamayacak Ürünler</h2>
            <p>
              Niteliği itibarıyla geri gönderilmeye elverişli olmayan ürünler, tek kullanımlık ürünler, çabuk bozulma tehlikesi olan veya son kullanma tarihi geçme ihtimali olan mallar için cayma hakkı kullanılamayacak ürünler arasındadır. Kuruyemiş ve kuru meyve ürünleri "gıda maddesi" kapsamında olduğundan, ambalajı açıldığı andan itibaren hijyen ve tazelik standartları gereği iade kapsamından çıkar.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#1c1917]">3. İade Prosedürü</h2>
            <p>
              İade edilecek ürünlerin üzerinde yer alan koruma bandı, mühür veya ambalajın açılmamış olması gerekmektedir. Kusurlu veya hasarlı ürün teslimatı durumunda, teslimat anında tutanak tutulması ve 24 saat içinde müşteri hizmetlerimize bilgi verilmesi şarttır.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#1c1917]">4. İptal Şartları</h2>
            <p>
              Siparişiniz kargoya verilmeden önce müşteri hizmetlerimizi arayarak veya web sitemiz üzerinden "Siparişlerim" bölümünden iptal talebinde bulunabilirsiniz. Kargoya verilen siparişler için iade prosedürü geçerli olur.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#1c1917]">5. Geri Ödeme</h2>
            <p>
              İade edilen ürünlerin şartlara uygunluğu onaylandıktan sonra, ödediğiniz tutar 7-10 iş günü içerisinde ödeme yaptığınız kredi kartına veya banka hesabınıza iade edilir.
            </p>
          </section>

          <p className="text-sm text-stone-400 pt-8 border-t border-gray-100">
            Daha fazla bilgi için destek@sevimlerkuruyemis.com adresinden bizimle iletişime geçebilirsiniz.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RefundPolicy;
