import { Link } from "react-router-dom";
import {
  Menu,
  Search,
  UserRound,
  Heart,
  Scale,
  ShoppingBag,
  ChevronDown,
} from "lucide-react";
import { IconButton } from "../ui/IconButton";
import { MegaMenu } from "../navigation/MegaMenu";
import { menus, parseMegaMenu } from "../../data/navigation";
import { useCart } from "../../context/CartContext";
import { useCompare, useWishlist } from "../../context/PreferenceContext";
import { useAuth } from "../../context/AuthContext";
import { useStoreSettings } from "../../context/StoreSettingsContext";

const navItems = ["Shop", "Skin", "Concerns", "Collections"];

export function Header({ onSearch, onCart, onMenu }) {
  const { count } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { count: compareCount } = useCompare();
  const { isAuthenticated, user, authStatus } = useAuth();
  const settings = useStoreSettings();
  const logo =
    settings.branding?.logo_url ||
    "https://www.svgrepo.com/show/42722/skincare.svg";
  const bagLabel = `Shopping bag, ${count} ${count === 1 ? "item" : "items"}`;
  const accountReady = authStatus !== "checking";
  return (
    <header className="site-header">
      <div className="mobile-header">
        <IconButton label="Open menu" onClick={onMenu}>
          <Menu />
        </IconButton>
        <Link to="/" className="wordmark">
          <img className="brand-logo" src={logo} alt="Natural Beauty logo" />
        </Link>
        <span>
          <IconButton label="Search" onClick={onSearch}>
            <Search />
          </IconButton>
          <IconButton label={bagLabel} onClick={onCart}>
            <ShoppingBag />
          </IconButton>
        </span>
      </div>
      <div className="desktop-header container">
        <Link to="/" className="wordmark">
          <img className="brand-logo" src={logo} alt="Natural Beauty logo" />
        </Link>
        <nav aria-label="Main navigation">
          <ul>
            {navItems.map((name) => (
              <li className="nav-item" key={name}>
                <button>
                  {name}
                  <ChevronDown size={14} />
                </button>
                <MegaMenu
                  item={parseMegaMenu(
                    settings.mega_menu?.[name.toLowerCase()],
                    menus[name],
                  )}
                />
              </li>
            ))}
            <li>
              <Link to="/journal">Journal</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
          </ul>
        </nav>
        <div className="header-actions">
          <button className="text-action" onClick={onSearch}>
            Search
          </button>
          <Link
            aria-label={
              accountReady && isAuthenticated
                ? `Account for ${user.firstName}`
                : accountReady
                  ? "Sign in"
                  : "Account"
            }
            to={
              accountReady && isAuthenticated
                ? "/account"
                : accountReady
                  ? "/login"
                  : "#"
            }
          >
            <UserRound />
          </Link>
          <Link
            className="with-badge"
            aria-label={`Wishlist, ${wishlistCount} items`}
            to="/account/wishlist"
          >
            <Heart />
            {wishlistCount > 0 && <i>{wishlistCount}</i>}
          </Link>
          <Link
            className="with-badge"
            aria-label={`Compare, ${compareCount} items`}
            to="/compare"
          >
            <Scale />
            {compareCount > 0 && <i>{compareCount}</i>}
          </Link>
          <IconButton label={bagLabel} onClick={onCart}>
            <ShoppingBag />
            {count > 0 && <i>{count}</i>}
          </IconButton>
        </div>
      </div>
    </header>
  );
}
