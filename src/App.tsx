import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import AdminLayout from '@/components/admin/AdminLayout';
import ProtectedRoute from '@/components/admin/ProtectedRoute';
import { ToastContainer } from '@/components/common/Toast';
import HomePage from '@/pages/HomePage';
import OffersPage from '@/pages/OffersPage';
import BiletePage from '@/pages/BiletePage';
import CazariPage from '@/pages/CazariPage';
import RentACarPage from '@/pages/RentACarPage';
import LastMinutePage from '@/pages/LastMinutePage';
import GhiduriPage from '@/pages/GhiduriPage';
import GhidDetailsPage from '@/pages/GhidDetailsPage';
import ZborHotelPage from '@/pages/ZborHotelPage';
import AtractiiPage from '@/pages/AtractiiPage';
import TaxiuriAeroportPage from '@/pages/TaxiuriAeroportPage';
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
import AdminOfferImport from '@/pages/admin/AdminOfferImport';
import AdminAlerts from '@/pages/admin/AdminAlerts';
import AdminMessages from '@/pages/admin/AdminMessages';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public site */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/oferte" element={<OffersPage />} />
          <Route path="/oferte/:slug" element={<OfferDetailsPage />} />
          <Route path="/bilete" element={<BiletePage />} />
          <Route path="/cazari" element={<CazariPage />} />
          <Route path="/rent-a-car" element={<RentACarPage />} />
          <Route path="/last-minute" element={<LastMinutePage />} />
          <Route path="/ghiduri" element={<GhiduriPage />} />
          <Route path="/ghiduri/:slug" element={<GhidDetailsPage />} />
          <Route path="/zbor-hotel" element={<ZborHotelPage />} />
          <Route path="/atractii" element={<AtractiiPage />} />
          <Route path="/taxiuri-aeroport" element={<TaxiuriAeroportPage />} />
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
          <Route path="oferte/import" element={<AdminOfferImport />} />
          <Route path="oferte/:id/edit" element={<AdminOfferForm />} />
          <Route path="alerte" element={<AdminAlerts />} />
          <Route path="mesaje" element={<AdminMessages />} />
        </Route>
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}
