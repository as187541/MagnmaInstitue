import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../hooks/useTheme";
import { useAuth } from "../contexts/AuthContext";

const NAV_LINKS = [
  { to: "/", label: "Home", hash: "home" },
  { to: "/", label: "Services", hash: "services" },
  { to: "/", label: "About", hash: "about" },
  { to: "/colleges", label: "Colleges" },
  { to: "/courses", label: "Courses" },
  { to: "/blog", label: "Blog" },
  { to: "/", label: "Contact", hash: "contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { toggleTheme } = useTheme();
  const { user, profile, signOut, isStaff } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavClick = (to: string, hash?: string) => {
    setMenuOpen(false);
    if (hash && to === "/") {
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header>
      <nav>
        <div className="logo">
          <Link to="/">
            <span>Magnma</span>Institute
          </Link>
        </div>
        <div className="nav-items-container">
          <div className={`hero-links nav-links ${menuOpen ? "active" : ""}`}>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                onClick={() => handleNavClick(link.to, link.hash)}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          {user ? (
            <div className="user-menu-container">
              <button
                className="user-menu-toggle"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <i className="fa fa-user-circle"></i>
                <span>{profile?.full_name || profile?.email || "User"}</span>
                <i className={`fa fa-chevron-${userMenuOpen ? "up" : "down"}`}></i>
              </button>
              {userMenuOpen && (
                <div className="user-dropdown">
                  {isStaff && (
                    <Link to="/admin" onClick={() => setUserMenuOpen(false)}>
                      <i className="fa fa-dashboard"></i> Dashboard
                    </Link>
                  )}
                  <button onClick={handleSignOut}>
                    <i className="fa fa-sign-out"></i> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hero-btn">
              <Link to="/login">
                <i className="fa fa-sign-in"></i> Login
              </Link>
            </div>
          )}

          <button id="theme-toggle" onClick={toggleTheme} aria-label="Switch Theme">
            <i className="fa fa-paint-brush"></i>
          </button>
        </div>
        <div
          className={`hamburger-menu ${menuOpen ? "active" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <div className="ham-bar bar-top"></div>
          <div className="ham-bar bar-mid"></div>
          <div className="ham-bar bar-bottom"></div>
        </div>
      </nav>
    </header>
  );
}
