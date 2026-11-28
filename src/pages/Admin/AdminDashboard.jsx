
import { useEffect, useState } from "react";
import api from "../../services/api";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    api.get("accounts/admin/users/")
      .then((response) => {
        if (isMounted) {
          const data = response.data;

          setUsers(
            Array.isArray(data)
              ? data
              : Array.isArray(data.results)
                ? data.results
                : []
          );
        }
      })
      .catch(() => {
        if (isMounted) {
          setError("Unable to load users. Please try again.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleStatusChange = async (user) => {
    const newStatus = !user.is_active;

    setUpdatingId(user.id);
    setError("");

    try {
      await api.patch(`accounts/admin/users/${user.id}/`, {
        is_active: newStatus,
      });

      setUsers((previousUsers) =>
        previousUsers.map((item) =>
          item.id === user.id
            ? { ...item, is_active: newStatus }
            : item
        )
      );
    } catch {
      setError("Unable to update user status. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  const activeUsers = users.filter((user) => user.is_active).length;
  const blockedUsers = users.filter((user) => !user.is_active).length;

  return (
    <main className="admin-dashboard" data-navbar-theme="light">
      <div className="admin-header">
        <div>
          <p className="admin-eyebrow">QELVORA MANAGEMENT</p>
          <h1>Admin Dashboard</h1>
          <p>Manage customers and monitor user accounts.</p>
        </div>
      </div>

      <section className="admin-stats">
        <article className="admin-stat-card">
          <span>Total Users</span>
          <strong>{users.length}</strong>
        </article>

        <article className="admin-stat-card">
          <span>Active Users</span>
          <strong>{activeUsers}</strong>
        </article>

        <article className="admin-stat-card">
          <span>Blocked Users</span>
          <strong>{blockedUsers}</strong>
        </article>
      </section>

      <section className="admin-users-section">
        <div className="admin-section-heading">
          <div>
            <h2>User Management</h2>
            <p>View and manage registered accounts.</p>
          </div>
        </div>

        {loading && (
          <p className="admin-message">Loading users...</p>
        )}

        {error && (
          <p className="admin-error">{error}</p>
        )}

        {!loading && !error && users.length === 0 && (
          <p className="admin-message">No users found.</p>
        )}

        {!loading && users.length > 0 && (
          <div className="admin-table-wrapper">
            <table className="admin-users-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Vendor Status</th>
                  <th>Account Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.username}</td>
                    <td>{user.email || "—"}</td>
                    <td>
                      {user.is_staff ? "Admin" : user.role}
                    </td>
                    <td>{user.vendor_status || "—"}</td>

                    <td>
                      <span
                        className={`admin-status ${
                          user.is_active ? "active" : "blocked"
                        }`}
                      >
                        {user.is_active ? "Active" : "Blocked"}
                      </span>
                    </td>

                    <td>
                      {user.is_staff ? (
                        <span className="admin-protected">
                          Protected
                        </span>
                      ) : (
                        <button
                          className={`admin-action-button ${
                            user.is_active
                              ? "block-button"
                              : "unblock-button"
                          }`}
                          disabled={updatingId === user.id}
                          onClick={() => handleStatusChange(user)}
                        >
                          {updatingId === user.id
                            ? "Updating..."
                            : user.is_active
                              ? "Block"
                              : "Unblock"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminDashboard;
