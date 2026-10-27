import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import RequestCertificate from './pages/RequestCertificate';
import TrackApplication from './pages/TrackApplication';
import VerifyCertificate from './pages/VerifyCertificate';
import AdminLogin from './pages/AdminLogin';
import AdminApplications from './pages/AdminApplications';
import AdminCertificates from './pages/AdminCertificates';
import NotFound from './pages/NotFound';

/**
 * Public Layout Wrapper with Citizen Navbar and Footer
 */
function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Citizen Portal Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/request" element={<RequestCertificate />} />
          <Route path="/track" element={<TrackApplication />} />
          <Route path="/verify" element={<VerifyCertificate />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Protected Admin Dashboard Routes */}
        <Route
          path="/admin/applications"
          element={
            <ProtectedRoute>
              <AdminApplications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/certificates"
          element={
            <ProtectedRoute>
              <AdminCertificates />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
