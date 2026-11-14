
function StyleMarquee() {
  const messages = [
    "STYLE WITHOUT LIMITS",
    "DISCOVER YOUR SIGNATURE",
    "THE ART OF EVERYDAY STYLE",
    "QELVORA — BE DISTINCTIVE",
  ];

  return (
    <section className="style-marquee">
      <div className="marquee-track">
        {[...messages, ...messages].map((message, index) => (
          <span key={index}>
            {message} <i>✳</i>
          </span>
        ))}
      </div>
    </section>
  );
}

export default StyleMarquee;
