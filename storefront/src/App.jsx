import { Component, useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AnnouncementBar } from "./components/layout/AnnouncementBar";
import { StoreAvailabilityNotice } from "./components/layout/StoreAvailabilityNotice";
import { Header } from "./components/layout/Header";
import { SearchOverlay } from "./components/search/SearchOverlay";
import { CartDrawer } from "./components/cart/CartDrawer";
import { MobileMenu } from "./components/navigation/MobileMenu";
import { Footer } from "./components/layout/Footer";
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
  VerifyEmail,
} from "./pages/AuthPages";
import { AccountOverview, AccountWishlist, Rewards, GiftCards } from "./pages/AccountDashboard";
import {
  CustomerAddresses,
  CustomerProfile,
} from "./pages/CustomerAccountPages";
import { CustomerOrders, CustomerOrderDetail } from "./pages/CustomerOrders";
import { StoreSettingsProvider } from "./context/StoreSettingsContext";
import { CmsPage } from "./pages/CmsPage";
import { SeoMeta } from "./components/SeoMeta";
import { useLocation } from "react-router-dom";
import { ConsentBanner } from "./components/layout/ConsentBanner";
import { Analytics } from "./components/Analytics";
import { ArrowUp } from "lucide-react";
import { GiftCards as GiftCardPurchase, GiftCardSuccess } from "./pages/GiftCards";

class RenderBoundary extends Component {
  state = { failed: false, message: "" };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error) {
    this.setState({ message: error?.message || "Unknown render error" });
  }
  render() {
    return this.state.failed
      ? <p className="route-error">We could not load this page: {this.state.message || "Please refresh and try again."}</p>
      : this.props.children;
  }
}

const informationalRoutes = [
  "/about",
  "/journal",
  "/new-arrivals",
  "/best-sellers",
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
const cmsRoutes = new Set([
  "/about",
  "/journal",
  "/privacy",
  "/terms",
  "/shipping",
  "/returns",
  "/refund-policy",
  "/cancellation-policy",
  "/faq",
]);

export default function App() {
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 420);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  useEffect(() => {
    document.body.classList.toggle(
      "overlay-open",
      searchOpen || cartOpen || menuOpen,
    );
    return () => document.body.classList.remove("overlay-open");
  }, [searchOpen, cartOpen, menuOpen]);

  return (
    <StoreSettingsProvider>
      <SeoMeta
        title={
          location.pathname === "/"
            ? "Healthy skin, beautifully simple"
            : location.pathname.slice(1).replaceAll("/", " · ")
        }
        noindex={
          location.pathname.startsWith("/account") ||
          location.pathname === "/checkout"
        }
      />
      <AnnouncementBar />
      <Header
        onSearch={() => setSearchOpen(true)}
        onCart={() => setCartOpen(true)}
        onMenu={() => setMenuOpen(true)}
      />
      <StoreAvailabilityNotice />
      <main>
        <RenderBoundary><Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route
            path="/best-sellers"
            element={<Navigate to="/shop?sort=best-selling" replace />}
          />
          <Route
            path="/new-arrivals"
            element={<Navigate to="/shop?sort=newest" replace />}
          />
          <Route
            path="/skin-types"
            element={<Navigate to="/shop" replace />}
          />
          <Route
            path="/concerns"
            element={<Navigate to="/shop" replace />}
          />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/pages/:slug" element={<CmsPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/order-failed" element={<OrderFailed />} />
          <Route path="/gift-cards" element={<GiftCardPurchase />} />
          <Route path="/gift-cards/success" element={<GiftCardSuccess />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/account" element={<AccountOverview />} />
          <Route path="/account/orders" element={<CustomerOrders />} />
          <Route path="/account/wishlist" element={<AccountWishlist />} />
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
              element={
                cmsRoutes.has(path) ? (
                  <CmsPage slug={path.slice(1)} />
                ) : (
                  <RouteShell title={path.slice(1)} />
                )
              }
            />
          ))}
        </Routes></RenderBoundary>
      </main>
      <Footer />
      <CompareTray />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <ConsentBanner />
      <Analytics />
      {showScrollTop && (
        <button
          className="scroll-to-top"
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          title="Back to top"
        >
          <ArrowUp size={18} strokeWidth={1.8} />
        </button>
      )}
    </StoreSettingsProvider>
  );
}
