import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const StorySection = () => {
  const [stories, setStories] = useState([]);
  const [activeStory, setActiveStory] = useState(null);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const res = await api.get('/stories');
        setStories(res.data);
      } catch (err) {
        console.error("Failed to fetch stories", err);
      }
    };
    fetchStories();
  }, []);

  if (stories.length === 0) return null;

  return (
    <div className="py-12 bg-stone-900 border-b border-stone-800" id="story">
      <div className="max-w-7xl mx-auto">
        <div className="flex space-x-6 overflow-x-auto px-6 pb-4 no-scrollbar scroll-smooth">
          {stories.map((story) => (
            <button 
              key={story.id} 
              onClick={() => setActiveStory(story)}
              className="flex-shrink-0 flex flex-col items-center space-y-3 group"
            >
              <div className="p-[3px] rounded-full bg-amber-500 group-hover:scale-110 transition-transform duration-300">
                <div className="w-20 h-20 rounded-full border-[3px] border-stone-900 overflow-hidden bg-stone-800">
                  <img 
                    src={story.image_url.startsWith('http') ? story.image_url : `http://localhost:8000${story.image_url}`} 
                    alt={story.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-amber-50/60 group-hover:text-amber-500 transition-colors">
                {story.title || "Sevimler"}
              </span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {activeStory && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-stone-950/95 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <button 
              onClick={() => setActiveStory(null)}
              className="absolute top-8 right-8 text-amber-50 hover:text-amber-500 z-10 p-2 bg-stone-900 rounded-full border border-stone-800"
            >
              <X className="w-6 h-6" />
            </button>
            
            <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="relative w-full max-w-sm aspect-[9/16] overflow-hidden rounded-3xl shadow-2xl border border-amber-500/10"
            >
              <img 
                src={activeStory.image_url.startsWith('http') ? activeStory.image_url : `http://localhost:8000${activeStory.image_url}`} 
                alt={activeStory.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent">
                 <h3 className="text-2xl font-playfair text-amber-50 font-bold">{activeStory.title || "Sevimler Kuruyemiş"}</h3>
                 <p className="text-amber-50/60 mt-2 text-sm">Geleneksel Lezzet, Modern Sunum</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StorySection;
