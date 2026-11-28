
import { useEffect, useState } from "react";
import api from "../../services/api";
import { useAdminTheme } from "./context/useAdminTheme";
import "./AdminDashboard.css";

const formatPrice = (price) =>
  `₹${Number(price || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

const formatDate = (date) => {
  if (!date) return "—";

  const parsed = new Date(date);

  return Number.isNaN(parsed.getTime())
    ? "—"
    : parsed.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

const getList = (data) => {
  if (Array.isArray(data)) return data;
  return data?.results || [];
};

// Fetch every page so revenue and top products use complete order data.
async function fetchAllOrders() {
  const allOrders = [];
  const limit = 100;
  let offset = 0;
  let total = null;

  while (total === null || offset < total) {
    const response = await api.get("admin/orders/", {
      params: { limit, offset },
    });

    const data = response.data;

    if (Array.isArray(data)) {
      return data;
    }

    const results = getList(data);

    if (total === null) {
      total = Number(data.count ?? results.length);
    }

    if (results.length === 0) break;

    allOrders.push(...results);
    offset += results.length;
  }

  return allOrders;
}

function getSalesData(orders, period) {
  const now = new Date();
  const points = [];

  if (period === "daily") {
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);

      points.push({
        key: date.toDateString(),
        label: date.toLocaleDateString("en-IN", {
          weekday: "short",
        }),
        revenue: 0,
      });
    }
  } else if (period === "weekly") {
    for (let i = 6; i >= 0; i--) {
      const end = new Date(now);
      end.setDate(now.getDate() - i * 7);
      end.setHours(23, 59, 59, 999);

      const start = new Date(end);
      start.setDate(end.getDate() - 6);
      start.setHours(0, 0, 0, 0);

      points.push({
        start,
        end,
        label: `Week ${7 - i}`,
        revenue: 0,
      });
    }
  } else {
    for (let i = 5; i >= 0; i--) {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - i,
        1
      );

      points.push({
        key: `${date.getFullYear()}-${date.getMonth()}`,
        label: date.toLocaleDateString("en-IN", {
          month: "short",
        }),
        revenue: 0,
      });
    }
  }

  orders.forEach((order) => {
    if (order.status === "cancelled") return;

    const date = new Date(order.created_at);

    if (Number.isNaN(date.getTime())) return;

    const amount = Number(order.total_price || 0);

    if (period === "daily") {
      const point = points.find(
        (item) => item.key === date.toDateString()
      );

      if (point) point.revenue += amount;
    } else if (period === "weekly") {
      const point = points.find(
        (item) => date >= item.start && date <= item.end
      );

      if (point) point.revenue += amount;
    } else {
      const key = `${date.getFullYear()}-${date.getMonth()}`;

      const point = points.find((item) => item.key === key);

      if (point) point.revenue += amount;
    }
  });

  return points;
}

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);

  const [productStats, setProductStats] = useState({
    total: 0,
    stock: 0,
    outOfStock: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [period, setPeriod] = useState("daily");

  // Shared admin theme from context
  const { darkMode } = useAdminTheme();

  useEffect(() => {
    let ignore = false;

    async function loadDashboard() {
      const results = await Promise.allSettled([
        api.get("accounts/admin/users/"),
        api.get("admin/products/", {
          params: { page: 1, page_size: 10 },
        }),
        fetchAllOrders(),
      ]);

      if (ignore) return;

      const [userResult, productResult, orderResult] = results;

      if (userResult.status === "fulfilled") {
        setUsers(getList(userResult.value.data));
      } else {
        setError("Unable to load user information.");
      }

      if (productResult.status === "fulfilled") {
        const data = productResult.value.data;

        setProductStats({
          total: Number(data.count || 0),
          stock: Number(data.total_stock || 0),
          outOfStock: Number(data.out_of_stock || 0),
        });
      } else {
        setError("Unable to load product information.");
      }

      if (orderResult.status === "fulfilled") {
        setOrders(orderResult.value);
      } else {
        setError("Unable to load order information.");
      }

      setLoading(false);
    }

    loadDashboard();

    return () => {
      ignore = true;
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

      setUsers((previous) =>
        previous.map((item) =>
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

  const customers = users.filter(
    (user) =>
      !user.is_staff &&
      (user.role === "customer" || user.role !== "vendor")
  );

  const activeUsers = users.filter((user) => user.is_active).length;
  const blockedUsers = users.filter((user) => !user.is_active).length;

  const revenue = orders.reduce((total, order) => {
    return order.status === "cancelled"
      ? total
      : total + Number(order.total_price || 0);
  }, 0);

  const pendingOrders = orders.filter(
    (order) => order.status === "pending"
  ).length;

  const topProductsMap = {};

  orders.forEach((order) => {
    if (order.status === "cancelled") return;

    (order.items || []).forEach((item) => {
      const product = item.product;
      if (!product) return;

      const key = product.id || product.name;

      if (!topProductsMap[key]) {
        topProductsMap[key] = {
          name: product.name || "Product",
          quantity: 0,
          revenue: 0,
        };
      }

      topProductsMap[key].quantity += Number(item.quantity || 0);
      topProductsMap[key].revenue +=
        Number(item.price || 0) * Number(item.quantity || 0);
    });
  });

  const topProducts = Object.values(topProductsMap)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const salesData = getSalesData(orders, period);

  const maxRevenue = Math.max(
    ...salesData.map((item) => item.revenue),
    1
  );

  const chartPoints = salesData
    .map((item, index) => {
      const x =
        (index / (salesData.length - 1)) * 560 + 20;

      const y = 170 - (item.revenue / maxRevenue) * 140;

      return `${x},${y}`;
    })
    .join(" ");

  const recentOrders = orders.slice(0, 5);

  return (
    <main
      className={`admin-dashboard ${darkMode ? "admin-dark" : ""}`}
      data-navbar-theme="light"
    >
      <header className="dashboard-topbar">
        <div>
          <p className="admin-eyebrow">QELVORA MANAGEMENT</p>
          <h1>Dashboard Overview</h1>
          <p>Welcome back. Here's what's happening in your store.</p>
        </div>
      </header>

      {error && (
        <p className="admin-error" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className="admin-message">Loading dashboard data...</p>
      ) : (
        <>
          <section className="dashboard-stats">
            <article className="dashboard-stat-card">
              <span>Total Revenue</span>
              <strong>{formatPrice(revenue)}</strong>
              <small>Excluding cancelled orders</small>
            </article>

            <article className="dashboard-stat-card">
              <span>Total Orders</span>
              <strong>{orders.length}</strong>
              <small>{pendingOrders} pending orders</small>
            </article>

            <article className="dashboard-stat-card">
              <span>Total Products</span>
              <strong>{productStats.total}</strong>
              <small>{productStats.stock} units in stock</small>
            </article>

            <article className="dashboard-stat-card">
              <span>Total Customers</span>
              <strong>{customers.length}</strong>
              <small>{activeUsers} active accounts</small>
            </article>
          </section>

          <section className="dashboard-main-grid">
            <article className="dashboard-panel sales-panel">
              <div className="dashboard-panel-heading">
                <div>
                  <h2>Sales Overview</h2>
                  <p>Revenue from completed and active orders</p>
                </div>

                <select
                  value={period}
                  onChange={(event) => setPeriod(event.target.value)}
                  aria-label="Sales chart period"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div className="dashboard-chart">
                <svg
                  viewBox="0 0 600 200"
                  role="img"
                  aria-label="Sales revenue chart"
                >
                  {[30, 75, 120, 170].map((y) => (
                    <line
                      key={y}
                      x1="20"
                      y1={y}
                      x2="580"
                      y2={y}
                      className="chart-grid-line"
                    />
                  ))}

                  {salesData.some((item) => item.revenue > 0) && (
                    <>
                      <polyline
                        points={chartPoints}
                        className="chart-line"
                      />

                      {salesData.map((item, index) => {
                        const x =
                          (index / (salesData.length - 1)) * 560 + 20;

                        const y =
                          170 - (item.revenue / maxRevenue) * 140;

                        return (
                          <circle
                            key={item.key || item.label}
                            cx={x}
                            cy={y}
                            r="4"
                            className="chart-dot"
                          />
                        );
                      })}
                    </>
                  )}
                </svg>

                <div className="dashboard-chart-labels">
                  {salesData.map((item, index) => (
                    <span key={`${item.label}-${index}`}>
                      {item.label}
                    </span>
                  ))}
                </div>

                {!salesData.some((item) => item.revenue > 0) && (
                  <p className="chart-empty">
                    No sales recorded for this period.
                  </p>
                )}
              </div>
            </article>

            <article className="dashboard-panel inventory-panel">
              <div className="dashboard-panel-heading">
                <div>
                  <h2>Inventory</h2>
                  <p>Current product stock</p>
                </div>
              </div>

              <div className="inventory-number">
                {productStats.stock}
                <span> total units</span>
              </div>

              <div className="inventory-detail">
                <span>Out of stock</span>
                <strong>{productStats.outOfStock}</strong>
              </div>

              <div className="inventory-detail">
                <span>Available products</span>
                <strong>
                  {Math.max(
                    productStats.total - productStats.outOfStock,
                    0
                  )}
                </strong>
              </div>
            </article>
          </section>

          <section className="dashboard-lower-grid">
            <article className="dashboard-panel">
              <div className="dashboard-panel-heading">
                <div>
                  <h2>Recent Orders</h2>
                  <p>Latest customer purchases</p>
                </div>

                <a href="/admin/orders">View all</a>
              </div>

              <div className="dashboard-table-wrapper">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>
                          {order.full_name ||
                            order.user?.username ||
                            "Customer"}
                        </td>
                        <td>{formatDate(order.created_at)}</td>
                        <td>{formatPrice(order.total_price)}</td>
                        <td>
                          <span
                            className={`dashboard-order-status ${order.status}`}
                          >
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}

                    {recentOrders.length === 0 && (
                      <tr>
                        <td colSpan="5">No orders found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="dashboard-panel top-products-panel">
              <div className="dashboard-panel-heading">
                <div>
                  <h2>Top Products</h2>
                  <p>Based on units ordered</p>
                </div>
              </div>

              {topProducts.length > 0 ? (
                topProducts.map((product, index) => (
                  <div
                    className="top-product-row"
                    key={product.name}
                  >
                    <span className="top-product-rank">
                      {index + 1}
                    </span>

                    <div className="top-product-info">
                      <strong>{product.name}</strong>
                      <small>{product.quantity} units sold</small>
                    </div>

                    <strong>{formatPrice(product.revenue)}</strong>
                  </div>
                ))
              ) : (
                <p className="admin-message">
                  No product sales available yet.
                </p>
              )}
            </article>
          </section>

          <section
            className="dashboard-panel user-management-panel"
            id="user-management"
          >
            <div className="dashboard-panel-heading">
              <div>
                <h2>User Management</h2>
                <p>View and manage registered accounts.</p>
              </div>

              <div className="user-summary">
                <span>{activeUsers} Active</span>
                <span>{blockedUsers} Blocked</span>
              </div>
            </div>

            <div className="dashboard-table-wrapper">
              <table className="dashboard-table user-table">
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

                  {users.length === 0 && (
                    <tr>
                      <td colSpan="6">No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </main>
  );
}

export default AdminDashboard;
