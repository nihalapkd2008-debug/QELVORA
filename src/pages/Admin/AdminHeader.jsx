
import { Link, NavLink, useNavigate } from "react-router-dom";
import "./AdminHeader.css";

function AdminHeader() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    window.dispatchEvent(new Event("auth-changed"));
    navigate("/login", { replace: true });
  };

  return (
    <header className="admin-header">
      <Link to="/admin" className="admin-brand">
        QELVORA<span>.</span>
        <small>ADMIN</small>
      </Link>

      <nav className="admin-nav">
        <NavLink to="/admin" end>
          Dashboard
        </NavLink>

        <NavLink to="/admin/products">
          Manage Products
        </NavLink>

        <NavLink to="/admin/orders">
          Manage Orders
        </NavLink>
      </nav>

      <button
        type="button"
        className="admin-logout"
        onClick={handleLogout}
      >
        Logout
      </button>
    </header>
  );
}

export default AdminHeader;
