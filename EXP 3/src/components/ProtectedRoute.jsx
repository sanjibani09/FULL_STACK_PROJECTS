import { Navigate, Outlet } from "react-router-dom";
function ProtectedRoute({ session, allowedRoles }) { if (!session) return <Navigate to="/" replace />; if (allowedRoles && !allowedRoles.includes(session.user.role)) return <Navigate to="/unauthorized" replace />; return <Outlet />; }
export default ProtectedRoute;
