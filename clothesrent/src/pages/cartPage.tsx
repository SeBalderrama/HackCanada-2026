import { useCart } from "../context/CartContext";
import { buildDisplayUrl } from "../utils/cloudinaryUrl";
import { useAuth0 } from "@auth0/auth0-react";
import { purchaseListing } from "../api/listings";
import { useState } from "react";

export default function CartPage() {
    const { items, removeFromCart, updateItem, clearCart } = useCart();
    const { user } = useAuth0();
    const userId = user?.sub ?? "";
    const [checkingOut, setCheckingOut] = useState(false);
    const [checkoutDone, setCheckoutDone] = useState(false);

    const total = items.reduce((sum, item) => {
        if (item.mode === "rent" && item.listing.dailyRate > 0) {
            return sum + item.listing.dailyRate * item.days;
        }
        return sum + item.listing.price;
    }, 0);

    const handleCheckout = async () => {
        if (!userId) {
            alert("Please sign in to checkout.");
            return;
        }
        setCheckingOut(true);
        try {
            for (const item of items) {
                await purchaseListing(item.listing._id, userId);
            }
            clearCart();
            setCheckoutDone(true);
        } catch (err: any) {
            alert(err.message || "Checkout failed");
        } finally {
            setCheckingOut(false);
        }
    };

    if (checkoutDone) {
        return (
            <main className="cart-page">
                <section className="cart-done">
                    <div className="cart-done-icon">✓</div>
                    <h1 className="font-display cart-done-title">Order Confirmed</h1>
                    <p className="cart-done-sub">
                        Your items have been reserved. Check your transaction log for details.
                    </p>
                    <a href="/shop" className="btn-primary">Back to Shop</a>
                </section>
            </main>
        );
    }

    return (
        <main className="cart-page">
            <a href="/shop" className="ldp-back">← Back to Shop</a>

            <section className="cart-hero">
                <div className="section-eyebrow">Your Cart</div>
                <h1 className="font-display cart-title">
                    {items.length === 0 ? "Cart is empty" : `${items.length} item${items.length !== 1 ? "s" : ""}`}
                </h1>
            </section>

            {items.length === 0 && (
                <div className="cart-empty">
                    <p>Browse the shop and add some pieces to your cart.</p>
                    <a href="/shop" className="btn-primary">Browse Shop</a>
                </div>
            )}

            {items.length > 0 && (
                <>
                    <div className="cart-list">
                        {items.map((item) => {
                            const imgUrl = item.listing.cloudinaryUrl
                                ? buildDisplayUrl(item.listing.cloudinaryUrl, {
                                    width: 200,
                                    height: 267,
                                    removeBg: item.listing.transformations?.removeBg,
                                })
                                : "";

                            const lineTotal =
                                item.mode === "rent" && item.listing.dailyRate > 0
                                    ? item.listing.dailyRate * item.days
                                    : item.listing.price;

                            return (
                                <div key={item.listing._id} className="cart-item">
                                    <a href={`/listing/${item.listing._id}`} className="cart-item-img-wrap">
                                        {imgUrl ? (
                                            <img src={imgUrl} alt={item.listing.title} className="cart-item-img" />
                                        ) : (
                                            <div className="cart-item-img-ph">No Image</div>
                                        )}
                                    </a>

                                    <div className="cart-item-info">
                                        <a href={`/listing/${item.listing._id}`} className="cart-item-name">
                                            {item.listing.title}
                                        </a>

                                        <div className="cart-item-mode-row">
                                            <select
                                                className="cart-item-mode-select"
                                                value={item.mode}
                                                onChange={(e) =>
                                                    updateItem(item.listing._id, {
                                                        mode: e.target.value as "rent" | "buy",
                                                    })
                                                }
                                            >
                                                {item.listing.dailyRate > 0 && (
                                                    <option value="rent">Rent</option>
                                                )}
                                                <option value="buy">Buy</option>
                                            </select>

                                            {item.mode === "rent" && item.listing.dailyRate > 0 && (
                                                <div className="cart-item-days">
                                                    <button
                                                        type="button"
                                                        className="ldp-days-btn"
                                                        onClick={() =>
                                                            updateItem(item.listing._id, {
                                                                days: Math.max(1, item.days - 1),
                                                            })
                                                        }
                                                    >
                                                        −
                                                    </button>
                                                    <span className="cart-item-days-num">{item.days}d</span>
                                                    <button
                                                        type="button"
                                                        className="ldp-days-btn"
                                                        onClick={() =>
                                                            updateItem(item.listing._id, {
                                                                days: Math.min(30, item.days + 1),
                                                            })
                                                        }
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="cart-item-price">${lineTotal.toFixed(2)}</div>
                                    </div>

                                    <button
                                        type="button"
                                        className="cart-item-remove"
                                        onClick={() => removeFromCart(item.listing._id)}
                                        aria-label="Remove"
                                    >
                                        ×
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    <div className="cart-summary">
                        <div className="cart-total">
                            Total: <strong>${total.toFixed(2)}</strong>
                        </div>
                        <button
                            type="button"
                            className="btn-primary cart-checkout-btn"
                            onClick={handleCheckout}
                            disabled={checkingOut || !userId}
                        >
                            {checkingOut ? "Processing..." : "Checkout"}
                        </button>
                    </div>
                </>
            )}
        </main>
    );
}
