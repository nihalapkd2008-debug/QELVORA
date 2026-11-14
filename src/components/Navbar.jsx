
import { useEffect, useState } from "react";

function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <a href="/" className="brand-logo">
        QELVORA<span>.</span>
      </a>

      <nav className="nav-links">
        <a href="#home">Home</a>
        <a href="#collections">Collections</a>
        <a href="#new-arrivals">New Arrivals</a>
        <a href="#about">Our Story</a>
      </nav>

      <div className="nav-actions">
        <button aria-label="Search">⌕</button>
        <button aria-label="Wishlist">♡</button>
        <button aria-label="Shopping bag">Bag (0)</button>
      </div>
    </header>
  );
}

export default Navbar;
