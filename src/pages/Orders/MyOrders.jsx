import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import "./MyOrders.css";
function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get("orders/history/");
const data = response.data;

setOrders(
  Array.isArray(data)
    ? data
    : data.results || []
);      } catch (err) {
        setError(
          err.response?.data?.detail ||
          "Unable to load your orders."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <main className="my-orders-page" data-navbar-theme="light">
        <p className="orders-message">Loading your orders...</p>
      </main>
    );
  }

  return (
    <main className="my-orders-page" data-navbar-theme="light">
      <div className="my-orders-container">
        <header className="my-orders-heading">
          <p className="orders-eyebrow">QELVORA / YOUR ACCOUNT</p>
          <h1>My Orders</h1>
          <p>Your purchases, all in one place.</p>
        </header>

        {error && <p className="orders-error">{error}</p>}

        {!error && orders.length === 0 && (
          <section className="no-orders">
            <h2>No orders yet</h2>
            <p>Your order history will appear here after your first purchase.</p>
            <Link to="/" className="orders-shop-button">
              Explore Collection
            </Link>
          </section>
        )}

        {orders.map((order) => (
          <article className="order-card" key={order.id}>
            <div className="order-card-header">
              <div>
                <span>ORDER NUMBER</span>
                <h2>#{order.id}</h2>
              </div>

              <div className="order-status">
                {order.status}
              </div>
            </div>

            <div className="order-card-items">
              {order.items.map((item) => (
                <div className="order-item" key={item.id}>
                  <div className="order-item-image">
                    {item.product.image ? (
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                      />
                    ) : (
                      <span>Q</span>
                    )}
                  </div>

                  <div className="order-item-info">
                    <h3>{item.product.name}</h3>
                    <p>Quantity: {item.quantity}</p>
                    <strong>
                      ₹{Number(item.price).toLocaleString("en-IN")}
                    </strong>
                  </div>
                </div>
              ))}
            </div>

            <div className="order-card-footer">
              <span>
                {new Date(order.created_at).toLocaleDateString("en-IN")}
              </span>
              <strong>
                Total: ₹{Number(order.total_price).toLocaleString("en-IN")}
              </strong>
            </div>
          </article>
        ))}

        <Link to="/" className="orders-continue-link">
          ← Continue Shopping
        </Link>
      </div>
    </main>
  );
}

export default MyOrders;
