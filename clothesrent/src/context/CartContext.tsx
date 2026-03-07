import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { Listing } from "../types/listing";

export interface CartItem {
    listing: Listing;
    mode: "rent" | "buy";
    days: number;
}

interface CartContextValue {
    items: CartItem[];
    addToCart: (listing: Listing, mode: "rent" | "buy", days?: number) => void;
    removeFromCart: (listingId: string) => void;
    updateItem: (listingId: string, updates: Partial<Pick<CartItem, "mode" | "days">>) => void;
    clearCart: () => void;
    cartCount: number;
    isInCart: (listingId: string) => boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "maison-ore-cart";

function loadCart(): CartItem[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveCart(items: CartItem[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>(loadCart);

    useEffect(() => {
        saveCart(items);
    }, [items]);

    const addToCart = useCallback((listing: Listing, mode: "rent" | "buy", days = 1) => {
        setItems((prev) => {
            if (prev.some((i) => i.listing._id === listing._id)) return prev;
            return [...prev, { listing, mode, days }];
        });
    }, []);

    const removeFromCart = useCallback((listingId: string) => {
        setItems((prev) => prev.filter((i) => i.listing._id !== listingId));
    }, []);

    const updateItem = useCallback((listingId: string, updates: Partial<Pick<CartItem, "mode" | "days">>) => {
        setItems((prev) =>
            prev.map((i) =>
                i.listing._id === listingId ? { ...i, ...updates } : i
            )
        );
    }, []);

    const clearCart = useCallback(() => setItems([]), []);

    const isInCart = useCallback(
        (listingId: string) => items.some((i) => i.listing._id === listingId),
        [items]
    );

    return (
        <CartContext.Provider
            value={{ items, addToCart, removeFromCart, updateItem, clearCart, cartCount: items.length, isInCart }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used within CartProvider");
    return ctx;
}
