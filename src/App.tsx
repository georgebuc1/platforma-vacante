import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import AdminLayout from '@/components/admin/AdminLayout';
import ProtectedRoute from '@/components/admin/ProtectedRoute';
import { ToastContainer } from '@/components/common/Toast';
import HomePage from '@/pages/HomePage';
import OffersPage from '@/pages/OffersPage';
import OfferDetailsPage from '@/pages/OfferDetailsPage';
import AlertsPage from '@/pages/AlertsPage';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage';
import CookiesPage from '@/pages/CookiesPage';
import AffiliateDisclosurePage from '@/pages/AffiliateDisclosurePage';
import LoginPage from '@/pages/LoginPage';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminOffersList from '@/pages/admin/AdminOffersList';
import AdminOfferForm from '@/pages/admin/AdminOfferForm';
import AdminAlerts from '@/pages/admin/AdminAlerts';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public site */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/oferte" element={<OffersPage />} />
          <Route path="/oferte/:slug" element={<OfferDetailsPage />} />
          <Route path="/alerte" element={<AlertsPage />} />
          <Route path="/despre" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/confidentialitate" element={<PrivacyPolicyPage />} />
          <Route path="/cookies" element={<CookiesPage />} />
          <Route path="/afiliere" element={<AffiliateDisclosurePage />} />
        </Route>

        {/* Login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Admin — protected */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="oferte" element={<AdminOffersList />} />
          <Route path="oferte/noua" element={<AdminOfferForm />} />
          <Route path="oferte/:id/edit" element={<AdminOfferForm />} />
          <Route path="alerte" element={<AdminAlerts />} />
        </Route>
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}
