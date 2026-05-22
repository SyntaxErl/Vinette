import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import BoardView from "./pages/BoardView";
import MyTasks from "./pages/MyTasks";
import Calendar from "./pages/Calendar";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";
import Team from "./pages/Team";
import AcceptInvite from "./pages/AcceptInvite";
import Notifications from "./pages/Notifications";
import { useEffect } from "react";
import toast from "react-hot-toast";
import useAuthStore from "./store/authStore";
import api from "./api/axios";
import { joinTeam } from "./services/teamService";
import usePresenceSocket from "./hooks/usePresenceSocket";

export default function App() {
  const { token, login, logout } = useAuthStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Real-time presence socket (connects while authenticated).
  usePresenceSocket();

  useEffect(() => {
    const restoreUser = async () => {
      if (!token) return;

      try {
        const res = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        login(res.data.user, token);
      } catch {
        logout();
      }
    };

    restoreUser();
  }, []);

  // Consume a pending invite once authenticated (after register or login).
  useEffect(() => {
    if (!isAuthenticated) return;
    const pending = localStorage.getItem("pendingInviteToken");
    if (!pending) return;
    localStorage.removeItem("pendingInviteToken");
    joinTeam(pending)
      .then((res) => toast.success(res.data?.message || "You joined the team"))
      .catch((err) =>
        toast.error(err?.response?.data?.message || "Could not join the team — the link may be invalid"),
      );
  }, [isAuthenticated]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes — no login needed */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/invite/accept" element={<AcceptInvite />} />

        {/* Protected routes — login required */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/board" element={<BoardView />} />
          <Route path="/tasks" element={<MyTasks />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/team" element={<Team />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Navigate to="/profile" />} />
        </Route>

        {/* Catch all — redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}
