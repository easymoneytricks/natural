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
import {
  getBusinessName,
  useStoreSettings,
} from "../../context/StoreSettingsContext";

const navItems = ["Shop", "Skin", "Concerns", "Collections"];
const parseHeaderLinks = (value) =>
  String(value || "")
    .split(/\r?\n/)
    .map((line) => {
      const separator = line.indexOf("|");
      if (separator < 1) return null;
      const label = line.slice(0, separator).trim();
      const target = line.slice(separator + 1).trim();
      return label && target ? { label, target } : null;
    })
    .filter(Boolean);

export function Header({ onSearch, onCart, onMenu }) {
  const { count } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { count: compareCount } = useCompare();
  const { isAuthenticated, user, authStatus } = useAuth();
  const settings = useStoreSettings();
  const businessName = getBusinessName(settings);
  const logo = settings.branding?.logo_url || "";
  const headerLinks = parseHeaderLinks(
    settings.navigation?.header_links,
  );
  const bagLabel = `Shopping bag, ${count} ${count === 1 ? "item" : "items"}`;
  const accountReady = authStatus !== "checking";
  return (
    <header className="site-header">
      <div className="mobile-header">
        <IconButton label="Open menu" onClick={onMenu}>
          <Menu />
        </IconButton>
        <Link to="/" className="wordmark">
          {logo ? (
            <img
              className="brand-logo"
              src={logo}
              alt={`${businessName} logo`}
            />
          ) : (
            <span className="wordmark-name">{businessName}</span>
          )}
        </Link>
        <span>
          <IconButton label="Search" onClick={onSearch}>
            <Search />
          </IconButton>
          <IconButton label={bagLabel} onClick={onCart}>
            <ShoppingBag />
            {count > 0 && <i>{count}</i>}
          </IconButton>
        </span>
      </div>
      <div className="desktop-header container">
        <Link to="/" className="wordmark">
          {logo ? (
            <img
              className="brand-logo"
              src={logo}
              alt={`${businessName} logo`}
            />
          ) : (
            <span className="wordmark-name">{businessName}</span>
          )}
        </Link>
        <nav aria-label="Main navigation">
          <ul>
            {headerLinks.map(({ label, target }) => {
              const menuName = navItems.find(
                (name) => name.toLowerCase() === label.toLowerCase(),
              );
              const configuredMenu = menuName
                ? settings.mega_menu?.[menuName.toLowerCase()]
                : null;
              if (
                menuName &&
                ((typeof configuredMenu === "string" &&
                  !configuredMenu.trim()) ||
                  (Array.isArray(configuredMenu) && !configuredMenu.length))
              )
                return null;
              return menuName ? (
                <li className="nav-item" key={label + target}>
                  <button>
                    {label}
                    <ChevronDown size={14} />
                  </button>
                  <MegaMenu
                    item={parseMegaMenu(
                      settings.mega_menu?.[menuName.toLowerCase()],
                      menus[menuName],
                    )}
                  />
                </li>
              ) : (
                <li key={label + target}>
                  <Link to={target}>{label}</Link>
                </li>
              );
            })}
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
