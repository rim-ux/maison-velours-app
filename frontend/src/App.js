import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import Navbar        from './components/Navbar';
import Footer        from './components/Footer';
import AdminSidebar  from './components/AdminSidebar';

import Login         from './pages/auth/Login';
import Register      from './pages/auth/Register';
import Menu          from './pages/client/Menu';
import Cart          from './pages/client/Cart';
import Checkout      from './pages/client/Checkout';
import OrderTracking from './pages/client/OrderTracking';
import MyOrders      from './pages/client/MyOrders';

import Dashboard         from './pages/admin/Dashboard';
import OrdersManagement  from './pages/admin/OrdersManagement';
import MenuManagement    from './pages/admin/MenuManagement';
import TablesManagement  from './pages/admin/TablesManagement';
import DeliveryZones     from './pages/admin/DeliveryZones';
import Payments          from './pages/admin/Payments';
import Statistics        from './pages/admin/Statistics';

/* ── Guards ── */
function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner" style={{ marginTop: 120 }} />;
  return user ? children : <Navigate to="/login" replace />;
}

function RequireAdmin({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner" style={{ marginTop: 120 }} />;
  if (!user)            return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/menu" replace />;
  return children;
}

/* ── Client layout (Navbar + Footer) ── */
function ClientLayout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

/* ── Admin layout (Sidebar + content) ── */
function AdminLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar />
      <main style={{ marginLeft: 250, flex: 1, padding: '2rem', background: 'var(--cream)', minHeight: '100vh' }}>
        <Outlet />
      </main>
    </div>
  );
}

/* ── App ── */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Public auth */}
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Client routes */}
            <Route element={<ClientLayout />}>
              <Route path="/"            element={<Navigate to="/menu" replace />} />
              <Route path="/menu"        element={<Menu />} />
              <Route path="/panier"      element={<Cart />} />
              <Route path="/commande"    element={<RequireAuth><Checkout /></RequireAuth>} />
              <Route path="/mes-commandes" element={<RequireAuth><MyOrders /></RequireAuth>} />
              <Route path="/suivi-commande/:id" element={<RequireAuth><OrderTracking /></RequireAuth>} />
            </Route>

            {/* Admin routes */}
            <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
              <Route index                 element={<Dashboard />} />
              <Route path="commandes"      element={<OrdersManagement />} />
              <Route path="menu"           element={<MenuManagement />} />
              <Route path="tables"         element={<TablesManagement />} />
              <Route path="livraison"      element={<DeliveryZones />} />
              <Route path="paiements"      element={<Payments />} />
              <Route path="stats"          element={<Statistics />} />
            </Route>

            <Route path="*" element={<Navigate to="/menu" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
