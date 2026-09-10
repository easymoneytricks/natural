import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { AnnouncementBar } from "./components/layout/AnnouncementBar";
import { Header } from "./components/layout/Header";
import { SearchOverlay } from "./components/search/SearchOverlay";
import { CartDrawer } from "./components/cart/CartDrawer";
import { MobileMenu } from "./components/navigation/MobileMenu";
import { Home } from "./pages/Home";
import { RouteShell } from "./pages/RouteShell";
import { Shop } from "./pages/Shop";
import { ProductDetail } from "./pages/ProductDetail";
import { Cart } from "./pages/Cart";
import { Wishlist } from "./pages/Wishlist";
import { Compare } from "./pages/Compare";
import { CompareTray } from "./components/compare/CompareTray";
import { Checkout, OrderSuccess, OrderFailed } from "./pages/Checkout";
import {
  Login,
  Register,
  ForgotPassword,
  ResetPassword,
} from "./pages/AuthPages";
import { AccountOverview, Rewards, GiftCards } from "./pages/AccountDashboard";
import {
  CustomerAddresses,
  CustomerProfile,
} from "./pages/CustomerAccountPages";
import { CustomerOrders, CustomerOrderDetail } from "./pages/CustomerOrders";

const informationalRoutes = [
  "/about",
  "/journal",
  "/new-arrivals",
  "/best-sellers",
  "/skin-types",
  "/concerns",
  "/gift-cards",
  "/contact",
  "/faq",
  "/shipping",
  "/returns",
  "/track-order",
  "/privacy",
  "/terms",
  "/refund-policy",
  "/cancellation-policy",
];

export default function App() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const close = (event) => {
      if (event.key === "Escape") {
        setSearchOpen(false);
        setCartOpen(false);
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  useEffect(() => {
    document.body.classList.toggle(
      "overlay-open",
      searchOpen || cartOpen || menuOpen,
    );
    return () => document.body.classList.remove("overlay-open");
  }, [searchOpen, cartOpen, menuOpen]);

  return (
    <>
      <AnnouncementBar />
      <Header
        onSearch={() => setSearchOpen(true)}
        onCart={() => setCartOpen(true)}
        onMenu={() => setMenuOpen(true)}
      />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/order-failed" element={<OrderFailed />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/account" element={<AccountOverview />} />
          <Route path="/account/orders" element={<CustomerOrders />} />
          <Route
            path="/account/orders/:orderNumber"
            element={<CustomerOrderDetail />}
          />
          <Route path="/account/addresses" element={<CustomerAddresses />} />
          <Route path="/account/profile" element={<CustomerProfile />} />
          <Route path="/account/rewards" element={<Rewards />} />
          <Route path="/account/gift-cards" element={<GiftCards />} />
          {informationalRoutes.map((path) => (
            <Route
              key={path}
              path={path}
              element={<RouteShell title={path.slice(1)} />}
            />
          ))}
        </Routes>
      </main>
      <CompareTray />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
