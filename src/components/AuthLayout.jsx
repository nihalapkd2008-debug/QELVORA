import { Link } from "react-router-dom";
import "./AuthLayout.css";

// Photos of all 6 collections (same as the Collections section on the home page)
const backgroundImages = [
  {
    name: "Clothing",
    src: "https://i.pinimg.com/736x/8c/7e/90/8c7e90ecec78a64d3b1a64205f7f18ea.jpg",
  },
  {
    name: "Bags",
    src: "https://i.pinimg.com/1200x/80/1c/b9/801cb94965fd23ae9a4fd509c2e67590.jpg",
  },
  {
    name: "Footwear",
    src: "https://i.pinimg.com/736x/b5/b7/cd/b5b7cd822082ad69cb77db5738367450.jpg",
  },
  {
    name: "Watches",
    src: "https://i.pinimg.com/736x/85/71/a0/8571a0a06aaa5093744b558ac4d489dd.jpg",
  },
  {
    name: "Jewelry",
    src: "https://i.pinimg.com/1200x/e5/f0/9e/e5f09e389b0b6fc657612528e9079337.jpg",
  },
  {
    name: "Accessories",
    src: "https://i.pinimg.com/736x/c5/5e/09/c55e09f299809198b9ba5dd6b44d7137.jpg",
  },
];

// The common page design for Login and Register.
// Put the form inside it as "children".
function AuthLayout({
  eyebrow,
  title,
  description,
  sideEyebrow,
  sideTitle,
  sideText,
  bottomText,
  bottomLink,
  bottomLinkText,
  children,
}) {
  return (
    <main className="auth-page">
      {/* Background photos */}
      <div className="auth-background">
        {backgroundImages.map((image) => (
          <img key={image.name} src={image.src} alt="" />
        ))}
      </div>
      <div className="auth-overlay"></div>

      {/* Left side */}
      <section className="auth-brand-side">
        <Link to="/" className="auth-brand">
          QELVORA<span>.</span>
        </Link>

        <div className="auth-side-content">
          <span className="auth-side-eyebrow">{sideEyebrow}</span>
          <h1>{sideTitle}</h1>
          <p>{sideText}</p>
        </div>

        <ul className="auth-categories">
          {backgroundImages.map((image) => (
            <li key={image.name}>{image.name}</li>
          ))}
        </ul>
      </section>

      {/* Right side (glass panel with the form) */}
      <section className="auth-panel-wrap">
        <div className="auth-panel">
          <Link to="/" className="auth-panel-brand">
            QELVORA<span>.</span>
          </Link>

          <span className="auth-eyebrow">{eyebrow}</span>
          <h2>{title}</h2>
          <p className="auth-description">{description}</p>

          {children}

          <p className="auth-switch">
            {bottomText} <Link to={bottomLink}>{bottomLinkText}</Link>
          </p>

          <Link to="/" className="auth-back-link">
            ← Back to shopping
          </Link>
        </div>
      </section>
    </main>
  );
}

export default AuthLayout;
