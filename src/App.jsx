
import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import HomePage from "./pages/Home/HomePage.jsx";
import CategoryProducts from "./pages/Products/CategoryProducts.jsx";
import ProductDetails from "./pages/Products/ProductDetails.jsx";

import AdminDashboard from "./pages/Admin/AdminDashboard.jsx";
import AdminProducts from "./pages/Admin/AdminProducts.jsx";
import AdminOrders from "./pages/Admin/AdminOrders.jsx";
import VendorDashboard from "./pages/Vendor/VendorDashboard.jsx";
import AdminHeader from "./pages/Admin/components/AdminHeader";
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

  const isAdminPage = location.pathname.startsWith("/admin");

  const showStoreLayout = !isAuthPage && !isAdminPage;

  return (
    <ShopProvider>
      <ScrollToTop />

      {showStoreLayout && <Navbar />}
      {isAdminPage && <AdminHeader />}
      <Routes>
        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Public Shopping */}
        <Route path="/" element={<HomePage />} />
        <Route
          path="/category/:categoryName"
          element={<CategoryProducts />}
        />
        <Route
          path="/product/:productId"
          element={<ProductDetails />}
        />

        {/* Admin */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
        </Route>

        {/* Vendor */}
        <Route element={<ProtectedRoute allowedRoles={["vendor"]} />}>
          <Route path="/vendor" element={<VendorDashboard />} />
        </Route>

        {/* Customer */}
        <Route path="/checkout" element={<Checkout />} />
        <Route element={<ProtectedRoute allowedRoles={["customer"]} />}>
          <Route path="/orders" element={<MyOrders />} />
        </Route>
        
      </Routes>

      {showStoreLayout && <Footer />}
    </ShopProvider>
  );
}

export default App;
