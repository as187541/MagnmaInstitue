// ============================================================
// Admin Layout with Sidebar
// ============================================================

import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";

const ADMIN_NAV = [
  { to: "/admin", label: "Dashboard", icon: "fa-dashboard" },
  { to: "/admin/blog", label: "Blog Posts", icon: "fa-newspaper-o" },
  { to: "/admin/inquiries", label: "Inquiries", icon: "fa-envelope" },
  { to: "/admin/colleges", label: "Colleges", icon: "fa-university" },
  { to: "/admin/courses", label: "Courses", icon: "fa-graduation-cap" },
  { to: "/admin/users", label: "Users", icon: "fa-users" },
];

const STAFF_NAV = [
  { to: "/admin", label: "Dashboard", icon: "fa-dashboard" },
  { to: "/admin/blog", label: "Blog Posts", icon: "fa-newspaper-o" },
  { to: "/admin/inquiries", label: "Inquiries", icon: "fa-envelope" },
  { to: "/admin/colleges", label: "Colleges", icon: "fa-university" },
  { to: "/admin/courses", label: "Courses", icon: "fa-graduation-cap" },
];

export default function AdminLayout() {
  const { profile, signOut, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = isAdmin ? ADMIN_NAV : STAFF_NAV;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="admin-layout">
      {/* Top Bar for mobile */}
      <header className="admin-topbar">
        <button
          className="admin-sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle sidebar"
        >
          <i className="fa fa-bars"></i>
        </button>
        <Link to="/" className="admin-topbar-logo">
          <span>Magnma</span>Institute
        </Link>
        <div className="admin-topbar-badge">{isAdmin ? "Admin" : "Staff"}</div>
      </header>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="admin-sidebar-header">
          <Link to="/" className="logo">
            <span>Magnma</span>Institute
          </Link>
          <p className="admin-badge">{isAdmin ? "Admin" : "Staff"} Panel</p>
        </div>

        <nav className="admin-sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`admin-nav-link ${isActive(item.to) ? "active" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <i className={`fa ${item.icon}`}></i>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <span className="admin-user-name">{profile?.full_name || profile?.email}</span>
            <span className="admin-user-role" style={{ textTransform: 'uppercase', fontWeight: 700, color: isAdmin ? '#4ade80' : '#fbbf24' }}>
              {profile?.role || 'loading...'}
            </span>
          </div>
          <button className="admin-signout-btn" onClick={handleSignOut}>
            <i className="fa fa-sign-out"></i> Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-content-header">
          <h2>{navItems.find(n => isActive(n.to))?.label || "Dashboard"}</h2>
          <div className="breadcrumb">
            <Link to="/admin">Admin</Link>
            <i className="fa fa-chevron-right"></i>
            <span>{navItems.find(n => isActive(n.to))?.label || "Dashboard"}</span>
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
