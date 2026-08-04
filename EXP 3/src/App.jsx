import { useEffect, useState } from "react";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import { getSession } from "./services/authService";
function App() { const [session, setSession] = useState(getSession); const [dark, setDark] = useState(() => localStorage.getItem("securespace.theme") === "dark"); useEffect(() => { document.documentElement.dataset.theme = dark ? "dark" : "light"; localStorage.setItem("securespace.theme", dark ? "dark" : "light"); }, [dark]); return session ? <Dashboard session={session} onSession={setSession} onLogout={() => setSession(null)} dark={dark} setDark={setDark} /> : <Login onLogin={setSession} dark={dark} setDark={setDark} />; }
export default App;
