import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      await api.post('/register', { username, password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Kayıt sırasında bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-white">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 max-w-md bg-white p-12 rounded-[3rem] border border-gray-100 shadow-2xl flex flex-col items-center"
        >
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-3xl font-serif text-[#1c1917] font-bold">Kayıt Başarılı!</h1>
          <p className="text-stone-400 text-sm leading-relaxed font-medium">
            Hesabınız başarıyla oluşturuldu. Giriş sayfasına yönlendiriliyorsunuz...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20 relative overflow-hidden bg-white">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#d97706]/5 blur-[120px] rounded-full -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#d97706]/5 blur-[120px] rounded-full -ml-32 -mb-32" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-2xl space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-serif text-[#1c1917] font-bold">Bize Katılın</h1>
            <p className="text-stone-400 text-sm font-medium">Sevimler Kuruyemiş ailesine üye olun</p>
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
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-[#1c1917] focus:outline-none focus:border-[#d97706]/50 transition-all shadow-sm"
                  placeholder="Kullanıcı adınız"
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
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-[#1c1917] focus:outline-none focus:border-[#d97706]/50 transition-all shadow-sm"
                  placeholder="••••••••"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-stone-400 font-bold ml-1">Şifre Tekrar</label>
              <div className="relative">
                <input 
                  type="password" 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-[#1c1917] focus:outline-none focus:border-[#d97706]/50 transition-all shadow-sm"
                  placeholder="••••••••"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300" />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center space-x-2 text-red-500 text-xs bg-red-50 p-4 rounded-xl border border-red-100"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-[#d97706] hover:bg-amber-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all transform active:scale-[0.98] flex items-center justify-center space-x-2 shadow-lg shadow-amber-900/10 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" />
              ) : (
                <>
                  <span>Kayıt Ol</span>
                  <UserPlus className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-4">
            <p className="text-stone-400 text-xs font-bold uppercase tracking-widest leading-relaxed">
              Zaten hesabınız var mı? <Link to="/login" className="text-[#d97706] hover:underline">Giriş Yapın</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
