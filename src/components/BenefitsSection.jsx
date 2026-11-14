
const benefits = [
  {
    icon: "✳",
    title: "Thoughtfully Curated",
    description: "A considered selection across every collection.",
  },
  {
    icon: "◇",
    title: "Six Style Categories",
    description: "Clothing, bags, footwear and more to explore.",
  },
  {
    icon: "✧",
    title: "Fresh Fashion Finds",
    description: "Discover distinctive pieces for your wardrobe.",
  },
  {
    icon: "◎",
    title: "Style Your Way",
    description: "Find pieces that reflect your individuality.",
  },
];

function BenefitsSection() {
  return (
    <section className="benefits-section">
      <div className="benefits-heading">
        <p>THE QELVORA DIFFERENCE</p>
        <h2>Considered in every detail.</h2>
      </div>

      <div className="benefits-grid">
        {benefits.map((benefit) => (
          <article className="benefit-item" key={benefit.title}>
            <span className="benefit-icon">{benefit.icon}</span>
            <h3>{benefit.title}</h3>
            <p>{benefit.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default BenefitsSection;
