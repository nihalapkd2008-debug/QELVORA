
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetchProducts } from "../redux/slices/productsSlice";
import { useShop } from "../assets/context/useShop";

const featuredProductIds = [1, 15, 2, 26, 3, 4, 44, 51];

function NewArrivals() {
  const dispatch = useDispatch();

  const products = useSelector((state) => state.products.items);
  const status = useSelector((state) => state.products.status);
  const error = useSelector((state) => state.products.error);

  const { wishlist, toggleWishlist } = useShop();

  // Fetch products only if Redux store is empty
  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchProducts());
    }
  }, [dispatch, status]);

  // Select featured products from Redux store
  const selectedProducts = useMemo(() => {
    return featuredProductIds
      .map((id) =>
        products.find((product) => product.id === id)
      )
      .filter(Boolean);
  }, [products]);

  const loading = status === "idle" || status === "loading";

  const formatPrice = (price) =>
    `₹${Number(price || 0).toLocaleString("en-IN")}`;

  return (
    <section
      className="new-arrivals"
      id="new-arrivals"
      data-navbar-theme="light"
    >
      <div className="arrivals-heading">
        <div>
          <p className="arrival-eyebrow">FRESH FROM QELVORA</p>

          <h2>
            New Arrivals<span>.</span>
          </h2>

          <p>
            Discover the latest pieces selected for your style.
          </p>
        </div>

        <a href="#collections" className="view-all-link">
          EXPLORE COLLECTIONS ↗
        </a>
      </div>

      {loading && (
        <p className="arrival-message">
          Discovering new arrivals...
        </p>
      )}

      {status === "failed" && (
        <p className="arrival-message">
          {error ||
            "Products could not be loaded. Please try again."}
        </p>
      )}

      {status === "succeeded" && selectedProducts.length === 0 && (
        <p className="arrival-message">
          No products available right now.
        </p>
      )}

      {status === "succeeded" && selectedProducts.length > 0 && (
        <div className="arrival-track-wrapper">
          <div className="arrival-track">
            {[...selectedProducts, ...selectedProducts].map(
              (product, index) => {
                const isWishlisted = wishlist.some(
                  (item) => item.id === product.id
                );

                return (
                  <article
                    className="arrival-card"
                    key={`${product.id}-${index}`}
                  >
                    <div className="arrival-image">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name || "QELVORA product"}
                          loading="lazy"
                        />
                      ) : (
                        <div className="arrival-image-placeholder">
                          Image coming soon
                        </div>
                      )}

                      <button
                        type="button"
                        className="product-wishlist-button"
                        aria-label={
                          isWishlisted
                            ? "Remove from wishlist"
                            : "Add to wishlist"
                        }
                        aria-pressed={isWishlisted}
                        onClick={() => toggleWishlist(product)}
                      >
                        {isWishlisted ? "♥" : "♡"}
                      </button>

                      <span className="arrival-tag">JUST IN</span>
                    </div>

                    <div className="arrival-details">
                      <p>
                        {product.category?.name ||
                          "QELVORA COLLECTION"}
                      </p>

                      <h3>{product.name}</h3>

                      <span>{formatPrice(product.price)}</span>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default NewArrivals;
