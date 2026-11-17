
function BrandStory() {
  return (
    <section className="brand-story" id="our-story" data-navbar-theme="light">
      <div className="story-image">
        <img
             src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1100&q=85"          alt="QELVORA fashion editorial"
        />
        <span className="story-image-label">THE QELVORA WORLD</span>
      </div>

      <div className="story-content">
        <p className="story-eyebrow">MORE THAN JUST FASHION</p>

        <h2>
          Style is personal.
          <br />
          Make it <span>yours.</span>
        </h2>

        <div className="story-line"></div>

        <p className="story-description">
          We believe the smallest details can make the biggest
          statement. Explore a considered collection of clothing,
          accessories and timeless essentials that let your
          individuality take the lead.
        </p>

        <a href="#collections" className="story-link">
          DISCOVER QELVORA <span>↗</span>
        </a>
      </div>
    </section>
  );
}

export default BrandStory;
