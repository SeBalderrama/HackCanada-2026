import { useState } from "react";
import "./shopPage.css";
import { UploadPhotoButton } from "../components/uploadPhotoButton";

type ShopView = "listings" | "transactions" | "thriftOut";

type Listing = {
  id: number;
  title: string;
  size: string;
  dailyRate: string;
  status: "Live" | "Draft" | "Paused";
  views: number;
};

type Transaction = {
  id: string;
  item: string;
  renter: string;
  startDate: string;
  total: string;
  status: "Completed" | "Pending" | "In Progress";
};

type InventoryItem = {
  id: number;
  name: string;
  category: string;
  condition: string;
  location: string;
};

const LISTINGS: Listing[] = [
  {
    id: 101,
    title: "Obsidian Trench",
    size: "M",
    dailyRate: "$28/day",
    status: "Live",
    views: 312,
  },
  {
    id: 102,
    title: "Ivory Linen Shirt",
    size: "L",
    dailyRate: "$15/day",
    status: "Live",
    views: 189,
  },
  {
    id: 103,
    title: "Slate Wool Blazer",
    size: "M",
    dailyRate: "$34/day",
    status: "Paused",
    views: 241,
  },
  {
    id: 104,
    title: "Cream Slip Dress",
    size: "S",
    dailyRate: "$22/day",
    status: "Draft",
    views: 63,
  },
];

const TRANSACTIONS: Transaction[] = [
  {
    id: "TX-9421",
    item: "Bone Leather Jacket",
    renter: "Ari P.",
    startDate: "Mar 02, 2026",
    total: "$76",
    status: "Completed",
  },
  {
    id: "TX-9439",
    item: "Ash Cashmere Coat",
    renter: "Mina L.",
    startDate: "Mar 06, 2026",
    total: "$112",
    status: "In Progress",
  },
  {
    id: "TX-9460",
    item: "Charcoal Wide-Leg",
    renter: "Noah T.",
    startDate: "Mar 08, 2026",
    total: "$38",
    status: "Pending",
  },
];

const THRIFT_OUT_ITEMS: InventoryItem[] = [
  {
    id: 1,
    name: "Vintage Varsity Jacket",
    category: "Outerwear",
    condition: "Excellent",
    location: "Downtown Hub",
  },
  {
    id: 2,
    name: "Corduroy Wide Pants",
    category: "Bottoms",
    condition: "Great",
    location: "Queen St Closet",
  },
  {
    id: 3,
    name: "Silk Evening Top",
    category: "Tops",
    condition: "Like New",
    location: "Harbourfront Point",
  },
  {
    id: 4,
    name: "Wool Pleated Skirt",
    category: "Bottoms",
    condition: "Good",
    location: "Downtown Hub",
  },
  {
    id: 5,
    name: "Chunky Knit Cardigan",
    category: "Knitwear",
    condition: "Great",
    location: "Queen St Closet",
  },
  {
    id: 6,
    name: "Structured Mini Bag",
    category: "Accessories",
    condition: "Excellent",
    location: "Harbourfront Point",
  },
];

function ListingsPanel() {
  return (
    <div className="shop-grid">

      {LISTINGS.map((listing) => (
        <article key={listing.id} className="shop-card">
          <div className="shop-card-top">
            <h3 className="shop-card-title">{listing.title}</h3>
            <span
              className={`shop-pill shop-pill-${listing.status.toLowerCase()}`}>
              {listing.status}
            </span>
          </div>
          <p className="shop-card-meta">Size {listing.size}</p>
          <p className="shop-card-rate">{listing.dailyRate}</p>
          <p className="shop-card-meta">{listing.views} views this week</p>
        </article>
      ))}
    </div>
  );
}

function TransactionsPanel() {
  return (
    <div className="shop-table-wrap">
      <table className="shop-table">
        <thead>
          <tr>
            <th>Transaction</th>
            <th>Item</th>
            <th>Renter</th>
            <th>Start Date</th>
            <th>Total</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {TRANSACTIONS.map((transaction) => (
            <tr key={transaction.id}>
              <td>{transaction.id}</td>
              <td>{transaction.item}</td>
              <td>{transaction.renter}</td>
              <td>{transaction.startDate}</td>
              <td>{transaction.total}</td>
              <td>
                <span
                  className={`shop-pill shop-pill-${transaction.status.toLowerCase().replace(/\s+/g, "-")}`}>
                  {transaction.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ThriftOutPanel() {
  return (
    <div>
      <p className="shop-section-subtitle">
        All stuff currently available across your thrift-out network.
      </p>
      <div className="shop-grid">
        {THRIFT_OUT_ITEMS.map((item) => (
          <article key={item.id} className="shop-card">
            <h3 className="shop-card-title">{item.name}</h3>
            <p className="shop-card-meta">{item.category}</p>
            <p className="shop-card-meta">Condition: {item.condition}</p>
            <p className="shop-card-meta">Location: {item.location}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

export default function ShopPage() {
  const [activeView, setActiveView] = useState<ShopView>("listings");

  return (
    <main className="shop-page">
      <div className="shop-layout">
        <aside className="shop-sidebar">
          <p className="shop-sidebar-label">Seller Dashboard</p>
          <h1 className="font-display shop-sidebar-title">Shop Control</h1>

          <button
            type="button"
            className={`shop-nav-btn${activeView === "listings" ? " active" : ""}`}
            onClick={() => setActiveView("listings")}>
            Listings
          </button>
          <button
            type="button"
            className={`shop-nav-btn${activeView === "transactions" ? " active" : ""}`}
            onClick={() => setActiveView("transactions")}>
            Transaction Log
          </button>
          <button
            type="button"
            className={`shop-nav-btn${activeView === "thriftOut" ? " active" : ""}`}
            onClick={() => setActiveView("thriftOut")}>
            Thrift Out
          </button>
        </aside>

        <section className="shop-content">
          <header className="shop-content-head">
            <h2 className="font-display shop-content-title">
              {activeView === "listings" && "Listings"}
              {activeView === "transactions" && "Transaction Log"}
              {activeView === "thriftOut" && "Thrift Out"}
            </h2>
          </header>

          {activeView === "listings" && <ListingsPanel />}
          {activeView === "transactions" && <TransactionsPanel />}
          {activeView === "thriftOut" && <ThriftOutPanel />}
        </section>
      </div>
    </main>
  );
}
