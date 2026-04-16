import React from 'react';

const StatCard = ({ title, value, icon, trend }) => {
  return (
    <div className="glass p-6 rounded-3xl border-white/5 space-y-4 hover:border-gold/20 transition-all group">
      <div className="flex justify-between items-start">
        <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-gold/10 transition-all text-white/40 group-hover:text-gold">
          {React.cloneElement(icon, { className: 'w-6 h-6' })}
        </div>
        <span className="text-[10px] font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-full">{trend}</span>
      </div>
      <div>
        <p className="text-white/40 text-xs uppercase tracking-widest font-bold">{title}</p>
        <h3 className="text-2xl font-serif font-bold text-white mt-1">{value}</h3>
      </div>
    </div>
  );
};

export default StatCard;
