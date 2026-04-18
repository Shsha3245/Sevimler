import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import StatCard from './components/StatCard';
import ProductManager from './ProductManager';
import StoryManager from './StoryManager';
import OrderManager from './OrderManager';
import { LayoutDashboard, Package, Play, BarChart3, Settings, LogOut, ArrowUpRight, TrendingUp, Users, ShoppingCart, Camera, ListChecks } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { useState, useEffect } from 'react';

const DashboardHome = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-8 text-[#d97706] animate-pulse uppercase tracking-widest text-xs font-bold">Veriler Yükleniyor...</div>;

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-[#1c1917]">Sistem Özeti</h1>
          <p className="text-gray-500 mt-1">İşletmenizin performansını buradan takip edin.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Günlük Satış" value={`${stats?.daily_sales.toLocaleString('tr-TR')} ₺`} icon={<TrendingUp className="text-[#d97706]" />} trend="+12%" />
        <StatCard title="Haftalık Satış" value={`${stats?.weekly_sales.toLocaleString('tr-TR')} ₺`} icon={<TrendingUp className="text-[#d97706]" />} trend="+8%" />
        <StatCard title="Aylık Satış" value={`${stats?.monthly_sales.toLocaleString('tr-TR')} ₺`} icon={<TrendingUp className="text-[#d97706]" />} trend="+15%" />
        <StatCard title="Toplam Sipariş" value={stats?.total_orders.toString()} icon={<ShoppingCart className="text-[#d97706]" />} trend="+5%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white border border-gray-100 p-8 rounded-2xl shadow-sm space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Satış Grafiği</h3>
              <div className="flex space-x-2">
                <span className="w-2 h-2 rounded-full bg-[#d97706]"></span>
                <span className="text-[10px] uppercase text-gray-400 font-bold tracking-widest">Gelir (TL)</span>
              </div>
           </div>
           <div className="h-[300px] flex items-end justify-between space-x-4 pt-10">
              {[40, 70, 45, 90, 65, 80, 55, 100].map((h, i) => (
                <div key={i} className="flex-1 group relative">
                   <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    className="w-full bg-gray-100 group-hover:bg-[#d97706]/20 transition-all rounded-t-md"
                  ></motion.div>
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{(h * 1000).toLocaleString()} ₺</span>
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 font-bold uppercase">G{i+1}</span>
                </div>
              ))}
           </div>
        </div>

        <div className="bg-white border border-gray-100 p-8 rounded-2xl shadow-sm space-y-6">
           <h3 className="text-xl font-bold">Hızlı İşlemler</h3>
           <div className="space-y-4">
              <Link to="orders" className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-[#d97706]/5 transition-all group border border-transparent hover:border-[#d97706]/10">
                 <div className="flex items-center space-x-3">
                    <div className="p-3 bg-white rounded-lg shadow-sm group-hover:bg-white"><ListChecks className="w-5 h-5 text-[#d97706]" /></div>
                    <span className="text-sm font-bold text-[#1c1917]">Siparişleri Yönet</span>
                 </div>
                 <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-[#d97706]" />
              </Link>
              <Link to="products" className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-[#d97706]/5 transition-all group border border-transparent hover:border-[#d97706]/10">
                 <div className="flex items-center space-x-3">
                    <div className="p-3 bg-white rounded-lg shadow-sm group-hover:bg-white"><Package className="w-5 h-5 text-[#d97706]" /></div>
                    <span className="text-sm font-bold text-[#1c1917]">Ürün Yönetimi</span>
                 </div>
                 <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-[#d97706]" />
              </Link>
           </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { label: 'Özet', icon: <LayoutDashboard />, path: '' },
    { label: 'Siparişler', icon: <ListChecks />, path: 'orders' },
    { label: 'Ürünler', icon: <Package />, path: 'products' },
    { label: 'Hikayeler', icon: <Play />, path: 'stories' },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-gray-50 border-r border-gray-100 p-8 flex flex-col">
        <div className="mb-12 flex items-center gap-3">
           <img src="https://api.sevimlerkuruyemis.com/assets/logo.jpeg" className="h-10 w-auto object-contain" />
           <div className="flex flex-col">
              <span className="text-lg font-bold text-[#1c1917]">Sevimler</span>
              <span className="text-[10px] font-bold text-[#d97706] uppercase tracking-widest">Admin Panel</span>
           </div>
        </div>

        <div className="flex-1 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === `/sevimler-panel-2026-secure${item.path ? `/${item.path}` : ''}`;
            return (
              <Link 
                key={item.label}
                to={item.path}
                className={`flex items-center space-x-4 p-4 rounded-xl transition-all ${
                  isActive ? 'bg-[#1c1917] text-white shadow-lg' : 'text-gray-500 hover:text-[#1c1917] hover:bg-white'
                }`}
              >
                {React.cloneElement(item.icon, { className: 'w-5 h-5' })}
                <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
              </Link>
            )
          })}
        </div>

        <div className="pt-8 border-t border-gray-100">
          <button 
            onClick={logout}
            className="flex items-center space-x-4 p-4 w-full text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-widest">Güvenli Çıkış</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 md:p-12 overflow-y-auto bg-white">
        <Routes>
          <Route index element={<DashboardHome />} />
          <Route path="orders" element={<OrderManager />} />
          <Route path="products" element={<ProductManager />} />
          <Route path="stories" element={<StoryManager />} />
        </Routes>
      </main>
    </div>
  );
};

export default Dashboard;
