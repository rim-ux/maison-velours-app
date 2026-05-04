import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider }   from './context/CartContext';
import { ToastProvider }  from './context/ToastContext';

import AdminNavbar  from './components/AdminNavbar';
import ClientNavbar  from './components/ClientNavbar';

import Home           from './pages/landing/Home';
import Login          from './pages/auth/Login';
import Register       from './pages/auth/Register';
import Cart           from './pages/client/Cart';
import Checkout       from './pages/client/Checkout';
import OrderTracking  from './pages/client/OrderTracking';
import MyOrders       from './pages/client/MyOrders';
import Messages       from './pages/client/Messages';
import MyReservations from './pages/client/MyReservations';
import ClientHome     from './pages/client/ClientHome';
import MonCompte      from './pages/client/MonCompte';
import MesFavoris     from './pages/client/MesFavoris';

import AdminHome              from './pages/admin/AdminHome';
import Dashboard              from './pages/admin/Dashboard';
import OrdersManagement       from './pages/admin/OrdersManagement';
import MenuManagement         from './pages/admin/MenuManagement';
import TablesManagement       from './pages/admin/TablesManagement';
import DeliveryZones          from './pages/admin/DeliveryZones';
import Payments               from './pages/admin/Payments';
import Statistics             from './pages/admin/Statistics';
import ReservationsManagement from './pages/admin/ReservationsManagement';
import MessagesAdmin          from './pages/admin/MessagesAdmin';

/* ── Guards ── */
function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner" style={{ marginTop: 120 }} />;
  return user ? children : <Navigate to="/login" replace />;
}

function RequireAdmin({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner" style={{ marginTop: 120 }} />;
  if (!user)              return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

/* ── Client layout ── */
function ClientLayout() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', fontFamily: 'var(--font-body)' }}>
      <ClientNavbar />
      <main style={{ paddingTop: 104 }}>
        <Outlet />
      </main>
    </div>
  );
}

/* ── Admin layout ── */
function AdminLayout() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', fontFamily: 'var(--font-body)' }}>
      <AdminNavbar />
      <main style={{ paddingTop: 64, padding: '64px 2rem 2rem' }}>
        <Outlet />
      </main>
    </div>
  );
}

/* ── App ── */
export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
              <Routes>
                {/* Public */}
                <Route path="/login"    element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Landing */}
                <Route path="/" element={<Home />} />

                {/* Client home — standalone */}
                <Route path="/accueil" element={<RequireAuth><ClientHome /></RequireAuth>} />

                {/* Client routes */}
                <Route element={<ClientLayout />}>
                  <Route path="/panier"           element={<Cart />} />
                  <Route path="/commande"         element={<RequireAuth><Checkout /></RequireAuth>} />
                  <Route path="/mes-commandes"    element={<RequireAuth><MyOrders /></RequireAuth>} />
                  <Route path="/mes-reservations" element={<RequireAuth><MyReservations /></RequireAuth>} />
                  <Route path="/messagerie"       element={<RequireAuth><Messages /></RequireAuth>} />
                  <Route path="/suivi-commande/:id" element={<RequireAuth><OrderTracking /></RequireAuth>} />
                  <Route path="/mon-compte"       element={<RequireAuth><MonCompte /></RequireAuth>} />
                  <Route path="/mes-favoris"      element={<RequireAuth><MesFavoris /></RequireAuth>} />
                </Route>

                {/* Admin home — standalone */}
                <Route path="/admin" element={<RequireAdmin><AdminHome /></RequireAdmin>} />

                {/* Admin messagerie — standalone */}
                <Route path="/admin/messagerie" element={<RequireAdmin><MessagesAdmin /></RequireAdmin>} />

                {/* Admin management routes — with sidebar */}
                <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
                  <Route path="commandes"    element={<OrdersManagement />} />
                  <Route path="menu"         element={<MenuManagement />} />
                  <Route path="tables"       element={<TablesManagement />} />
                  <Route path="livraison"    element={<DeliveryZones />} />
                  <Route path="paiements"    element={<Payments />} />
                  <Route path="stats"        element={<Statistics />} />
                  <Route path="reservations" element={<ReservationsManagement />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
    </BrowserRouter>
  );
}
