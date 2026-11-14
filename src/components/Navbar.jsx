
function Navbar() {
  return (
    <header className="navbar">
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
