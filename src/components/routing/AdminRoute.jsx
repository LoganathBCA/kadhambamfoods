// src/components/routing/AdminRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, isAdmin } = useAuth();

  // AuthProvider blocks rendering until auth is resolved,
  // so both 'user' and 'isAdmin' are definitive here — no loading needed.
  if (!user)    return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/"      replace />;

  return children;
};

export default AdminRoute;
