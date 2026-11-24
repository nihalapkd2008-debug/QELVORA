
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import ShopContext from "./ShopContext.js";
import api from "../../services/api";

function getLocalCart() {
  try {
    return JSON.parse(localStorage.getItem("qelvora-cart")) || [];
  } catch {
    return [];
  }
}

function formatCartItems(items = []) {
  return items.map((item) => ({
    ...item.product,
    quantity: item.quantity,
    cartItemId: item.id,
  }));
}

export function ShopProvider({ children }) {
  const [wishlist, setWishlist] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("qelvora-wishlist")) || []
      );
    } catch {
      return [];
    }
  });

  const [cart, setCart] = useState(getLocalCart);
  const [isCartLoading, setIsCartLoading] = useState(false);

  // Prevent duplicate cart loading requests
  const cartLoadPromiseRef = useRef(null);

  const isLoggedIn = () =>
    Boolean(localStorage.getItem("access_token"));

  // Save wishlist
  useEffect(() => {
    localStorage.setItem(
      "qelvora-wishlist",
      JSON.stringify(wishlist)
    );
  }, [wishlist]);

  // Save guest cart locally
  useEffect(() => {
    if (!isLoggedIn()) {
      localStorage.setItem(
        "qelvora-cart",
        JSON.stringify(cart)
      );
    }
  }, [cart]);

  // Load and synchronize backend cart
  const loadBackendCart = useCallback(async () => {
    if (!isLoggedIn()) return;

    // Avoid duplicate simultaneous requests
    if (cartLoadPromiseRef.current) {
      return cartLoadPromiseRef.current;
    }

    setIsCartLoading(true);

    const loadPromise = (async () => {
      let response = await api.get("cart/");
      let backendItems = response.data.items || [];

      const localItems = getLocalCart();

      // Merge guest cart into backend cart
      if (localItems.length > 0) {
        for (const localItem of localItems) {
          const existing = backendItems.find(
            (item) => item.product.id === localItem.id
          );

          if (existing) {
            await api.patch(`cart/items/${existing.id}/`, {
              quantity: existing.quantity + localItem.quantity,
            });
          } else {
            await api.post("cart/", {
              product_id: localItem.id,
              quantity: localItem.quantity,
            });
          }
        }

        // Fetch updated cart after merging
        response = await api.get("cart/");
        backendItems = response.data.items || [];

        localStorage.removeItem("qelvora-cart");
      }

      setCart(formatCartItems(backendItems));
    })();

    cartLoadPromiseRef.current = loadPromise;

    try {
      await loadPromise;
    } catch (error) {
      console.error("Cart loading error:", error);
    } finally {
      cartLoadPromiseRef.current = null;
      setIsCartLoading(false);
    }
  }, []);

  // Load cart when authentication changes
  useEffect(() => {
    const handleAuthChange = () => {
      if (isLoggedIn()) {
        loadBackendCart();
      } else {
        setCart(getLocalCart());
      }
    };

    handleAuthChange();

    window.addEventListener("auth-changed", handleAuthChange);

    return () => {
      window.removeEventListener("auth-changed", handleAuthChange);
    };
  }, [loadBackendCart]);

  // Wishlist
  const toggleWishlist = (product) => {
    setWishlist((current) =>
      current.some((item) => item.id === product.id)
        ? current.filter((item) => item.id !== product.id)
        : [...current, product]
    );
  };

  // Add product to cart
  const addToCart = async (product) => {
    if (!isLoggedIn()) {
      setCart((current) => {
        const existing = current.find(
          (item) => item.id === product.id
        );

        if (existing) {
          return current.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }

        return [...current, { ...product, quantity: 1 }];
      });

      return;
    }

    try {
      await api.post("cart/", {
        product_id: product.id,
        quantity: 1,
      });

      await loadBackendCart();
    } catch (error) {
      console.error("Add to cart error:", error);

      alert(
        error.response?.data?.error ||
        "Unable to add product to bag."
      );

      throw error;
    }
  };

  // Update quantity
  const updateQuantity = async (productId, change) => {
    const item = cart.find(
      (product) => product.id === productId
    );

    if (!item) return;

    // Do not allow quantity below 1
    // No API request when quantity is already 1
    if (change < 0 && item.quantity <= 1) {
      return;
    }

    const newQuantity = Math.max(
      1,
      item.quantity + change
    );

    // Guest cart
    if (!isLoggedIn()) {
      setCart((current) =>
        current.map((product) =>
          product.id === productId
            ? { ...product, quantity: newQuantity }
            : product
        )
      );

      return;
    }

    if (!item.cartItemId) {
      await loadBackendCart();
      return;
    }

    try {
      await api.patch(`cart/items/${item.cartItemId}/`, {
        quantity: newQuantity,
      });

      await loadBackendCart();
    } catch (error) {
      console.error("Quantity update error:", error);

      if (error.response?.status === 404) {
        await loadBackendCart();
        alert("Cart refreshed. Please try again.");
        return;
      }

      alert(
        error.response?.data?.error ||
        "Unable to update quantity."
      );
    }
  };

  // Remove product
  const removeFromCart = async (productId) => {
    if (!isLoggedIn()) {
      setCart((current) =>
        current.filter((item) => item.id !== productId)
      );

      return;
    }

    const item = cart.find(
      (product) => product.id === productId
    );

    if (!item?.cartItemId) {
      await loadBackendCart();
      return;
    }

    try {
      await api.delete(`cart/items/${item.cartItemId}/`);

      await loadBackendCart();
    } catch (error) {
      console.error("Remove cart item error:", error);

      if (error.response?.status === 404) {
        await loadBackendCart();
        alert("Cart refreshed. Please try removing the item again.");
        return;
      }

      alert(
        error.response?.data?.error ||
        "Unable to remove product."
      );
    }
  };

  // Place order
  const placeOrder = async () => {
    if (!isLoggedIn()) {
      throw new Error("Please login to place your order.");
    }

    if (cart.length === 0) {
      throw new Error("Your cart is empty.");
    }

    try {
      const response = await api.post("orders/");

      // Clear cart after successful order
      setCart([]);
      localStorage.removeItem("qelvora-cart");

      return response.data.order;
    } catch (error) {
      console.error("Place order error:", error);

      throw new Error(
        error.response?.data?.error ||
        "Unable to place your order. Please try again.",
        { cause: error }
      );
    }
  };

  // Cart quantity
  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // Cart total
  const cartTotal = cart.reduce(
    (total, item) =>
      total + Number(item.price || 0) * item.quantity,
    0
  );

  return (
    <ShopContext.Provider
      value={{
        wishlist,
        cart,
        cartCount,
        cartTotal,
        isCartLoading,
        toggleWishlist,
        addToCart,
        updateQuantity,
        removeFromCart,
        placeOrder,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}
