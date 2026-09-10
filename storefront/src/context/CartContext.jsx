/* oxlint-disable react/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import * as cartApi from "../services/cartApi";
import { products, newArrivals } from "../data/products";

const CartContext = createContext(null);
const catalog = [...products, ...newArrivals];
const decorate = (lines) =>
  lines.map((line) => {
    const match = catalog.find(
      (product) => product.slug === line.product?.slug,
    );
    return {
      ...line,
      name: line.product?.name || line.name,
      slug: line.product?.slug || line.slug,
      image: line.image?.src || match?.image,
      attributes: line.attributes || {},
      stock: line.availability?.available,
      availableStock: line.availability?.available,
      mrp: line.mrp,
      price: line.price,
    };
  });

export function CartProvider({ children }) {
  const { authStatus, authFetch } = useAuth();
  const [guestItems, setGuestItems] = useState(() => {
    try {
      const stored = JSON.parse(
        localStorage.getItem("natural-beauty-cart") || "[]",
      );
      return Array.isArray(stored)
        ? stored.filter((item) => item && item.sku && item.quantity > 0)
        : [];
    } catch {
      return [];
    }
  });

  const [items, setItems] = useState(guestItems);
  const [serverMode, setServerMode] = useState(false);
  const [pending, setPending] = useState(false);
  useEffect(() => {
    if (!serverMode)
      try {
        localStorage.setItem("natural-beauty-cart", JSON.stringify(guestItems));
      } catch {}
  }, [guestItems, serverMode]);
  useEffect(() => {
    if (!serverMode) setItems(guestItems);
  }, [guestItems, serverMode]);
  useEffect(() => {
    if (authStatus !== "authenticated") return;
    let active = true;
    const load = async () => {
      setPending(true);
      try {
        const guest = guestItems
          .filter((item) => item.skuId || item.sku)
          .map((item) => ({ skuId: item.skuId, quantity: item.quantity }));
        const mergeId = guest.length
          ? sessionStorage.getItem("natural-beauty-cart-merge-id") ||
            crypto.randomUUID()
          : null;
        if (mergeId)
          sessionStorage.setItem("natural-beauty-cart-merge-id", mergeId);
        const result = guest.length
          ? await cartApi.mergeCart(authFetch, guest, mergeId)
          : await cartApi.getCart(authFetch);
        if (!active) return;
        setItems(decorate(result.data.items || []));
        setServerMode(true);
        if (guest.length) {
          setGuestItems([]);
          sessionStorage.removeItem("natural-beauty-cart-merge-id");
        }
      } catch {
      } finally {
        if (active) setPending(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [authStatus, authFetch, guestItems]);
  useEffect(() => {
    if (authStatus === "unauthenticated" && serverMode) {
      setServerMode(false);
      setItems(guestItems);
    }
  }, [authStatus, serverMode, guestItems]);

  const addItem = async (item) => {
    if (serverMode && item.skuId) {
      setPending(true);
      try {
        const result = await cartApi.addCartItem(
          authFetch,
          item.skuId,
          item.quantity || 1,
        );
        setItems(decorate(result.data.items || []));
      } finally {
        setPending(false);
      }
      return;
    }
    setGuestItems((current) => {
      const existing = current.find((line) => line.sku === item.sku);
      if (existing) {
        const maxStock = Number.isFinite(
          existing.availableStock ?? existing.stock,
        )
          ? (existing.availableStock ?? existing.stock)
          : Infinity;
        return current.map((line) =>
          line.sku === item.sku
            ? {
                ...line,
                quantity: Math.min(line.quantity + item.quantity, maxStock),
              }
            : line,
        );
      }
      const maxStock = Number.isFinite(item.availableStock ?? item.stock)
        ? (item.availableStock ?? item.stock)
        : Infinity;
      return [
        ...current,
        {
          ...item,
          quantity: Math.max(1, Math.min(item.quantity || 1, maxStock)),
        },
      ];
    });
  };

  const updateQuantity = (sku, quantity) => {
    if (serverMode) {
      const line = items.find((item) => item.sku === sku || item.skuId === sku);
      if (!line) return;
      setPending(true);
      cartApi
        .updateCartItem(authFetch, line.skuId, quantity)
        .then((result) => setItems(decorate(result.data.items || [])))
        .finally(() => setPending(false));
      return;
    }
    setGuestItems((current) =>
      current.map((line) =>
        line.sku === sku
          ? {
              ...line,
              quantity: Math.max(
                1,
                Math.min(
                  quantity,
                  Number.isFinite(line.availableStock ?? line.stock)
                    ? (line.availableStock ?? line.stock)
                    : Infinity,
                ),
              ),
            }
          : line,
      ),
    );
  };

  const removeItem = async (sku) => {
    if (serverMode) {
      const line = items.find((item) => item.sku === sku || item.skuId === sku);
      if (!line) return;
      setPending(true);
      try {
        const result = await cartApi.removeCartItem(authFetch, line.skuId);
        setItems(decorate(result.data.items || []));
      } finally {
        setPending(false);
      }
      return;
    }
    setGuestItems((current) => current.filter((line) => line.sku !== sku));
  };
  const clearCart = async () => {
    if (serverMode) {
      setPending(true);
      try {
        const result = await cartApi.clearCart(authFetch);
        setItems(decorate(result.data.items || []));
      } finally {
        setPending(false);
      }
      return;
    }
    setGuestItems([]);
  };
  const value = useMemo(
    () => ({
      items,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      pending,
      serverMode,
      checkoutReady:
        !serverMode ||
        items.every((item) => item.availability?.quantityValid !== false),
      count: items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    [items, pending, serverMode, authFetch],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used within CartProvider");
  return value;
}
