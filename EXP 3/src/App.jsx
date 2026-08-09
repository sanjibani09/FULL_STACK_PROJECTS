import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Unauthorized from "./components/Unauthorized";
import { getSession } from "./services/authService";
function App() { const [session, setSession] = useState(getSession); const [dark, setDark] = useState(() => localStorage.getItem("securespace.theme") === "dark"); useEffect(() => { document.documentElement.dataset.theme = dark ? "dark" : "light"; localStorage.setItem("securespace.theme", dark ? "dark" : "light"); }, [dark]); const dashboard = <Dashboard session={session} onSession={setSession} onLogout={() => setSession(null)} dark={dark} setDark={setDark} />; return <Routes><Route path="/" element={session ? <Navigate to="/dashboard" replace /> : <Login onLogin={setSession} dark={dark} setDark={setDark} />} /><Route element={<ProtectedRoute session={session} />}><Route path="/dashboard" element={dashboard} /><Route path="/profile" element={dashboard} /><Route path="/activity" element={dashboard} /><Route element={<ProtectedRoute session={session} allowedRoles={["Admin"]} />}><Route path="/admin" element={dashboard} /></Route><Route element={<ProtectedRoute session={session} allowedRoles={["Admin", "Editor"]} />}><Route path="/editor" element={dashboard} /></Route><Route path="/unauthorized" element={<Unauthorized />} /></Route><Route path="*" element={<Navigate to={session ? "/dashboard" : "/"} replace />} /></Routes>; }
export default App;
