import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer" data-navbar-theme="dark">
      <div className="footer-top">
        <div className="footer-brand">
          <h3>
            QELVORA<span>.</span>
          </h3>
          <p>Considered style, timeless pieces and modern expression.</p>
        </div>

        <div className="footer-column">
          <h4>SHOP</h4>
          <Link to="/category/clothing">Clothing</Link>
          <Link to="/category/bags">Bags</Link>
          <Link to="/category/footwear">Footwear</Link>
          <Link to="/category/watches">Watches</Link>
        </div>

        <div className="footer-column">
          <h4>HELP</h4>
          <Link to="/orders">My Orders</Link>
          <a href="mailto:support@qelvora.com">Contact Us</a>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 QELVORA. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
