import React from 'react';
import Hero from '../components/Home/Hero';
import StorySection from '../components/Home/StorySection';
import ProductListing from '../components/Home/ProductListing';
import Footer from '../components/Footer';

const Home = () => {
  return (
    <div className="pt-20">
      <Hero />
      <StorySection />
      <ProductListing />
      <div className="py-24 bg-dark-lighter border-y border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/5 blur-[150px] -mr-64 -mt-64 rounded-full" />
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8 relative z-10">
          <h2 className="text-5xl font-serif font-bold italic">"Doğallığın En Taze Hali"</h2>
          <p className="text-white/60 text-lg leading-relaxed max-w-2xl mx-auto">
            Sevimler Kuruyemiş olarak nesillerdir en taze ve en kaliteli kuruyemişleri özenle seçiyor, geleneksel yöntemlerle kavuruyor ve sizlere ulaştırıyoruz.
          </p>
          <div className="flex justify-center space-x-12 pt-8">
            <div className="flex flex-col">
              <span className="text-3xl font-serif text-gold font-bold">1985</span>
              <span className="text-xs uppercase tracking-widest text-white/40">Kuruluş</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-serif text-gold font-bold">50+</span>
              <span className="text-xs uppercase tracking-widest text-white/40">Ürün Çeşidi</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-serif text-gold font-bold">100%</span>
              <span className="text-xs uppercase tracking-widest text-white/40">Doğal</span>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Home;
