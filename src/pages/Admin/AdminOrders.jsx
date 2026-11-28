
import { Fragment, useEffect, useState } from "react";
import api from "../../services/api";
import "./AdminOrders.css";

const PAGE_SIZE = 10;

const STATUSES = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

function formatDate(date) {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatPrice(price) {
  return `₹${Number(price || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getOrderList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const [page, setPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  // Update orders and pagination information
  const updateOrderData = (data) => {
    setOrders(getOrderList(data));
    setTotalOrders(data.count ?? getOrderList(data).length);
    setHasNext(Boolean(data.next));
    setHasPrevious(Boolean(data.previous));
  };

  // Initial order loading
  useEffect(() => {
    let ignore = false;

    async function loadInitialOrders() {
      try {
        const response = await api.get(
          `admin/orders/?limit=${PAGE_SIZE}&offset=0`
        );

        if (!ignore) {
          updateOrderData(response.data);
        }
      } catch (err) {
        console.error("Failed to load orders:", err);

        if (!ignore) {
          setError(
            err.response?.data?.detail ||
              "Unable to load orders. Please try again."
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadInitialOrders();

    return () => {
      ignore = true;
    };
  }, []);

  // Refresh current page
  const fetchOrders = async () => {
    setLoading(true);
    setError("");

    try {
      const offset = (page - 1) * PAGE_SIZE;

      const response = await api.get(
        `admin/orders/?limit=${PAGE_SIZE}&offset=${offset}`
      );

      updateOrderData(response.data);
      setExpandedId(null);
    } catch (err) {
      console.error("Failed to refresh orders:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to load orders. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Change pagination page
  
const changePage = async (newPage) => {
  if (
    newPage < 1 ||
    newPage > totalPages ||
    newPage === page ||
    loading
  ) {
    return;
  }

  const offset = (newPage - 1) * PAGE_SIZE;

  setError("");

  try {
    const response = await api.get(
      `admin/orders/?limit=${PAGE_SIZE}&offset=${offset}`
    );

    updateOrderData(response.data);
    setPage(newPage);
    setExpandedId(null);
  } catch (err) {
    console.error("Failed to load orders:", err);

    setError(
      err.response?.data?.detail ||
        "Unable to load orders. Please try again."
    );
  }
};


  // Update order status
  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    setError("");

    try {
      await api.patch(`admin/orders/${orderId}/`, {
        status: newStatus,
      });

      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order.id === orderId
            ? { ...order, status: newStatus }
            : order
        )
      );
    } catch (err) {
      console.error("Failed to update order status:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to update order status. Please try again."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const totalPages = Math.max(
    1,
    Math.ceil(totalOrders / PAGE_SIZE)
  );

  const startOrder =
  totalOrders === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;

  const endOrder = Math.min(page * PAGE_SIZE, totalOrders);

  return (
    <main className="admin-orders" data-navbar-theme="light">
      <header className="admin-orders-header">
        <div>
          <p className="admin-eyebrow">QELVORA MANAGEMENT</p>
          <h1>Order Management</h1>
          <p>
            View customer orders and manage their delivery status.
          </p>
        </div>

        <button
          type="button"
          className="admin-orders-refresh"
          onClick={fetchOrders}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh Orders"}
        </button>
      </header>

      {/* Order Summary */}
      <section className="admin-orders-summary">
        <div className="admin-orders-summary-card">
          <span>Total Orders</span>
          <strong>{totalOrders}</strong>
        </div>

        <div className="admin-orders-summary-card">
          <span>Pending Orders (This Page)</span>
          <strong>
            {orders.filter((order) => order.status === "pending").length}
          </strong>
        </div>

        <div className="admin-orders-summary-card">
          <span>Delivered Orders (This Page)</span>
          <strong>
            {orders.filter((order) => order.status === "delivered").length}
          </strong>
        </div>
      </section>

      {error && (
        <p className="admin-orders-error" role="alert">
          {error}
        </p>
      )}

      {/* Customer Orders */}
      <section className="admin-orders-section">
        <div className="admin-orders-heading">
          <div>
            <h2>Customer Orders</h2>
            <p>{totalOrders} orders received</p>
          </div>
        </div>

        {orders.length === 0 && loading ? (
  <p className="admin-orders-message">
    Loading orders...
  </p>
) : orders.length === 0 ? (
          <p className="admin-orders-message">
            No orders found.
          </p>
        ) : (
          <div className="admin-orders-table-wrapper">
            <table className="admin-orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Details</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <Fragment key={order.id}>
                    <tr>
                      <td>#{order.id}</td>

                      <td>
                        <strong>
                          {order.full_name ||
                            order.user?.username ||
                            "Customer"}
                        </strong>
                        <small>{order.user?.email || ""}</small>
                      </td>

                      <td>{formatDate(order.created_at)}</td>
                      <td>{formatPrice(order.total_price)}</td>

                      <td>
                        {order.payment_method === "cod"
                          ? "Cash on Delivery"
                          : order.payment_method || "—"}
                      </td>

                      <td>
                        <select
                          className={`admin-order-status ${order.status}`}
                          value={order.status}
                          disabled={updatingId === order.id}
                          onChange={(event) =>
                            handleStatusChange(
                              order.id,
                              event.target.value
                            )
                          }
                          aria-label={`Update status for order ${order.id}`}
                        >
                          {STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status.charAt(0).toUpperCase() +
                                status.slice(1)}
                            </option>
                          ))}
                        </select>

                        {updatingId === order.id && (
                          <small className="admin-order-saving">
                            Saving...
                          </small>
                        )}
                      </td>

                      <td>
                        <button
                          type="button"
                          className="admin-order-view-button"
                          onClick={() =>
                            setExpandedId(
                              expandedId === order.id ? null : order.id
                            )
                          }
                        >
                          {expandedId === order.id ? "Hide" : "View"}
                        </button>
                      </td>
                    </tr>

                    {expandedId === order.id && (
                      <tr>
                        <td colSpan="7">
                          <div className="admin-order-details">
                            <div className="admin-order-delivery">
                              <h3>Delivery Details</h3>

                              <p>
                                <strong>Name:</strong>{" "}
                                {order.full_name || "—"}
                              </p>

                              <p>
                                <strong>Phone:</strong>{" "}
                                {order.phone_number || "—"}
                              </p>

                              <p>
                                <strong>Address:</strong>{" "}
                                {order.address || "—"}
                              </p>

                              <p>
                                <strong>Location:</strong>{" "}
                                {[
                                  order.city,
                                  order.state,
                                  order.postal_code,
                                ]
                                  .filter(Boolean)
                                  .join(", ") || "—"}
                              </p>

                              <p>
                                <strong>Payment:</strong>{" "}
                                {order.payment_method === "cod"
                                  ? "Cash on Delivery"
                                  : order.payment_method || "—"}
                              </p>

                              <p>
                                <strong>Order Date:</strong>{" "}
                                {formatDate(order.created_at)}
                              </p>
                            </div>

                            <div className="admin-order-products">
                              <h3>Ordered Products</h3>

                              {order.items?.length ? (
                                order.items.map((item) => (
                                  <div
                                    className="admin-order-product"
                                    key={item.id}
                                  >
                                    {item.product?.image && (
                                      <img
                                        src={item.product.image}
                                        alt={
                                          item.product.name || "Product"
                                        }
                                      />
                                    )}

                                    <div>
                                      <strong>
                                        {item.product?.name || "Product"}
                                      </strong>

                                      <p>
                                        Quantity: {item.quantity}
                                      </p>

                                      <p>
                                        Price: {formatPrice(item.price)}
                                      </p>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <p>No product details available.</p>
                              )}

                              <p className="admin-order-total">
                                Total: {formatPrice(order.total_price)}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Pagination */}
      <div className="admin-orders-pagination">
  <p>
    Showing <strong>{startOrder}-{endOrder}</strong> of{" "}
    <strong>{totalOrders}</strong> orders
  </p>

  <div className="admin-orders-pagination-controls">
    <button
      type="button"
      onClick={() => changePage(page - 1)}
      disabled={!hasPrevious || loading}
    >
      Previous
    </button>

    {Array.from({ length: totalPages }, (_, index) => index + 1).map(
      (pageNumber) => (
        <button
          type="button"
          key={pageNumber}
          className={page === pageNumber ? "active" : ""}
          onClick={() => changePage(pageNumber)}
          disabled={loading}
        >
          {pageNumber}
        </button>
      )
    )}

    <button
      type="button"
      onClick={() => changePage(page + 1)}
      disabled={!hasNext || loading}
    >
      Next
    </button>
  </div>
</div>
    </main>
  );
}

export default AdminOrders;
