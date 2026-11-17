
import { Link } from "react-router-dom";

const categories = [
  {
    name: "Clothing",
    number: "01",
    description: "Wear your expression",
    image:
      "https://i.pinimg.com/736x/8c/7e/90/8c7e90ecec78a64d3b1a64205f7f18ea.jpg",
    className: "category-large",
  },
  {
    name: "Bags",
    number: "02",
    description: "Carry it beautifully",
    image:
      "https://i.pinimg.com/1200x/80/1c/b9/801cb94965fd23ae9a4fd509c2e67590.jpg",
    className: "",
  },
  {
    name: "Footwear",
    number: "03",
    description: "Every step matters",
    image:
      "https://i.pinimg.com/736x/b5/b7/cd/b5b7cd822082ad69cb77db5738367450.jpg",
    className: "",
  },
  {
    name: "Watches",
    number: "04",
    description: "Beyond the moment",
    image:
      "https://i.pinimg.com/736x/85/71/a0/8571a0a06aaa5093744b558ac4d489dd.jpg",
    className: "",
  },
  {
    name: "Jewelry",
    number: "05",
    description: "Details that define",
    image:
      "https://i.pinimg.com/1200x/e5/f0/9e/e5f09e389b0b6fc657612528e9079337.jpg",
    className: "",
  },
  {
    name: "Accessories",
    number: "06",
    description: "The finishing touch",
    image:
      "https://i.pinimg.com/736x/c5/5e/09/c55e09f299809198b9ba5dd6b44d7137.jpg",
    className: "",
  },
];

function CategorySection() {
  return (
    <section
      className="category-section"
      id="collections"
      data-navbar-theme="light"
    >
      <div className="category-heading">
        <div>
          <p className="section-eyebrow">
            THE ART OF SELECTION — QELVORA
          </p>

          <h2>
            Explore Our <span>Collections.</span>
          </h2>
        </div>

        <p className="category-intro">
          Six distinct worlds. Endless ways to express yourself.
          Discover the pieces that define your signature style.
        </p>
      </div>

      <div className="category-grid">
        {categories.map((category) => (
          <Link
            to={`/category/${category.name.toLowerCase()}`}
            className={`category-card category-card-${category.name.toLowerCase()} ${category.className}`}
            key={category.number}
          >
            <img
              className="category-image"
              src={category.image}
              alt={`${category.name} collection`}
              loading="lazy"
            />

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
          </Link>
        ))}
      </div>
    </section>
  );
}

export default CategorySection;
