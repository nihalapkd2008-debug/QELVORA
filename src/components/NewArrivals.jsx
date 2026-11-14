
import { useEffect, useState } from "react";
import api from "../services/api";

const fallbackImages = [
  "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=85",
  "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=85",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=85",
  "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=600&q=85",
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=600&q=85",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=85",
  "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=85",
  "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=600&q=85",
];

function NewArrivals() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("products/")
      .then((response) => {
        const latestProducts = [...response.data]
          .sort(
            (a, b) =>
              new Date(b.created_at) - new Date(a.created_at)
          )
          .filter((product) => product.stock > 0)
          .slice(0, 8);

        setProducts(latestProducts);
      })
      .catch(() => {
        setError("Unable to load products. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p className="arrival-message">Discovering new arrivals...</p>;
  }

  if (error) {
    return <p className="arrival-message">{error}</p>;
  }

  if (products.length === 0) {
    return <p className="arrival-message">No products available right now.</p>;
  }

  return (
    <section className="new-arrivals" id="new-arrivals">
      <div className="arrivals-heading">
        <div>
          <p className="arrival-eyebrow">FRESH FROM QELVORA</p>
          <h2>New Arrivals<span>.</span></h2>
          <p>Discover the latest pieces selected for your style.</p>
        </div>

        <a href="#collections" className="view-all-link">
          EXPLORE COLLECTIONS ↗
        </a>
      </div>

      <div className="arrival-track-wrapper">
        <div className="arrival-track">
          {[...products, ...products].map((product, index) => {
            const originalIndex = index % products.length;

            return (
              <article
                className="arrival-card"
                key={`${product.id}-${index}`}
              >
                <div className="arrival-image">
                  <img
                    src={
                      product.image ||
                      fallbackImages[originalIndex % fallbackImages.length]
                    }
                    alt={product.name}
                  />
                  <span className="arrival-tag">JUST IN</span>
                </div>

                <div className="arrival-details">
                  <p>{product.category?.name}</p>
                  <h3>{product.name}</h3>
                  <span>₹{Number(product.price).toLocaleString("en-IN")}</span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default NewArrivals;
