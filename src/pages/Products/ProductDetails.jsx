
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { fetchProducts } from "../../redux/slices/productsSlice";
import { useShop } from "../../assets/context/useShop";

import "./ProductDetails.css";

function ProductDetails() {
  const { productId } = useParams();
  const dispatch = useDispatch();

  const products = useSelector((state) => state.products.items);
  const status = useSelector((state) => state.products.status);
  const error = useSelector((state) => state.products.error);

  const [quantities, setQuantities] = useState({});
  const [added, setAdded] = useState(false);

  const { wishlist, toggleWishlist, addToCart } = useShop();

  // Fetch products if Redux store is empty
  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchProducts());
    }
  }, [dispatch, status]);

  // Find the selected product from Redux store
  const product = products.find(
    (item) => String(item.id) === productId
  );

  const quantity = quantities[productId] || 1;

  const updateQuantity = (newQuantity) => {
    setQuantities((current) => ({
      ...current,
      [productId]: newQuantity,
    }));
  };

  const loading = status === "idle" || status === "loading";

  const formatPrice = (price) =>
    `₹${Number(price || 0).toLocaleString("en-IN")}`;

  const isWishlisted = wishlist.some(
    (item) => item.id === product?.id
  );

  const handleAddToBag = async () => {
    if (!product || product.stock < 1) return;

    try {
      for (let i = 0; i < quantity; i += 1) {
        await addToCart(product);
      }

      setAdded(true);
      setTimeout(() => setAdded(false), 9000);
    } catch (err) {
      console.error("Add to Bag Error:", err);
    }
  };

  if (loading) {
    return (
      <main className="product-details-page" data-navbar-theme="light">
        <p className="product-details-message">
          Loading product...
        </p>
      </main>
    );
  }

  if (status === "failed" || !product) {
    return (
      <main className="product-details-page" data-navbar-theme="light">
        <p className="product-details-message">
          {status === "failed"
            ? error || "Unable to load this product."
            : "Product not found."}
        </p>

        <Link to="/" className="back-to-shop">
          BACK TO SHOP
        </Link>
      </main>
    );
  }

  return (
    <main
      className="product-details-page"
      data-navbar-theme="light"
    >
      <div className="product-details-breadcrumb">
        <Link to="/">HOME</Link>
        <span>/</span>

        <Link
          to={`/category/${encodeURIComponent(
            product.category?.name || ""
          )}`}
        >
          {product.category?.name || "COLLECTION"}
        </Link>

        <span>/</span>
        <span>{product.name}</span>
      </div>

      <section className="product-details-layout">
        <div className="product-details-image">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
            />
          ) : (
            <div className="product-image-placeholder">
              IMAGE COMING SOON
            </div>
          )}
        </div>

        <div className="product-details-info">
          <p className="product-details-eyebrow">
            QELVORA COLLECTION
          </p>

          <h1>{product.name}</h1>

          <p className="product-details-price">
            {formatPrice(product.price)}
          </p>

          <div className="product-details-divider" />

          <p className="product-details-description">
            {product.description ||
              "Discover this piece from the QELVORA collection."}
          </p>

          <p className="product-stock-status">
            {product.stock > 0
              ? "IN STOCK"
              : "CURRENTLY UNAVAILABLE"}
          </p>

          {product.stock > 0 && (
            <>
              <div className="product-quantity">
                <span>QUANTITY</span>

                <div className="quantity-control">
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(Math.max(1, quantity - 1))
                    }
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>

                  <span>{quantity}</span>

                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(
                        Math.min(product.stock, quantity + 1)
                      )
                    }
                    disabled={quantity >= product.stock}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                type="button"
                className={`product-add-button ${
                  added ? "product-added" : ""
                }`}
                onClick={handleAddToBag}
              >
                {added ? "ADDED TO BAG ✓" : "ADD TO BAG"}
              </button>
            </>
          )}

          <button
            type="button"
            className="product-details-wishlist"
            onClick={() => toggleWishlist(product)}
            aria-pressed={isWishlisted}
          >
            {isWishlisted
              ? "♥ REMOVE FROM WISHLIST"
              : "♡ ADD TO WISHLIST"}
          </button>

          <div className="product-details-divider" />

          <p className="product-details-note">
            Thoughtfully selected. Made to be part of your style.
          </p>
        </div>
      </section>
    </main>
  );
}

export default ProductDetails;
