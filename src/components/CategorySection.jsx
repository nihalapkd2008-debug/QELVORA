
const categories = [
  {
    name: "Clothing",
    number: "01",
    description: "Wear your expression",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=85",
    className: "category-large",
  },
  {
    name: "Bags",
    number: "02",
    description: "Carry it beautifully",
    image:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=85",
    className: "",
  },
  {
    name: "Footwear",
    number: "03",
    description: "Every step matters",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=85",
    className: "",
  },
  {
    name: "Watches",
    number: "04",
    description: "Beyond the moment",
    image:
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=85",
    className: "",
  },
  {
    name: "Jewelry",
    number: "05",
    description: "Details that define",
    image:
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=800&q=85",
    className: "",
  },
  {
    name: "Accessories",
    number: "06",
    description: "The finishing touch",
    image:
      "https://images.unsplash.com/photo-1509319117193-57bab727e09d?auto=format&fit=crop&w=800&q=85",
    className: "",
  },
];

function CategorySection() {
  return (
    <section className="category-section" id="collections">
      <div className="category-heading">
        <div>
          <p className="section-eyebrow">CURATED FOR YOUR STYLE</p>
          <h2>Explore Our World<span>.</span></h2>
        </div>

        <p className="category-intro">
          Discover pieces that speak your language.
          Find your signature in every collection.
        </p>
      </div>

      <div className="category-grid">
        {categories.map((category) => (
          <div
            className={`category-card ${category.className}`}
            key={category.number}
          >
            <img src={category.image} alt={category.name} />

            <div className="category-overlay">
              <span className="category-number">
                {category.number}
              </span>

              <div className="category-info">
                <p>{category.description}</p>
                <h3>{category.name}</h3>
              </div>

              <span className="category-arrow">↗</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default CategorySection;
