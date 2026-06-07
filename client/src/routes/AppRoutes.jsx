import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Public Pages
import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import VerifyEmailPage from "../pages/auth/VerifyEmailPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";

// Worker Pages
import WorkerDashboard from "../pages/worker/WorkerDashboard";
import BrowseTasksPage from "../pages/worker/BrowseTasksPage";
import MyTasksPage from "../pages/worker/MyTasksPage";
import WalletPage from "../pages/worker/WalletPage";
import NotificationsPage from "../pages/worker/NotificationsPage";
import RatingsPage from "../pages/worker/RatingsPage";
import ProfilePage from "../pages/worker/ProfilePage";

// Creator Pages
import CreatorDashboard from "../pages/creator/CreatorDashboard";
import CreateTaskPage from "../pages/creator/CreateTaskPage";
import CreatorTasksPage from "../pages/creator/CreatorTasksPage";
import CreatorWalletPage from "../pages/creator/CreatorWalletPage";


// ─── Full-screen Loader ────────────────────────────────────────────────────────
const FullScreenLoader = () => (
  <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <div style={{ width: 44, height: 44, border: "3px solid rgba(126,211,72,0.2)", borderTop: "3px solid #7ed348", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// ─── ProtectedRoute ────────────────────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

// ─── RoleRoute ─────────────────────────────────────────────────────────────────
const RoleRoute = ({ children, role }) => {
  const { isAuthenticated, loading, user } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== role) {
    const redirect = user?.role === "creator" ? "/creator/dashboard" : user?.role === "admin" ? "/admin/dashboard" : "/worker/dashboard";
    return <Navigate to={redirect} replace />;
  }
  return children;
};

// ─── Placeholder ───────────────────────────────────────────────────────────────
const Placeholder = ({ label }) => (
  <div style={{ minHeight: "100vh", background: "#000", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, letterSpacing: "0.08em" }}>
    {label}
  </div>
);

// ─── AppRoutes ─────────────────────────────────────────────────────────────────
const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* Worker Routes */}
        <Route path="/worker/dashboard" element={<ProtectedRoute><WorkerDashboard /></ProtectedRoute>} />
        <Route path="/worker/tasks" element={<ProtectedRoute><BrowseTasksPage /></ProtectedRoute>} />
        <Route path="/worker/my-tasks" element={<ProtectedRoute><MyTasksPage /></ProtectedRoute>} />
        <Route path="/worker/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
        <Route path="/worker/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        <Route path="/worker/ratings" element={<ProtectedRoute><RatingsPage /></ProtectedRoute>} />
        <Route path="/worker/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

        {/* Creator Routes */}
        <Route path="/creator/dashboard" element={<ProtectedRoute><CreatorDashboard /></ProtectedRoute>} />
        <Route path="/creator/tasks/create" element={<ProtectedRoute><CreateTaskPage /></ProtectedRoute>} />
        <Route path="/creator/tasks" element={<ProtectedRoute><CreatorTasksPage /></ProtectedRoute>} />
        <Route path="/creator/wallet" element={<ProtectedRoute><CreatorWalletPage /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<RoleRoute role="admin"><Placeholder label="Admin Dashboard — Coming Soon" /></RoleRoute>} />
        <Route path="/admin/users" element={<RoleRoute role="admin"><Placeholder label="Admin Users" /></RoleRoute>} />
        <Route path="/admin/tasks" element={<RoleRoute role="admin"><Placeholder label="Admin Tasks" /></RoleRoute>} />
        <Route path="/admin/withdrawals" element={<RoleRoute role="admin"><Placeholder label="Admin Withdrawals" /></RoleRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;

