
import { useEffect, useState } from "react";
import api from "../services/api";
import { useShop } from "../assets/context/useShop";

const featuredProductIds = [1, 15, 2, 26, 3, 4, 44, 51];

function getProductList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function NewArrivals() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { wishlist, toggleWishlist } = useShop();

  useEffect(() => {
    let isActive = true;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("products/");
        const productList = getProductList(response.data);

        const selectedProducts = featuredProductIds
          .map((id) =>
            productList.find((product) => product.id === id)
          )
          .filter(Boolean);

        if (isActive) {
          setProducts(selectedProducts);
        }
      } catch (err) {
        console.error("New Arrivals API Error:", err);

        if (isActive) {
          setError(
            "Products could not be loaded. Check that the Django server is running."
          );
        }
      } finally {
        if (isActive) setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      isActive = false;
    };
  }, []);

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

          <p>Discover the latest pieces selected for your style.</p>
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

      {error && (
        <p className="arrival-message">{error}</p>
      )}

      {!loading && !error && products.length === 0 && (
        <p className="arrival-message">
          No products available right now.
        </p>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="arrival-track-wrapper">
          <div className="arrival-track">
            {[...products, ...products].map((product, index) => {
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
            })}
          </div>
        </div>
      )}
    </section>
  );
}

export default NewArrivals;
