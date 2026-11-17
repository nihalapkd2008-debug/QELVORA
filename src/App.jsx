
import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import AnnouncementBar from "./components/AnnouncementBar";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import CategorySection from "./components/CategorySection";
import NewArrivals from "./components/NewArrivals";
import BrandStory from "./components/BrandStory";
import BenefitsSection from "./components/BenefitsSection";
import StyleMarquee from "./components/StyleMarquee";
import CategoryProducts from "./components/CategoryProducts";
import MyOrders from "./pages/MyOrders";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProductDetails from "./pages/ProductDetails";
import ProtectedRoute from "./components/ProtectedRoute";
import Checkout from "./pages/Checkout";
import Footer from "./components/Footer";
import { ShopProvider } from "./assets/context/ShopContext.jsx";

function HomePage() {
  return (
    <>
      <AnnouncementBar />
      <Hero />
      <CategorySection />
      <NewArrivals />
      <BrandStory />
      <BenefitsSection />
      <StyleMarquee />
    </>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

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
        <Route path="/" element={<HomePage />} />

        <Route
          path="/category/:categoryName"
          element={<CategoryProducts />}
        />

        <Route
          path="/product/:productId"
          element={<ProductDetails />}
        />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<MyOrders />} />
        </Route>
      </Routes>

      {!isAuthPage && <Footer />}
    </ShopProvider>
  );
}

export default App;
