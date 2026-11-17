
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import { useShop } from "../assets/context/useShop";
import "./CategoryProducts.css";

function getProductList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function CategoryProducts() {
  const { categoryName = "" } = useParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("-created_at");

  const { wishlist, toggleWishlist } = useShop();

  useEffect(() => {
    let isActive = true;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `products/?ordering=${sortBy}`
        );

        const allProducts = getProductList(response.data);

        const filteredProducts = allProducts.filter(
          (product) =>
            product.category?.name?.toLowerCase() ===
            categoryName.toLowerCase()
        );

        if (isActive) {
          setProducts(filteredProducts);
        }
      } catch (err) {
        console.error("Category products API Error:", err);

        if (isActive) {
          setError("Unable to load products. Please try again.");
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      isActive = false;
    };
  }, [categoryName, sortBy]);

  const pageTitle = categoryName
    ? categoryName.charAt(0).toUpperCase() + categoryName.slice(1)
    : "Collection";

  const formatPrice = (price) =>
    `₹${Number(price || 0).toLocaleString("en-IN")}`;

  return (
    <main
      className="category-products-page"
      data-navbar-theme="light"
    >
      <div className="products-page-heading">
        <p className="section-eyebrow">
          THE QELVORA COLLECTION
        </p>

        <h1>
          {pageTitle}<span>.</span>
        </h1>

        <p>
          Discover pieces selected for your signature style.
        </p>
      </div>

      <div className="products-result-info">
        <span>{products.length} Products</span>

        <div className="products-sort">
          <label htmlFor="product-sort">SORT BY</label>

          <select
            id="product-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="-created_at">Newest First</option>
            <option value="price">Price: Low to High</option>
            <option value="-price">Price: High to Low</option>
            <option value="name">Name: A to Z</option>
          </select>
        </div>

        <span>CURATED BY QELVORA</span>
      </div>

      {loading && (
        <p className="products-message">
          Loading collection...
        </p>
      )}

      {error && (
        <p className="products-message">{error}</p>
      )}

      {!loading && !error && products.length === 0 && (
        <p className="products-message">
          No products found in this collection.
        </p>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="products-grid">
          {products.map((product) => {
            const isWishlisted = wishlist.some(
              (item) => item.id === product.id
            );

            return (
              <article
                className="shop-product-card"
                key={product.id}
              >
                <div className="shop-product-image">
                  <Link
                    to={`/product/${product.id}`}
                    className="product-image-link"
                    aria-label={`View ${product.name}`}
                  >
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name || "QELVORA product"}
                        loading="lazy"
                      />
                    ) : (
                      <div className="product-image-placeholder">
                        Image coming soon
                      </div>
                    )}
                  </Link>

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
                </div>

                <div className="shop-product-details">
                  <p>
                    {product.category?.name ||
                      "QELVORA COLLECTION"}
                  </p>

                  <Link
                    to={`/product/${product.id}`}
                    className="product-title-link"
                  >
                    <h3>{product.name}</h3>
                  </Link>

                  <span>{formatPrice(product.price)}</span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}

export default CategoryProducts;
