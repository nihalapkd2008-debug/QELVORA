import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useShop } from "../../assets/context/useShop";
import "./Navbar.css";

function getProductList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function Navbar() {
  const [isOnLight, setIsOnLight] = useState(false);
  const [activePanel, setActivePanel] = useState("");
  const [searchText, setSearchText] = useState("");
  const [products, setProducts] = useState([]);
  const [searchError, setSearchError] = useState("");

  const [isLoggedIn, setIsLoggedIn] = useState(
    () => Boolean(localStorage.getItem("access_token"))
  );

  const navRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const {
    wishlist,
    cart,
    cartCount,
    cartTotal,
    toggleWishlist,
    addToCart,
    updateQuantity,
    removeFromCart,
  } = useShop();

 

  // Change the navbar text colour (white / dark) depending on
  // which section is behind the navbar while scrolling.
  useEffect(() => {
    const updateNavbarTheme = () => {
      if (!navRef.current) return;

      // A line through the middle of the navbar
      const line = navRef.current.getBoundingClientRect().top + 38;

      const sections = document.querySelectorAll("[data-navbar-theme]");

      sections.forEach((section) => {
        const box = section.getBoundingClientRect();

        if (box.top <= line && box.bottom >= line) {
          setIsOnLight(section.dataset.navbarTheme === "light");
        }
      });
    };

    updateNavbarTheme();

    window.addEventListener("scroll", updateNavbarTheme);
    window.addEventListener("resize", updateNavbarTheme);

    return () => {
      window.removeEventListener("scroll", updateNavbarTheme);
      window.removeEventListener("resize", updateNavbarTheme);
    };
  }, [location.pathname]);

  // Fetch products for search.
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setSearchError("");

        const response = await api.get("products/");
        setProducts(getProductList(response.data));
      } catch (error) {
        console.error("Search products error:", error);
        setSearchError("Unable to load products. Please try again.");
      }
    };

    fetchProducts();
  }, []);

  // Lock background scrolling while panel is open.
  useEffect(() => {
    document.body.style.overflow = activePanel ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [activePanel]);

  const isHomePage = location.pathname === "/";

  const filteredProducts = products.filter((product) => {
    const search = searchText.trim().toLowerCase();

    if (!search) return false;

    return (
      product.name?.toLowerCase().includes(search) ||
      product.category?.name?.toLowerCase().includes(search)
    );
  });

  const closePanel = () => {
    setActivePanel("");
    setSearchText("");
  };

  // Logout function.
  const handleLogout = () => {
    // Remove the saved tokens so the user is really logged out.
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    window.dispatchEvent(new Event("auth-changed"));

    setIsLoggedIn(false);
    closePanel();

    navigate("/", { replace: true });
  };

  const formatPrice = (price) =>
    `₹${Number(price || 0).toLocaleString("en-IN")}`;

  const renderProductImage = (product) =>
    product.image ? (
      <img src={product.image} alt={product.name} />
    ) : (
      <div className="shop-panel-placeholder">Q</div>
    );

  const renderProductCard = (product, showRemove = false) => (
    <article className="shop-panel-product" key={product.id}>
      {renderProductImage(product)}

      <div className="shop-panel-product-info">
        <p>{product.category?.name || "Collection"}</p>
        <h3>{product.name}</h3>
        <strong>{formatPrice(product.price)}</strong>

        <div className="shop-product-actions">
          <button onClick={() => addToCart(product)}>
            ADD TO BAG
          </button>

          {showRemove && (
            <button onClick={() => toggleWishlist(product)}>
              REMOVE
            </button>
          )}

          {!showRemove && (
            <button
              onClick={() => toggleWishlist(product)}
              aria-label="Toggle wishlist"
            >
              {wishlist.some((item) => item.id === product.id)
                ? "♥"
                : "♡"}
            </button>
          )}
        </div>
      </div>
    </article>
  );

  return (
    <>
      <header
        ref={navRef}
        className={`navbar ${isOnLight ? "light-theme" : "dark-theme"}`}
      >
        <a href="/" className="brand-logo">
          QELVORA<span>.</span>
        </a>

        <nav className="nav-links">
          <a href={isHomePage ? "#collections" : "/#collections"}>
            Collections
          </a>

          <a href={isHomePage ? "#new-arrivals" : "/#new-arrivals"}>
            New Arrivals
          </a>

          <a href={isHomePage ? "#our-story" : "/#our-story"}>
            Our Story
          </a>
        </nav>

        <div className="nav-actions">
          {/* Login / Logout */}
          {isLoggedIn ? (
            <button
              type="button"
              className="nav-auth-link"
              onClick={handleLogout}
            >
              LOGOUT
            </button>
          ) : (
            <Link to="/login" className="nav-auth-link">
              LOGIN
            </Link>
          )}

          {/* Search */}
          <button
            type="button"
            className="nav-icon-button"
            aria-label="Search products"
            onClick={() => setActivePanel("search")}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="10.8" cy="10.8" r="6.5" />
              <path d="m16 16 4.5 4.5" />
            </svg>
          </button>

          {/* Wishlist */}
          <button
            type="button"
            className="nav-icon-button"
            aria-label="Wishlist"
            onClick={() => setActivePanel("wishlist")}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20.5 8.8c0 4.1-8.5 10-8.5 10s-8.5-5.9-8.5-10a4.5 4.5 0 0 1 8.5-2.1 4.5 4.5 0 0 1 8.5 2.1Z" />
            </svg>

            {wishlist.length > 0 && (
              <span className="nav-count">{wishlist.length}</span>
            )}
          </button>

          {/* Shopping Bag */}
          <button
            type="button"
            className="nav-bag-button"
            aria-label="Shopping bag"
            onClick={() => setActivePanel("cart")}
          >
            Bag ({cartCount})
          </button>
        </div>
      </header>

      {/* Search / Wishlist / Cart panel */}
      {activePanel && (
        <div className="shop-panel-backdrop" onClick={closePanel}>
          <section
            className="shop-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="shop-panel-heading">
              <div>
                <p>QELVORA</p>

                <h2>
                  {activePanel === "search" && "Search"}
                  {activePanel === "wishlist" && "Your Wishlist"}
                  {activePanel === "cart" && "Your Shopping Bag"}
                  <span>.</span>
                </h2>
              </div>

              <button
                type="button"
                className="shop-panel-close"
                onClick={closePanel}
                aria-label="Close panel"
              >
                ×
              </button>
            </div>

            {/* Search */}
            {activePanel === "search" && (
              <div className="shop-search-content">
                <input
                  type="search"
                  placeholder="Search clothing, bags, watches..."
                  value={searchText}
                  onChange={(event) =>
                    setSearchText(event.target.value)
                  }
                  autoFocus
                />

                {searchError && (
                  <p className="shop-empty-message">{searchError}</p>
                )}

                {!searchText.trim() && !searchError && (
                  <p className="shop-empty-message">
                    Search for your favourite pieces.
                  </p>
                )}

                {searchText.trim() && filteredProducts.length === 0 && (
                  <p className="shop-empty-message">
                    No matching products found.
                  </p>
                )}

                <div className="shop-panel-products">
                  {filteredProducts.map((product) =>
                    renderProductCard(product)
                  )}
                </div>
              </div>
            )}

            {/* Wishlist */}
            {activePanel === "wishlist" && (
              <div className="shop-panel-products">
                {wishlist.length === 0 ? (
                  <p className="shop-empty-message">
                    Your wishlist is empty. Save pieces you love!
                  </p>
                ) : (
                  wishlist.map((product) =>
                    renderProductCard(product, true)
                  )
                )}
              </div>
            )}

            {/* Shopping Cart */}
            {activePanel === "cart" && (
              <div className="shop-cart-content">
                {cart.length === 0 ? (
                  <p className="shop-empty-message">
                    Your shopping bag is empty. Discover something you love!
                  </p>
                ) : (
                  <>
                    <div className="shop-panel-products">
                      {cart.map((product) => (
                        <article
                          className="shop-panel-product"
                          key={product.id}
                        >
                          {renderProductImage(product)}

                          <div className="shop-panel-product-info">
                            <p>
                              {product.category?.name || "Collection"}
                            </p>

                            <h3>{product.name}</h3>

                            <strong>{formatPrice(product.price)}</strong>

                            <div className="shop-quantity">
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(product.id, -1)
                                }
                                aria-label="Decrease quantity"
                              >
                                −
                              </button>

                              <span>{product.quantity}</span>

                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(product.id, 1)
                                }
                                aria-label="Increase quantity"
                              >
                                +
                              </button>

                              <button
                                type="button"
                                className="shop-remove"
                                onClick={() =>
                                  removeFromCart(product.id)
                                }
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>

                    <div className="shop-cart-total">
                      <div>
                        <span>Subtotal</span>
                        <strong>{formatPrice(cartTotal)}</strong>
                      </div>

                      <p>
                        Shipping and any applicable charges are calculated
                        at checkout.
                      </p>

                      <button
  type="button"
  onClick={() => {
    closePanel();
    navigate("/checkout");
  }}
>
  PROCEED TO CHECKOUT
</button>
                    </div>
                  </>
                )}
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}

export default Navbar;
