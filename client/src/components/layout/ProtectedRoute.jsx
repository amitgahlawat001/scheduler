import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Spinner from '../common/Spinner';

export default function ProtectedRoute({ children }) {
  const { user, authReady } = useAuth();
  if (!authReady) return <Spinner full />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
