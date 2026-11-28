
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAdminTheme } from "../context/useAdminTheme";
import "./AdminHeader.css";

function AdminHeader() {
  const navigate = useNavigate();
  const { darkMode, setDarkMode } = useAdminTheme();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    window.dispatchEvent(new Event("auth-changed"));
    navigate("/login", { replace: true });
  };

  return (
    <aside className={`admin-sidebar ${darkMode ? "sidebar-dark" : ""}`}>
      <Link to="/admin" className="admin-sidebar-brand">
        QELVORA<span>.</span>
        <small>ADMIN</small>
      </Link>

      <div className="admin-sidebar-divider" />

      <p className="admin-sidebar-label">MAIN MENU</p>

      <nav className="admin-sidebar-nav">
        <NavLink to="/admin" end>
          <span className="admin-sidebar-icon">▦</span>
          <span>Overview</span>
        </NavLink>

        <NavLink to="/admin/products">
          <span className="admin-sidebar-icon">◇</span>
          <span>Manage Products</span>
        </NavLink>

        <NavLink to="/admin/orders">
          <span className="admin-sidebar-icon">▤</span>
          <span>Manage Orders</span>
        </NavLink>

        <Link to="/admin#user-management">
          <span className="admin-sidebar-icon">♙</span>
          <span>User Management</span>
        </Link>
      </nav>

      <div className="admin-sidebar-bottom">
        <div className="admin-sidebar-divider" />

        <button
          type="button"
          className="admin-theme-toggle"
          onClick={() => setDarkMode((value) => !value)}
        >
          <span className="admin-sidebar-icon">
            {darkMode ? "☀" : "☾"}
          </span>
          <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
        </button>

        <button
          type="button"
          className="admin-sidebar-logout"
          onClick={handleLogout}
        >
          <span className="admin-sidebar-icon">↪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default AdminHeader;
