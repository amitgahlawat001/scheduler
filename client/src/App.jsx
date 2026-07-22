import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './components/layout/PublicLayout';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import RouteLoader from './components/layout/RouteLoader';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import BookingsPage from './pages/BookingsPage';
import PublicProfilePage from './pages/PublicProfilePage';
import PublicBookingPage from './pages/PublicBookingPage';
import ManageBookingPage from './pages/ManageBookingPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <>
      <RouteLoader />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/bookings/:cancelToken" element={<ManageBookingPage />} />
          <Route path="/:slug" element={<PublicProfilePage />} />
          <Route path="/:slug/:eventTypeSlug" element={<PublicBookingPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/analytics" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </>
  );
}
