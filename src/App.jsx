
import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import HomePage from "./pages/Home/HomePage.jsx";
import CategoryProducts from "./pages/Products/CategoryProducts.jsx";
import ProductDetails from "./pages/Products/ProductDetails.jsx";

import AdminDashboard from "./pages/Admin/AdminDashboard.jsx";
import AdminProducts from "./pages/Admin/AdminProducts.jsx";
import VendorDashboard from "./pages/Vendor/VendorDashboard.jsx";

import Login from "./pages/Auth/Login.jsx";
import Register from "./pages/Auth/Register.jsx";
import Checkout from "./pages/Checkout/Checkout.jsx";
import MyOrders from "./pages/Orders/MyOrders.jsx";

import { ShopProvider } from "./assets/context/ShopContext.jsx";
import ScrollToTop from "./layouts/ScrollToTop.jsx";

function App() {
  const location = useLocation();

  const isAuthPage = ["/login", "/register"].includes(
    location.pathname
  );

  return (
    <ShopProvider>
      <ScrollToTop />

      {!isAuthPage && <Navbar />}

      <Routes>
        {/* Public authentication pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* All authenticated users */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomePage />} />

          <Route
            path="/category/:categoryName"
            element={<CategoryProducts />}
          />

          <Route
            path="/product/:productId"
            element={<ProductDetails />}
          />
        </Route>

        {/* Admin only */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
        </Route>

        {/* Approved Vendor only */}
        <Route element={<ProtectedRoute allowedRoles={["vendor"]} />}>
          <Route path="/vendor" element={<VendorDashboard />} />
        </Route>

        {/* Customer only */}
        <Route element={<ProtectedRoute allowedRoles={["customer"]} />}>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<MyOrders />} />
        </Route>
      </Routes>

      {!isAuthPage && <Footer />}
    </ShopProvider>
  );
}

export default App;
