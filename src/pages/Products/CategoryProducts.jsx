
import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { fetchProducts } from "../../redux/slices/productsSlice";
import { useShop } from "../../assets/context/useShop";

import "./CategoryProducts.css";

function CategoryProducts() {
  const { categoryName = "" } = useParams();
  const dispatch = useDispatch();

  const products = useSelector((state) => state.products.items);
  const status = useSelector((state) => state.products.status);
  const error = useSelector((state) => state.products.error);

  const [sortBy, setSortBy] = useState("-created_at");

  const { wishlist, toggleWishlist } = useShop();

  // Fetch products and store them in Redux
  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // Filter and sort products using Redux data
  const filteredProducts = useMemo(() => {
    const filtered = products.filter(
      (product) =>
        product.category?.name?.toLowerCase() ===
        categoryName.toLowerCase()
    );

    const sorted = [...filtered];

    switch (sortBy) {
      case "price":
        sorted.sort(
          (a, b) => Number(a.price) - Number(b.price)
        );
        break;

      case "-price":
        sorted.sort(
          (a, b) => Number(b.price) - Number(a.price)
        );
        break;

      case "name":
        sorted.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        break;

      default:
        sorted.sort(
          (a, b) =>
            new Date(b.created_at) - new Date(a.created_at)
        );
    }

    return sorted;
  }, [products, categoryName, sortBy]);

  const loading = status === "loading";

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
        <span>{filteredProducts.length} Products</span>

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

      {status === "failed" && (
        <p className="products-message">
          {error || "Unable to load products. Please try again."}
        </p>
      )}

      {!loading && status === "succeeded" && filteredProducts.length === 0 && (
        <p className="products-message">
          No products found in this collection.
        </p>
      )}

      {!loading && status === "succeeded" && filteredProducts.length > 0 && (
        <div className="products-grid">
          {filteredProducts.map((product) => {
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
                    {product.category?.name || "QELVORA COLLECTION"}
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
