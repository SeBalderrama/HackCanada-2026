import { useEffect, useState } from "react";
import { fetchPurchases } from "../api/listings";
import type { Purchase } from "../types/listing";

export default function TransactionsPanel() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPurchases();
        setPurchases(data);
      } catch (err: any) {
        setError(err.message || "Failed to load transactions");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <p className="shop-section-subtitle">Loading transactions...</p>;
  }

  if (error) {
    return (
      <p className="shop-section-subtitle" style={{ color: "#b44" }}>
        {error}
      </p>
    );
  }

  if (purchases.length === 0) {
    return (
      <p className="shop-section-subtitle">No transactions recorded yet.</p>
    );
  }

  return (
    <div className="shop-table-wrap">
      <table className="shop-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Item</th>
            <th>Price</th>
            <th>Buyer</th>
            <th>Date</th>
            <th>Tags</th>
          </tr>
        </thead>
        <tbody>
          {purchases.map((purchase) => (
            <tr key={purchase._id}>
              <td>
                {purchase.cloudinaryUrl && (
                  <img
                    src={purchase.cloudinaryUrl}
                    alt={purchase.title}
                    className="shop-table-img"
                  />
                )}
              </td>
              <td>{purchase.title}</td>
              <td>${purchase.price}</td>
              <td className="shop-table-id">{purchase.buyerId}</td>
              <td>
                {new Date(purchase.purchaseDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                })}
              </td>
              <td>
                <div className="shop-card-tags">
                  {purchase.tags.map((tag) => (
                    <span key={tag} className="shop-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
