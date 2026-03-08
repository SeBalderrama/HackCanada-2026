import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import ThriftOutPanel from "../components/ThriftOutPanel";
import "./shopPage.css";

const LETTER_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const TAG_OPTIONS = [
  "Tops", "Bottoms", "Dresses", "Outerwear", "Footwear",
  "Accessories", "Activewear", "Streetwear", "Vintage", "Formal",
];

export default function ShopPage() {
  const { user } = useAuth0();
  const userId = user?.sub ?? "";

  const [searchQuery, setSearchQuery] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [proximityOnly, setProximityOnly] = useState(false);
  const [radiusKm, setRadiusKm] = useState("25");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleSize = (size: string) =>
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size],
    );

  const toggleTag = (tag: string) =>
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );

  const hasFilters =
    searchQuery ||
    minPrice ||
    maxPrice ||
    proximityOnly ||
    selectedSizes.length > 0 ||
    selectedTags.length > 0 ||
    sortBy !== "newest";

  const clearAll = () => {
    setSearchQuery("");
    setMinPrice("");
    setMaxPrice("");
    setProximityOnly(false);
    setRadiusKm("25");
    setSortBy("newest");
    setSelectedSizes([]);
    setSelectedTags([]);
  };

  return (
    <main className="shop-page">
      <div className="shop-layout">
        <aside className="shop-sidebar">
          <h1 className="font-display shop-sidebar-title">Browse</h1>

          {/* Search */}
          <div className="sidebar-section">
            <input
              type="text"
              className="sidebar-search-input"
              placeholder="Search styles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Sort */}
          <div className="sidebar-section">
            <p className="sidebar-section-label">Sort By</p>
            <select
              className="sidebar-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
            </select>
          </div>

          {/* Price Range */}
          <div className="sidebar-section">
            <p className="sidebar-section-label">Price</p>
            <div className="sidebar-price-row">
              <input
                type="number"
                className="sidebar-price-input"
                placeholder="Min"
                min="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <span className="sidebar-price-dash">–</span>
              <input
                type="number"
                className="sidebar-price-input"
                placeholder="Max"
                min="0"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>

          {/* Size */}
          <div className="sidebar-section">
            <p className="sidebar-section-label">Size</p>
            <div className="sidebar-size-grid">
              {LETTER_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  className={`sidebar-size-pill${selectedSizes.includes(size) ? " active" : ""}`}
                  onClick={() => toggleSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Category Tags */}
          <div className="sidebar-section">
            <p className="sidebar-section-label">Category</p>
            <div className="sidebar-tag-list">
              {TAG_OPTIONS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={`sidebar-tag-btn${selectedTags.includes(tag) ? " active" : ""}`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Near Me */}
          <div className="sidebar-section">
            <label className="sidebar-toggle-label">
              <input
                type="checkbox"
                checked={proximityOnly}
                onChange={(e) => setProximityOnly(e.target.checked)}
              />
              <span>Near Me</span>
            </label>
            {proximityOnly && (
              <select
                className="sidebar-select"
                style={{ marginTop: "0.5rem" }}
                value={radiusKm}
                onChange={(e) => setRadiusKm(e.target.value)}
              >
                <option value="10">Within 10 km</option>
                <option value="25">Within 25 km</option>
                <option value="50">Within 50 km</option>
              </select>
            )}
          </div>

          {/* Clear all */}
          {hasFilters && (
            <button type="button" className="sidebar-clear-btn" onClick={clearAll}>
              Clear All
            </button>
          )}
        </aside>

        <section className="shop-content">
          <header className="shop-content-head">
            <h2 className="font-display shop-content-title">Thrift Out</h2>
          </header>
          <ThriftOutPanel
            userId={userId}
            searchQuery={searchQuery}
            minPrice={minPrice}
            maxPrice={maxPrice}
            proximityOnly={proximityOnly}
            radiusKm={radiusKm}
            sortBy={sortBy}
            selectedSizes={selectedSizes}
            selectedTags={selectedTags}
          />
        </section>
      </div>
    </main>
  );
}
