import React, { useEffect } from 'react';

const MesafeliSatisSozlesmesi = () => {
  // Sayfa açıldığında otomatik olarak en yukarı kaydırır
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-stone-50/50 pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-2xl border border-stone-100 shadow-sm">
        
        {/* BAŞLIK */}
        <div className="border-b border-stone-100 pb-6 mb-8 text-center md:text-left">
          <h1 className="text-3xl font-black text-[#1c1917] tracking-tight">Mesafeli Satış Sözleşmesi</h1>
          <p className="text-stone-400 text-xs uppercase tracking-widest font-bold mt-2">
            Son Güncelleme: {new Date().getFullYear()}
          </p>
        </div>

        {/* SÖZLEŞME METNİ */}
        <div className="space-y-8 text-stone-600 text-sm leading-relaxed font-medium">
          
          <section className="space-y-3">
            <h2 className="text-[#1c1917] font-black uppercase tracking-wider text-sm">1. TARAFLAR</h2>
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 space-y-4">
              <div>
                <p className="text-[#d97706] text-xs font-black uppercase tracking-widest">SATICI BİLGİLERİ:</p>
                <p className="mt-1"><strong>Ünvanı:</strong> Sevimler Kuruyemiş</p>
                <p><strong>Adresi:</strong> Halkapınar mahallesi 1203/1 sokak no:1 Konak/İzmir</p>
                <p><strong>Telefon:</strong> 0 (553) 432 89 47</p>
                <p><strong>E-posta:</strong> destek@sevimlerkuruyemis.com</p>
              </div>
              <div className="border-t border-stone-200/60 pt-3">
                <p className="text-[#d97706] text-xs font-black uppercase tracking-widest">ALICI BİLGİLERİ:</p>
                <p className="mt-1">Siteden alışveriş yapan, sipariş formunda belirtilen adres ve iletişim bilgilerini paylaşan kullanıcıdır.</p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-[#1c1917] font-black uppercase tracking-wider text-sm">2. SÖZLEŞMENİN KONUSU</h2>
            <p>
              İşbu Sözleşme'nin konusu, ALICI'nın, SATICI'ya ait <strong>https://sevimlerkuruyemis.com</strong> internet sitesinden elektronik ortamda siparişini verdiği, nitelikleri ve satış fiyatı sipariş formunda belirtilen ürünün satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun Strain ve Mesafeli Sözleşmeler Yönetmeliği hükümleri uyarınca tarafların hak ve yükümlülüklerinin saptanmasıdır.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[#1c1917] font-black uppercase tracking-wider text-sm">3. SÖZLEŞME KONUSU ÜRÜN VE ÖDEME BİLGİLERİ</h2>
            <p>
              Mal ya da ürünlerin türü, miktarı, satış bedeli, ödeme şekli, siparişin sonlandığı andaki bilgilerden oluşmaktadır. Alışveriş sırasında belirtilen kargo ücreti ALICI tarafından karşılanır ve sipariş toplam tutarına eklenir. Ödemeler <strong>PayTR</strong> güvenli ödeme altyapısı aracılığıyla kredi kartı veya banka kartı ile tahsil edilir.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-[#1c1917] font-black uppercase tracking-wider text-sm">4. GENEL HÜKÜMLER</h2>
            <ul className="list-disc pl-5 space-y-2 text-stone-500">
              <li>ALICI, SATICI'ya ait internet sitesinde sözleşme konusu ürünün temel nitelikleri, satış fiyatı ve ödeme şekli ile teslimata ilişkin ön bilgileri okuyup bilgi sahibi olduğunu ve elektronik ortamda gerekli teyidi verdiğini beyan eder.</li>
              <li>Sözleşme konusu ürün, yasal 30 günlük süreyi aşmamak koşulu ile ALICI'nın yerleşim yerinin uzaklığına bağlı olarak internet sitesindeki ön bilgiler içinde açıklanan süre içinde ALICI veya gösterdiği adresteki kişi/kuruluşa teslim edilir.</li>
              <li>Sözleşme konusu ürün, ALICI'dan başka bir kişi/kuruluşa teslim edilecek ise, teslim edilecek kişi/kuruluşun teslimatı kabul etmemesinden SATICI sorumlu tutulamaz.</li>
              <li>SATICI, sözleşme konusu ürünün sağlam, eksiksiz, siparişte belirtilen niteliklere uygun olarak teslim edilmesinden sorumludur.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-[#1c1917] font-black uppercase tracking-wider text-sm">5. CAYMA HAKKI VE İSTİSNALARI</h2>
            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100/70 text-stone-600 space-y-2">
              <p className="font-bold text-[#1c1917]">⚠️ Kuruyemiş ve Gıda Ürünlerine Özel Önemli Not:</p>
              <p>
                Mesafeli Sözleşmeler Yönetmeliği'nin 15. maddesinin (ç) bendi uyarınca; <strong>"Çabuk bozulabilen veya son kullanma tarihi geçme ihtimali olan malların teslimine ilişkin sözleşmelerde"</strong> ve (b) bendi uyarınca <strong>"Tesliminden sonra ambalaj, bant, mühür, paket gibi koruyucu unsurları açılmış olan mallardan; iadesi sağlık ve hijyen açısından uygun olmayanların teslimine ilişkin sözleşmelerde"</strong> tüketici cayma hakkını kullanamaz.
              </p>
              <p>
                Bu kapsamda, Sevimler Kuruyemiş üzerinden satın alınan gıda maddelerinin (kuruyemiş, kuru meyve vb.) ambalajı açıldığı, mühürleri bozulduğu veya hasar gördüğü takdirde sağlık ve hijyen kuralları gereği iadesi kabul edilmemektedir. Ambalajı tamamen kapalı, bozulmamış ve hasar görmemiş ürünler için cayma hakkı süresi teslim tarihinden itibaren 14 gündür.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-[#1c1917] font-black uppercase tracking-wider text-sm">6. UYUŞMAZLIKLARIN ÇÖZÜMÜ</h2>
            <p>
              İşbu sözleşmenin uygulanmasında, Ticaret Bakanlığınca ilan edilen değere kadar ALICI'nın mal veya hizmeti satın aldığı ve ikametgahının bulunduğu yerdeki Tüketici Hakem Heyetleri ile Tüketici Mahkemeleri yetkilidir. Siparişin onaylanması durumunda ALICI işbu sözleşmenin tüm koşullarını kabul etmiş sayılır.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

export default MesafeliSatisSozlesmesi;
