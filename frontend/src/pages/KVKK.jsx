import React from 'react';
import { motion } from 'framer-motion';

const KVKK = () => {
  return (
    <div className="pt-32 pb-24 bg-white min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto px-6"
      >
        <h1 className="text-4xl font-serif font-bold text-[#1c1917] mb-12">KVKK Aydınlatma Metni</h1>
        
        <div className="space-y-8 text-stone-700 leading-relaxed text-lg">
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#1c1917]">1. Veri Sorumlusu</h2>
            <p>
              6698 sayılı Kişisel Verilerin Korunması Kanunu ("Kanun") uyarınca, Sevimler Kuruyemiş ("Şirket") olarak, veri sorumlusu sıfatıyla, kişisel verilerinizi aşağıda açıklanan kapsamda ve mevzuat tarafından emredilen sınırlar çerçevesinde işlemekteyiz.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#1c1917]">2. Kişisel Verilerin İşlenme Amacı</h2>
            <p>
              Toplanan kişisel verileriniz, Şirketimiz tarafından sunulan ürün ve hizmetlerden sizleri faydalandırmak için gerekli çalışmaların iş birimlerimiz tarafından yapılması; ürün ve hizmetlerimizin beğeni, kullanım alışkanlıkları ve ihtiyaçlarınıza göre özelleştirilerek sizlere önerilmesi; Şirketimizin ve Şirketimizle iş ilişkisi içerisinde olan kişilerin hukuki ve ticari güvenliğinin temini; Şirketimizin ticari ve iş stratejilerinin belirlenmesi ve uygulanması amaçlarıyla Kanun’un 5. ve 6. maddelerinde belirtilen kişisel veri işleme şartları ve amaçları dahilinde işlenecektir.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#1c1917]">3. İşlenen Kişisel Verilerin Kimlere ve Hangi Amaçla Aktarılabileceği</h2>
            <p>
              Kişisel verileriniz; Şirketimiz tarafından sunulan ürün ve hizmetlerden sizleri faydalandırmak için gerekli çalışmaların iş birimlerimiz tarafından yapılması; Şirketimizin ve Şirketimizle iş ilişkisi içerisinde olan kişilerin hukuki ve ticari güvenliğinin temini amaçlarıyla; iş ortaklarımıza, tedarikçilerimize, kanunen yetkili kamu kurumlarına ve özel kişilere, Kanun’un 8. ve 9. maddelerinde belirtilen kişisel veri aktarım şartları ve amaçları çerçevesinde aktarılabilecektir.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#1c1917]">4. Kişisel Veri Toplamanın Yöntemi ve Hukuki Sebebi</h2>
            <p>
              Kişisel verileriniz, Şirketimiz tarafından farklı kanallar ve farklı hukuki sebeplere dayanarak; sunduğumuz ürün ve hizmetleri geliştirmek ve ticari faaliyetlerimizi yürütmek amacıyla toplanmaktadır. Bu hukuki sebeple toplanan kişisel verileriniz Kanun’un 5. ve 6. maddelerinde belirtilen kişisel veri işleme şartları ve amaçları kapsamında bu Aydınlatma Metni’nin 2. ve 3. maddelerinde belirtilen amaçlarla da işlenebilmekte ve aktarılabilmektedir.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#1c1917]">5. Kişisel Veri Sahibinin Kanun’un 11. Maddesinde Sayılan Hakları</h2>
            <p>
              Kişisel veri sahibi olarak Kanun’un 11. maddesi uyarınca aşağıdaki haklara sahip olduğunuzu bildiririz:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-base italic">
              <li>Kişisel veri işlenip işlenmediğini öğrenme,</li>
              <li>Kişisel verileri işlenmişse buna ilişkin bilgi talep etme,</li>
              <li>Kişisel verilerin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
              <li>Yurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü kişileri bilme,</li>
              <li>Kişisel verilerin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme,</li>
              <li>Kanun ve ilgili diğer kanun hükümlerine uygun olarak işlenmiş olmasına rağmen, işlenmesini gerektiren sebeplerin ortadan kalkması hâlinde kişisel verilerin silinmesini veya yok edilmesini isteme.</li>
            </ul>
          </section>

          <p className="text-sm text-stone-400 pt-8 border-t border-gray-100">
            Son Güncelleme: 09.04.2026
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default KVKK;
