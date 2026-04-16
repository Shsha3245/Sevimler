import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <div className="relative h-[85vh] overflow-hidden flex items-center justify-center">
      {/* Background with parallax effect or gradient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-dark/80 via-dark/40 to-dark z-10" />
      </div>

      <div className="container mx-auto px-6 relative z-20 text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="gold-gradient font-bold uppercase tracking-[0.4em] text-sm mb-4 block">Geleneksel Tatlar, Modern Sunum</span>
          <div className="relative inline-block">
            <div className="absolute inset-0 -z-10 rounded-2xl blur-2xl opacity-50" style={{ backgroundImage: 'url(/src/assets/hero.png)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
            <h1 className="relative text-6xl md:text-8xl font-serif font-bold text-white mb-6 px-8 py-8">
              Zerafetin <br /> <span className="text-gold italic">Doğal Hali</span>
            </h1>
          </div>
          <p className="max-w-xl mx-auto text-white/60 text-lg md:text-xl font-light leading-relaxed">
            Türkiye'nin bereketli topraklarından özenle seçilen en taze mahsuller, Sevimler kalitesiyle masanıza geliyor.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10"
        >
          <a 
            href="#products"
            className="group px-10 py-5 bg-gold text-black font-bold rounded-full relative overflow-hidden transition-all hover:scale-105 active:scale-95 flex items-center space-x-3"
          >
            <span className="relative z-10">Tüm Ürünleri Keşfet</span>
            <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-2 transition-transform" />
          </a>
          
        </motion.div>
      </div>

      {/* Decorative Ornaments */}
      <div className="absolute bottom-10 left-10 flex flex-col space-y-4 text-white/20">
         <div className="w-px h-24 bg-gold/30 mx-auto" />
      </div>
    </div>
  );
};

export default Hero;
