import { useState, useEffect } from "react";

const NAV_LINKS = ["Home", "Shop", "New Arrivals", "Men", "Women", "Contact"];
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`navbar${scrolled ? " scrolled" : ""}`}>
      <a href="/" className="brand">
        MAISON ORE
      </a>

      <div className="nav-links">
        {NAV_LINKS.map((link) => (
          <a
            key={link}
            href={link === "Home" ? "/" : link === "Shop" ? "/shop" : "#"}
            className="nav-link">
            {link}
          </a>
        ))}
      </div>

      <a href="/signin" className="btn-outline nav-signin nav-signin-link">
        Sign In
      </a>
    </nav>
  );
}
