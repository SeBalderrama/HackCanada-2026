import { useState } from "react";
import ListingsPanel from "../components/ListingsPanel";
import TransactionsPanel from "../components/TransactionsPanel";
import ThriftOutPanel from "../components/ThriftOutPanel";
import "./shopPage.css";

type ShopView = "listings" | "transactions" | "thriftOut";

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
            My Listings
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
              {activeView === "listings" && "My Listings"}
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
