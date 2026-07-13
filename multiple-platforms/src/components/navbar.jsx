function Navbar({ page, setPage }) {
  const links = ["home", "about", "contact", "login"];
  return (
    <nav className="navbar">
      <div className="brand">Post<span>Flow</span></div>
      <div className="nav-links">
        {links.map((link) => (
          <button key={link} className={`nav-link ${page === link ? "active" : ""}`} onClick={() => setPage(link)}>
            {link[0].toUpperCase() + link.slice(1)}
          </button>
        ))}
      </div>
    </nav>
  );
}

export default Navbar;
