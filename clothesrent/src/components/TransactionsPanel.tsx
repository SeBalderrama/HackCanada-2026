import { useEffect, useState } from "react";
import { fetchPurchases, fetchPublicUserProfile } from "../api/listings";
import type { Purchase } from "../types/listing";
import { thumbnailUrl } from "../utils/cloudinaryUrl";

interface Props {
  userId: string;
  filter?: "purchases" | "sales";
}

interface EnrichedPurchase extends Purchase {
  counterpartyName: string;
  counterpartyId: string;
}

async function enrichPurchases(
  purchases: Purchase[],
  userId: string,
): Promise<EnrichedPurchase[]> {
  const counterpartyIds = Array.from(
    new Set(
      purchases.map((p) => (p.buyerId === userId ? p.sellerId : p.buyerId)),
    ),
  );

  const profileMap: Record<string, string> = {};
  await Promise.all(
    counterpartyIds.map(async (id) => {
      try {
        const profile = await fetchPublicUserProfile(id);
        profileMap[id] = profile.name?.trim() || id;
      } catch {
        profileMap[id] = id;
      }
    }),
  );

  return purchases.map((p) => {
    const counterpartyId = p.buyerId === userId ? p.sellerId : p.buyerId;
    return {
      ...p,
      counterpartyId,
      counterpartyName: profileMap[counterpartyId] || counterpartyId,
    };
  });
}

export default function TransactionsPanel({ userId, filter }: Props) {
  const [purchases, setPurchases] = useState<EnrichedPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPurchases();
        const mine = userId
          ? data.filter((p) => p.buyerId === userId || p.sellerId === userId)
          : data;
        const enriched = await enrichPurchases(mine, userId);
        setPurchases(enriched);
      } catch (err: any) {
        setError(err.message || "Failed to load transactions");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  if (loading) {
    return <p className="shop-section-subtitle" style={{ marginTop: "0.5rem" }}>Loading transactions...</p>;
  }
  if (error) {
    return <p className="shop-section-subtitle" style={{ color: "#b44", marginTop: "0.5rem" }}>{error}</p>;
  }

  const bought = purchases.filter((p) => p.buyerId === userId);
  const sold = purchases.filter((p) => p.sellerId === userId);

  const rows = filter === "purchases" ? bought : filter === "sales" ? sold : [];
  const role: "buyer" | "seller" = filter === "sales" ? "seller" : "buyer";

  if (rows.length === 0) {
    return (
      <p className="shop-section-subtitle" style={{ marginTop: "0.5rem" }}>
        {filter === "purchases" ? "No purchases yet." : filter === "sales" ? "No sales yet." : "No transactions recorded yet."}
      </p>
    );
  }

  const renderTable = (rows: EnrichedPurchase[], role: "buyer" | "seller") => (
    <div className="shop-table-wrap txn-table-wrap">
      <table className="shop-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Price</th>
            <th>{role === "buyer" ? "Bought From" : "Sold To"}</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p._id}>
              <td>
                <div className="txn-item-cell">
                  {p.cloudinaryUrl && (
                    <img
                      src={thumbnailUrl(p.cloudinaryUrl, 48)}
                      alt={p.title}
                      className="shop-table-img"
                      loading="lazy"
                    />
                  )}
                  <a href={`/listing/${p.itemId}`} className="txn-item-link">{p.title}</a>
                </div>
              </td>
              <td className="txn-price">${p.price}</td>
              <td>
                <a
                  href={`/profile/${encodeURIComponent(p.counterpartyId)}`}
                  className="txn-user-link"
                >
                  {p.counterpartyName}
                </a>
              </td>
              <td className="txn-date">
                {new Date(p.purchaseDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="txn-panel">
      {renderTable(rows, role)}
    </div>
  );
}
