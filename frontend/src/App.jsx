import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import AdminDashboard from './pages/Admin/Dashboard';
import Navbar from './components/Navbar';
import KVKK from './pages/KVKK';
import RefundPolicy from './pages/RefundPolicy';
import FAQ from './pages/FAQ';
import SuccessPage from './pages/SuccessPage';
import MyOrders from './pages/MyOrders';
import OrderManager from './pages/Admin/OrderManager';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center text-[#d97706] uppercase tracking-[0.2em] text-xs font-bold">Yükleniyor...</div>;
  
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (adminOnly && !user.is_admin) {
    console.warn("Admin access denied for user:", user.username);
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white text-[#1c1917] selection:bg-[#d97706] selection:text-white">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
          
          <Route path="/kvkk" element={<KVKK />} />
          <Route path="/iade-kosullari" element={<RefundPolicy />} />
          <Route path="/sss" element={<FAQ />} />
          <Route path="/success" element={<SuccessPage />} />
          
          {/* Hidden Admin Route */}
          <Route 
            path="/sevimler-panel-2026-secure/*" 
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/sevimler-panel-2026-secure/orders" 
            element={
              <ProtectedRoute adminOnly>
                <OrderManager />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
