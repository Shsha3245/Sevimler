import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Truck, CheckCircle2, Clock, ChevronDown, ShoppingBag, MapPin, Phone, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/orders/my');
            setOrders(res.data);
        } catch (err) {
            console.error("Orders fetch failed", err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <Clock className="w-4 h-4 text-amber-500" />;
            case 'paid': return <CreditCard className="w-4 h-4 text-blue-500" />;
            case 'preparing': return <Package className="w-4 h-4 text-[#d97706]" />;
            case 'shipped': return <Truck className="w-4 h-4 text-[#d97706]" />;
            case 'delivered': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            default: return <Clock className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusText = (status) => {
        const states = {
            'pending': 'Beklemede',
            'paid': 'Ödeme Onaylandı',
            'preparing': 'Hazırlanıyor',
            'shipped': 'Kargoya Verildi',
            'delivered': 'Teslim Edildi',
            'cancelled': 'İptal Edildi'
        };
        return states[status] || status;
    };

    if (loading) return (
        <div className="min-h-screen pt-32 flex items-center justify-center bg-white">
            <div className="w-12 h-12 border-4 border-[#d97706] border-t-transparent animate-spin rounded-full"></div>
        </div>
    );

    return (
        <div className="min-h-screen pt-32 pb-20 px-6 max-w-4xl mx-auto bg-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
                <div className="space-y-2">
                    <h1 className="text-4xl font-serif font-bold text-[#1c1917]">Siparişlerim</h1>
                    <p className="text-stone-400">Geçmiş ve aktif siparişlerinizi buradan takip edebilirsiniz.</p>
                </div>
                <Link to="/" className="flex items-center space-x-2 text-xs font-black uppercase tracking-widest text-[#d97706] hover:text-[#b45309] transition-colors">
                    <ShoppingBag className="w-4 h-4" />
                    <span>Yeni Alışveriş</span>
                </Link>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-32 space-y-6 bg-gray-50 rounded-[3rem] border border-gray-100">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm text-stone-200">
                        <Package className="w-10 h-10" />
                    </div>
                    <p className="text-stone-400 font-medium italic uppercase tracking-widest text-[10px]">Henüz bir siparişiniz bulunmuyor.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <motion.div 
                            key={order.id}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white border border-gray-100 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div 
                                className="p-8 cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                            >
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-[#d97706] shadow-inner">
                                        <Package className="w-8 h-8" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-xs font-black text-stone-400 uppercase tracking-widest">Sipariş No: #{order.id}</div>
                                        <div className="text-lg font-bold text-[#1c1917]">{new Date(order.created_at).toLocaleDateString('tr-TR')}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                                    <div className="text-right">
                                        <div className="text-[10px] font-black text-stone-300 uppercase tracking-widest mb-1">Durum</div>
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(order.status)}
                                            <span className="text-xs font-black uppercase tracking-wider text-[#1c1917]">{getStatusText(order.status)}</span>
                                        </div>
                                    </div>
                                    <div className="text-right min-w-[100px]">
                                        <div className="text-[10px] font-black text-stone-300 uppercase tracking-widest mb-1">Toplam</div>
                                        <div className="text-lg font-bold text-[#d97706]">{order.total_price.toLocaleString('tr-TR')} ₺</div>
                                    </div>
                                    <div className={`transition-transform duration-300 ${expandedOrder === order.id ? 'rotate-180' : ''}`}>
                                        <ChevronDown className="w-5 h-5 text-stone-400" />
                                    </div>
                                </div>
                            </div>

                            <AnimatePresence>
                                {expandedOrder === order.id && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="border-t border-gray-50 bg-gray-100/30"
                                    >
                                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                                            <div className="space-y-6">
                                                <h4 className="text-[10px] uppercase font-black tracking-widest text-[#d97706]">Teslimat Bilgileri</h4>
                                                <div className="space-y-4">
                                                    <div className="flex items-start gap-4">
                                                        <MapPin className="w-5 h-5 text-stone-400 flex-shrink-0" />
                                                        <p className="text-sm font-medium text-stone-600 leading-relaxed">{order.address}</p>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <Phone className="w-5 h-5 text-stone-400 flex-shrink-0" />
                                                        <p className="text-sm font-medium text-stone-600">{order.phone}</p>
                                                    </div>
                                                </div>
                                                
                                                {order.tracking_number && (
                                                   <div className="p-6 bg-[#d97706]/5 rounded-2xl border border-[#d97706]/10 space-y-2">
                                                        <div className="flex items-center gap-2 text-[#d97706]">
                                                            <Truck className="w-4 h-4" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest">Kargo Takip</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm font-bold text-[#1c1917]">{order.tracking_number}</span>
                                                            <button className="text-[10px] font-black uppercase tracking-widest text-[#d97706] hover:underline">Sorgula</button>
                                                        </div>
                                                   </div>
                                                )}
                                            </div>

                                            <div className="space-y-6">
                                                <h4 className="text-[10px] uppercase font-black tracking-widest text-[#d97706]">Sipariş İçeriği</h4>
                                                <div className="space-y-3">
                                                    {order.items.map((item, idx) => (
                                                        <div key={idx} className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                                            <div className="flex items-center gap-3">
                                                                <span className="w-5 h-5 bg-gray-50 rounded flex items-center justify-center text-[10px] font-bold text-stone-400">{item.quantity}x</span>
                                                                <span className="text-xs font-bold text-[#1c1917]">{item.product_name || `Ürün #${item.product_id}`}</span>
                                                            </div>
                                                            <span className="text-xs font-black text-stone-400">{(item.price_at_time * item.quantity).toLocaleString('tr-TR')} ₺</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyOrders;
