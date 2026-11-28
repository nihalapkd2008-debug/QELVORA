
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ShopContext from "../../assets/context/ShopContext.js";
import "./Checkout.css";

const emptyForm = {
  full_name: "",
  phone_number: "",
  address: "",
  city: "",
  state: "",
  postal_code: "",
  payment_method: "cod",
};

function getSavedForm() {
  try {
    const saved = sessionStorage.getItem("qelvora-checkout-draft");
    return saved ? { ...emptyForm, ...JSON.parse(saved) } : emptyForm;
  } catch {
    return emptyForm;
  }
}

function Checkout() {
  const { cart, cartTotal, placeOrder, isCartLoading } =
    useContext(ShopContext);

  const [formData, setFormData] = useState(getSavedForm);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [error, setError] = useState("");
  const [completedOrder, setCompletedOrder] = useState(null);

  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;

    const updatedForm = {
      ...formData,
      [name]: value,
    };

    setFormData(updatedForm);
    sessionStorage.setItem(
      "qelvora-checkout-draft",
      JSON.stringify(updatedForm)
    );
  };

  const handlePlaceOrder = async (event) => {
    event.preventDefault();
    setError("");

    // Preserve form details before redirecting to login.
    sessionStorage.setItem(
      "qelvora-checkout-draft",
      JSON.stringify(formData)
    );

    if (!localStorage.getItem("access_token")) {
      navigate("/login", {
        state: { from: { pathname: "/checkout" } },
      });
      return;
    }

    setIsPlacingOrder(true);

    try {
      const order = await placeOrder(formData);

      sessionStorage.removeItem("qelvora-checkout-draft");
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
        <p className="checkout-loading">
          Loading your order summary...
        </p>
      </main>
    );
  }

  if (completedOrder) {
    return (
      <div className="order-popup-backdrop">
        <div className="order-popup">
          <div className="popup-rays"></div>

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
                <strong className="ticket-status">
                  {completedOrder.status}
                </strong>
                <span>Order Status</span>
              </div>
            </div>

            <button
              className="popup-btn"
              onClick={() => navigate("/orders")}
            >
              View My Orders
            </button>

            <Link to="/" className="continue-shopping">
              Continue Shopping
            </Link>
          </section>

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

        <form className="checkout-layout" onSubmit={handlePlaceOrder}>
          <section className="checkout-items">
            <div className="checkout-section-heading">
              <h2>Order Summary</h2>
              <span>
                {cart.length} {cart.length === 1 ? "ITEM" : "ITEMS"}
              </span>
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
                    ₹{(
                      Number(item.price) * item.quantity
                    ).toLocaleString("en-IN")}
                  </strong>
                </div>
              </article>
            ))}

            {/* Delivery Information */}
            <div className="delivery-form">
              <div className="checkout-section-heading delivery-heading">
                <h2>Delivery Information</h2>
                <span>SHIPPING DETAILS</span>
              </div>

              <div className="delivery-fields">
                <div className="delivery-field">
                  <label htmlFor="full_name">Full Name</label>
                  <input
                    id="full_name"
                    name="full_name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.full_name}
                    onChange={handleChange}
                    maxLength={150}
                    required
                  />
                </div>

                <div className="delivery-field">
                  <label htmlFor="phone_number">Phone Number</label>
                  <input
                    id="phone_number"
                    name="phone_number"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    maxLength={15}
                    pattern="[0-9+\-\s]{7,15}"
                    title="Enter a valid phone number"
                    required
                  />
                </div>

                <div className="delivery-field delivery-full">
                  <label htmlFor="address">Street Address</label>
                  <textarea
                    id="address"
                    name="address"
                    placeholder="House number, street and area"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    required
                  />
                </div>

                <div className="delivery-field">
                  <label htmlFor="city">City</label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleChange}
                    maxLength={100}
                    required
                  />
                </div>

                <div className="delivery-field">
                  <label htmlFor="state">State</label>
                  <input
                    id="state"
                    name="state"
                    type="text"
                    placeholder="State"
                    value={formData.state}
                    onChange={handleChange}
                    maxLength={100}
                    required
                  />
                </div>

                <div className="delivery-field delivery-full">
                  <label htmlFor="postal_code">Postal Code</label>
                  <input
                    id="postal_code"
                    name="postal_code"
                    type="text"
                    placeholder="Enter postal code"
                    value={formData.postal_code}
                    onChange={handleChange}
                    maxLength={10}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            
<div className="checkout-payment-method">
  <h3 className="checkout-section-heading">Payment Method</h3>

  <div className="payment-options">
    <label className="payment-option payment-option-disabled">
      <input
        type="radio"
        name="payment_method"
        value="online"
        disabled
      />
      <span className="payment-option-icon">✦</span>
      <span className="payment-option-details">
        <strong>Online Payment</strong>
        <small>UPI, Credit / Debit Card</small>
      </span>
      <span className="payment-coming-soon">Coming Soon</span>
    </label>

    <label className="payment-option">
      <input
        type="radio"
        name="payment_method"
        value="cod"
        checked={formData.payment_method === "cod"}
        onChange={handleChange}
      />
      <span className="payment-option-icon">₹</span>
      <span className="payment-option-details">
        <strong>Cash on Delivery</strong>
        <small>Pay when you receive your order</small>
      </span>
      <span className="payment-option-check">✓</span>
    </label>
  </div>
</div>
          </section>

          {/* Order Total */}
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

            {error && <p className="checkout-error">{error}</p>}

            <button
              type="submit"
              className="checkout-primary-btn"
              disabled={isPlacingOrder || cart.length === 0}
            >
              {isPlacingOrder ? "PLACING ORDER..." : "PLACE ORDER"}
            </button>

            <p className="checkout-note">
              Your order will be confirmed once you place it.
            </p>

            <Link to="/" className="checkout-back-link">
              Continue Shopping
            </Link>
          </aside>
        </form>
      </div>
    </main>
  );
}

export default Checkout;
