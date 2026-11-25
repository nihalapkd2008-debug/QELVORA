
const featuredItems = [
  {
    name: "Statement Bags",
    label: "THE NEW ESSENTIAL",
    image:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=700&q=85",
  },
  {
    name: "Modern Footwear",
    label: "MADE TO MOVE",
    image:
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=700&q=85",
  },
  {
    name: "Fine Details",
    label: "THE FINAL TOUCH",
    image:
      "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=700&q=85",
  },
];

function OffersSection() {
  return (
    <section className="offers-section" id="offers">
      <div className="offer-banner">
        <div className="offer-copy">
          <p className="offer-eyebrow">
            THE QELVORA PRIVILEGE
          </p>

          <h2>
            A little more
            <br />
            extraordinary<span>.</span>
          </h2>

          <p className="offer-description">
            Discover the pieces making a statement
            this season. Curated for your individuality.
          </p>

          <a href="#collections" className="offer-button">
            EXPLORE THE EDIT <span>↗</span>
          </a>
        </div>

        <div className="offer-visuals">
          {featuredItems.map((item) => (
            <div className="offer-item" key={item.name}>
              <div className="offer-image">
                <img src={item.image} alt={item.name} />
              </div>

              <p>{item.label}</p>
              <h3>{item.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default OffersSection;
