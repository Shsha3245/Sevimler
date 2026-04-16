import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      await login(username, password);
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 100);
    } catch (err) {
      setError('Kullanıcı adı veya şifre hatalı.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20 relative overflow-hidden bg-white">
      {/* Background Ornaments */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#d97706]/5 blur-[120px] rounded-full -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#d97706]/5 blur-[120px] rounded-full -ml-32 -mb-32" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-2xl space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-serif text-[#1c1917] font-bold">Hoş Geldiniz</h1>
            <p className="text-stone-400 text-sm font-medium">Sevimler Kuruyemiş Ayrıcalığına Giriş Yapın</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-stone-400 font-bold ml-1">Kullanıcı Adı</label>
              <div className="relative">
                <input 
                  type="text" 
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-[#1c1917] placeholder-stone-300 focus:outline-none focus:border-[#d97706]/70 transition-all shadow-sm"
                  placeholder="2026Sevimler"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-stone-400 font-bold ml-1">Şifre</label>
              <div className="relative">
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-[#1c1917] placeholder-stone-300 focus:outline-none focus:border-[#d97706]/70 transition-all shadow-sm"
                  placeholder="••••••••"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300" />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center space-x-2 text-red-500 text-sm bg-red-50 p-4 rounded-xl border border-red-100"
              >
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </motion.div>
            )}

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-[#d97706] hover:bg-amber-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all transform active:scale-[0.98] flex items-center justify-center space-x-2 shadow-lg shadow-amber-900/10"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" />
              ) : (
                <>
                  <span>Giriş Yap</span>
                  <LogIn className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-stone-400 text-xs font-bold uppercase tracking-widest">
              Hesabınız yok mu? <Link to="/register" className="text-[#d97706] hover:underline">Hemen Kayıt Olun</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
