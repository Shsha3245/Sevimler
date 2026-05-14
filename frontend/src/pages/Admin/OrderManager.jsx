import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ShoppingCart, User, MapPin, Phone, Calendar, Hash, 
    Truck, Check, X, Search, Filter, ChevronDown, 
    Package, Clock, Eye, Image as ImageIcon 
} from 'lucide-react';

const OrderManager = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/admin/orders');
            setOrders(res.data);
        } catch (err) {
            console.error("Failed to fetch all orders", err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderId, newStatus) => {
        try {
            await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
            fetchOrders();
            if (selectedOrder && selectedOrder.id === orderId) {
                setSelectedOrder({ ...selectedOrder, status: newStatus });
            }
        } catch (err) {
            alert("Durum güncellenemedi!");
        }
    };

    const filteredOrders = orders.filter(o => 
        (statusFilter === 'all' || o.status === statusFilter) &&
        (o.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || o.id.toString().includes(searchTerm))
    );

    const getStatusStyle = (status) => {
        switch (status) {
            case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'paid': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'preparing': return 'bg-orange-50 text-orange-600 border-orange-100';
            case 'shipped': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
            case 'delivered': return 'bg-green-50 text-green-600 border-green-100';
            case 'cancelled': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    if (loading) return <div className="p-12 text-center text-[#d97706] font-black uppercase tracking-widest animate-pulse">Siparişler Yükleniyor...</div>;

    return (
        <div className="space-y-8 bg-white min-h-full">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-gray-50 p-8 rounded-2xl border border-gray-100 gap-6">
                <div>
                    <h2 className="text-2xl font-bold text-[#1c1917]">Sipariş Yönetimi</h2>
                    <p className="text-gray-500 text-sm mt-1">Sistemdeki tüm siparişleri ve durumlarını buradan yönetin.</p>
                </div>
                <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                    <div className="relative flex-1 lg:min-w-[300px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Müşteri adı veya sipariş no..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-[#d97706] transition-all"
                        />
                    </div>
                    <select 
                        className="bg-white border border-gray-200 rounded-xl py-3 px-6 text-sm outline-none focus:border-[#d97706]"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">Tüm Durumlar</option>
                        <option value="pending">Beklemede</option>
                        <option value="paid">Ödeme Tamam</option>
                        <option value="preparing">Hazırlanıyor</option>
                        <option value="shipped">Kargoda</option>
                        <option value="delivered">Teslim Edildi</option>
                        <option value="cancelled">İptal Edildi</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                        <tr>
                            <th className="px-8 py-6">Sipariş Bilgisi</th>
                            <th className="px-8 py-6">Müşteri</th>
                            <th className="px-8 py-6 text-center">Tutar</th>
                            <th className="px-8 py-6 text-center">Durum</th>
                            <th className="px-8 py-6 text-right">İşlem</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredOrders.map(o => (
                            <tr key={o.id} className="hover:bg-gray-50/50 group transition-colors">
                                <td className="px-8 py-6">
                                    <div className="flex items-center space-x-4">
                                        <div className="p-3 bg-gray-50 rounded-xl text-stone-400 group-hover:bg-white group-hover:text-[#d97706] transition-all shadow-sm">
                                            <Hash className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-[#1c1917]">#{o.id}</div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-1">
                                                {new Date(o.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center space-x-3">
                                        <User className="w-4 h-4 text-gray-300" />
                                        <span className="text-sm font-bold text-[#1c1917]">{o.full_name}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-center">
                                    <span className="text-sm font-bold text-[#d97706]">{o.total_price.toLocaleString()} ₺</span>
                                </td>
                                <td className="px-8 py-6 text-center">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(o.status)}`}>
                                        {o.status}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <button 
                                        onClick={() => setSelectedOrder(o)}
                                        className="p-3 text-gray-300 hover:text-[#d97706] hover:bg-[#d97706]/5 rounded-xl transition-all"
                                    >
                                        <Eye className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredOrders.length === 0 && (
                    <div className="p-32 text-center text-gray-300 uppercase font-black tracking-widest text-xs">
                        Gösterilecek sipariş bulunamadı.
                    </div>
                )}
            </div>

            {/* Order Details Modal */}
            <AnimatePresence>
                {selectedOrder && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-[3rem] shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
                        >
                            {/* Modal Header */}
                            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-[#d97706] text-white rounded-2xl shadow-lg ring-4 ring-amber-50">
                                        <Package className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-[#1c1917]">Sipariş Detayı #{selectedOrder.id}</h3>
                                        <div className="flex items-center space-x-3 mt-0.5">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[#d97706]">{new Date(selectedOrder.created_at).toLocaleString()}</span>
                                            <span className="w-1 h-1 bg-amber-500 rounded-full"></span>
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${getStatusStyle(selectedOrder.status).split(' ')[1]}`}>{selectedOrder.status}</span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-black p-2 bg-white rounded-xl shadow-sm border border-gray-100 transition-all">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                                    
                                    {/* Left: Info (5 Columns) */}
                                    <div className="lg:col-span-5 space-y-10">
                                        <section className="space-y-6">
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d97706] border-b border-amber-50 pb-2">Müşteri & Teslimat</h4>
                                            <div className="space-y-4">
                                                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-amber-100 transition-colors">
                                                    <div className="p-2 bg-white rounded-lg shadow-sm"><User className="w-4 h-4 text-gray-400" /></div>
                                                    <span className="text-sm font-bold text-[#1c1917]">{selectedOrder.full_name}</span>
                                                </div>
                                                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-amber-100 transition-colors">
                                                    <div className="p-2 bg-white rounded-lg shadow-sm"><Phone className="w-4 h-4 text-gray-400" /></div>
                                                    <span className="text-sm font-bold text-[#1c1917]">{selectedOrder.phone}</span>
                                                </div>
                                                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-amber-100 transition-colors">
                                                    <div className="p-2 bg-white rounded-lg shadow-sm mt-0.5"><MapPin className="w-4 h-4 text-gray-400" /></div>
                                                    <span className="text-sm font-medium text-stone-600 leading-relaxed">{selectedOrder.address}</span>
                                                </div>
                                            </div>
                                        </section>

                                        <section className="space-y-6">
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d97706] border-b border-amber-50 pb-2">Durum Yönetimi</h4>
                                            <div className="grid grid-cols-2 gap-3">
                                                {["preparing", "shipped", "delivered", "cancelled"].map(st => (
                                                    <button 
                                                        key={st} 
                                                        onClick={() => updateStatus(selectedOrder.id, st)}
                                                        className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${selectedOrder.status === st ? 'bg-[#1c1917] text-white border-[#1c1917] shadow-lg scale-[1.02]' : 'bg-white text-gray-400 border-gray-100 hover:border-amber-200 hover:text-[#1c1917]'}`}
                                                    >
                                                        {st === 'preparing' ? 'Hazırlanıyor' : 
                                                         st === 'shipped' ? 'Kargoda' : 
                                                         st === 'delivered' ? 'Teslim Edildi' : 'İptal Et'}
                                                    </button>
                                                ))}
                                            </div>
                                        </section>

                                        {selectedOrder.tracking_number && (
                                            <section className="space-y-4 p-6 bg-amber-50 rounded-3xl border border-amber-100">
                                                <div className="flex items-center space-x-2 text-[#d97706]">
                                                    <Truck className="w-5 h-5" />
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Kargo Takip</span>
                                                </div>
                                                <p className="text-xl font-black text-[#1c1917] font-mono tracking-tighter">{selectedOrder.tracking_number}</p>
                                            </section>
                                        )}
                                    </div>

                                    {/* Right: Items (7 Columns) */}
                                    <div className="lg:col-span-7 space-y-8">
                                        <section className="space-y-6">
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d97706] border-b border-amber-50 pb-2">Sipariş İçeriği</h4>
                                            <div className="space-y-3">
                                                {selectedOrder.items.map((item, idx) => (
                                                    <div key={idx} className="group flex justify-between items-center p-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all">
                                                        <div className="flex items-center space-x-4">
                                                            {/* Ürün Fotoğrafı */}
                                                            <div className="relative w-16 h-16 bg-gray-50 rounded-xl overflow-hidden border border-gray-50">
                                                                {item.product_image ? (
                                                                    <img 
                                                                        src={item.product_image} 
                                                                        alt={item.product_name} 
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                                        <ImageIcon className="w-6 h-6" />
                                                                    </div>
                                                                )}
                                                                <div className="absolute top-0 right-0 bg-[#1c1917] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-bl-lg">
                                                                    {item.quantity} Adet
                                                                </div>
                                                            </div>
                                                            
                                                            <div>
                                                                <p className="text-sm font-bold text-[#1c1917] group-hover:text-[#d97706] transition-colors">
                                                                    {item.product_name || `Ürün #${item.product_id}`}
                                                                </p>
                                                                <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                                                                    Birim: {item.price_at_time.toLocaleString()} ₺
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right pr-2">
                                                            <span className="text-sm font-black text-[#1c1917]">
                                                                {(item.price_at_time * item.quantity).toLocaleString()} ₺
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            
                                            {/* Toplam Tutar Alanı */}
                                            <div className="mt-8 p-8 bg-[#1c1917] rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl">
                                                <div className="relative z-10 flex justify-between items-end">
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500/80 mb-1">Ödeme Özeti</p>
                                                        <h5 className="text-gray-400 text-xs font-medium">KDV ve komisyonlar dahil</h5>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Toplam Tahsilat</p>
                                                        <p className="text-4xl font-black text-white tracking-tighter">
                                                            {selectedOrder.total_price.toLocaleString()} <span className="text-amber-500 text-xl font-bold">₺</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                {/* Arka plan dekoru */}
                                                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl"></div>
                                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
                                            </div>
                                        </section>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default OrderManager;
