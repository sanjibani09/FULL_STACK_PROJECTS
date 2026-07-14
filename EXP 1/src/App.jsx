import { useState } from "react";
import Navbar from "./components/navbar";
import Home from "./pages/home";
import About from "./pages/about";
import Contact from "./pages/contact";
import Login from "./pages/login";

import "./App.css";

function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);
  const [authMessage, setAuthMessage] = useState("");

  const handleAuthenticated = ({ name, message }) => {
    setUser({ name });
    setAuthMessage(message);
    setPage("home");
  };

  return (
    <div className="app-shell">
      <Navbar page={page} setPage={setPage} />

      {page === "home" && <Home user={user} authMessage={authMessage} />}
      {page === "about" && <About />}
      {page === "contact" && <Contact />}
      {page === "login" && <Login onAuthenticated={handleAuthenticated} />}
    </div>
  );
}

export default App;
