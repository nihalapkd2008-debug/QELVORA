import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ShopContext from "../../assets/context/ShopContext.js";
import "./Checkout.css";

function Checkout() {
  const { cart, cartTotal, placeOrder, isCartLoading } =
    useContext(ShopContext);

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [error, setError] = useState("");
  const [completedOrder, setCompletedOrder] = useState(null);

  const navigate = useNavigate();

  const handlePlaceOrder = async () => {
    setError("");
    setIsPlacingOrder(true);

    try {
      const order = await placeOrder();
      setCompletedOrder(order);
    } catch (err) {
      setError(err.message || "Unable to place your order.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (isCartLoading) {
    return (
      <main className="checkout-page" data-navbar-theme="light">
        <p className="checkout-loading">Loading your order summary...</p>
      </main>
    );
  }

  if (completedOrder) {
    return (
      <div className="order-popup-backdrop">
        <div className="order-popup">
          {/* Golden rays behind the top of the card */}
          <div className="popup-rays"></div>

          {/* Confetti */}
          <span className="confetti"></span>
          <span className="confetti"></span>
          <span className="confetti"></span>
          <span className="confetti"></span>
          <span className="confetti"></span>
          <span className="confetti"></span>
          <span className="confetti"></span>
          <span className="confetti"></span>

          <section className="popup-card">
            <div className="popup-badge">
              <span>✓</span>
            </div>

            <h1>Order Confirmed</h1>
            <p className="popup-description">
              Thank you for shopping with us. Your order has been placed
              successfully.
            </p>

            <div className="popup-ticket">
              <div className="ticket-icon">#</div>
              <div className="ticket-info">
                <strong>
                  QLV-{String(completedOrder.id).padStart(5, "0")}
                </strong>
                <span>Order Number</span>
              </div>
            </div>

            <div className="popup-ticket">
              <div className="ticket-icon">₹</div>
              <div className="ticket-info">
                <strong>
                  ₹{Number(completedOrder.total_price).toLocaleString("en-IN")}
                </strong>
                <span>Total Amount</span>
              </div>
            </div>

            <div className="popup-ticket">
              <div className="ticket-icon">✓</div>
              <div className="ticket-info">
                <strong className="ticket-status">{completedOrder.status}</strong>
                <span>Order Status</span>
              </div>
            </div>

            <button className="popup-btn" onClick={() => navigate("/orders")}>
              View My Orders
            </button>

            <Link to="/" className="continue-shopping">
              Continue Shopping
            </Link>
          </section>

          {/* Round close button below the card */}
          <button
            className="popup-close"
            onClick={() => navigate("/")}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="checkout-page" data-navbar-theme="light">
        <section className="empty-checkout">
          <p className="checkout-eyebrow">QELVORA</p>
          <h1>Your bag is empty</h1>
          <p>Add something you love before proceeding to checkout.</p>
          <Link to="/" className="checkout-primary-btn">
            Explore Collection
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="checkout-page" data-navbar-theme="light">
      <div className="checkout-container">
        <div className="checkout-heading">
          <p className="checkout-eyebrow">QELVORA / YOUR BAG</p>
          <h1>Checkout</h1>
          <p>Review your selection before placing your order.</p>
        </div>

        <div className="checkout-layout">
          <section className="checkout-items">
            <div className="checkout-section-heading">
              <h2>Order Summary</h2>
              <span>{cart.length} {cart.length === 1 ? "ITEM" : "ITEMS"}</span>
            </div>

            {cart.map((item) => (
              <article className="checkout-product" key={item.id}>
                <div className="checkout-product-image">
                  {item.image ? (
                    <img src={item.image} alt={item.name} />
                  ) : (
                    <div className="checkout-no-image">Q</div>
                  )}
                </div>

                <div className="checkout-product-info">
                  <h3>{item.name}</h3>
                  <p>Quantity: {item.quantity}</p>
                  <strong>
                    ₹{(Number(item.price) * item.quantity).toLocaleString("en-IN")}
                  </strong>
                </div>
              </article>
            ))}
          </section>

          <aside className="checkout-payment">
            <p className="checkout-eyebrow">ORDER DETAILS</p>
            <h2>Order Total</h2>

            <div className="checkout-price-row">
              <span>Subtotal</span>
              <strong>₹{cartTotal.toLocaleString("en-IN")}</strong>
            </div>

            <div className="checkout-price-row">
              <span>Shipping</span>
              <strong>Free</strong>
            </div>

            <div className="checkout-divider" />

            <div className="checkout-price-row checkout-grand-total">
              <span>Total</span>
              <strong>₹{cartTotal.toLocaleString("en-IN")}</strong>
            </div>

            {error && (
              <p className="checkout-error">{error}</p>
            )}

            <button
              className="checkout-primary-btn"
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder || cart.length === 0}
            >
              {isPlacingOrder ? "PLACING ORDER..." : "PLACE ORDER"}
            </button>

            <p className="checkout-note">
              Your order will be confirmed once you place it.
            </p>

            <Link to="/" className="checkout-back-link">
              ← Continue Shopping
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default Checkout;
