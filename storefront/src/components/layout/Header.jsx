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
import { menus } from "../../data/navigation";
import { useCart } from "../../context/CartContext";
import { useCompare, useWishlist } from "../../context/PreferenceContext";
import { useAuth } from "../../context/AuthContext";

const navItems = ["Shop", "Skin", "Concerns", "Collections"];

export function Header({ onSearch, onCart, onMenu }) {
  const { count } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { count: compareCount } = useCompare();
  const { isAuthenticated, user, authStatus } = useAuth();
  const bagLabel = `Shopping bag, ${count} ${count === 1 ? "item" : "items"}`;
  const accountReady = authStatus !== "checking";
  return (
    <header className="site-header">
      <div className="mobile-header">
        <IconButton label="Open menu" onClick={onMenu}>
          <Menu />
        </IconButton>
        <Link to="/" className="wordmark">
          Natural Beauty
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
          Natural Beauty
        </Link>
        <nav aria-label="Main navigation">
          <ul>
            {navItems.map((name) => (
              <li className="nav-item" key={name}>
                <button>
                  {name}
                  <ChevronDown size={14} />
                </button>
                <MegaMenu item={menus[name]} />
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
            to="/wishlist"
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
