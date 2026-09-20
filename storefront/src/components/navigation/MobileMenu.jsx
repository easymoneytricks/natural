import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  X,
  ChevronDown,
  UserRound,
  Heart,
  Scale,
  Headphones,
} from "lucide-react";
import { menus } from "../../data/navigation";
import { linkLabel, linkTarget } from "../../data/navigationLinks";
import { useFocusTrap } from "../ui/useFocusTrap";
import { useAuth } from "../../context/AuthContext";
import { useWishlist, useCompare } from "../../context/PreferenceContext";
import {
  getBusinessName,
  useStoreSettings,
} from "../../context/StoreSettingsContext";

const menuGroups = ["Shop", "Skin", "Concerns", "Collections"];
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

export function MobileMenu({ open, onClose }) {
  const [active, setActive] = useState(null);
  const ref = useRef(null);
  const { isAuthenticated, logout } = useAuth();
  const { count: wishlistCount } = useWishlist();
  const { count: compareCount } = useCompare();
  const settings = useStoreSettings();
  const businessName = getBusinessName(settings);
  const logo = settings.branding?.logo_url || "";
  const guidanceTitle = String(
    settings.footer?.mobile_guidance_title || "",
  ).trim();
  const guidanceText = String(
    settings.footer?.mobile_guidance_text || "",
  ).trim();
  const headerLinks = parseHeaderLinks(
    settings.navigation?.header_links ||
      "Shop|/shop\nSkin|/skin-types\nConcerns|/concerns\nCollections|/collections\nJournal|/journal\nAbout|/about",
  );
  useFocusTrap(ref, open, onClose);
  return (
    <div
      className={`overlay mobile-overlay ${open ? "is-open" : ""}`}
      aria-hidden={!open}
    >
      <button
        className="scrim"
        onClick={onClose}
        aria-label="Close navigation"
      />
      <aside
        ref={ref}
        className="mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        <header>
          <Link to="/" onClick={onClose} className="wordmark">
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
          <button
            className="close-button"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X />
          </button>
        </header>
        <nav>
          {headerLinks.map(({ label, target }) =>
            menuGroups.some(
              (group) => group.toLowerCase() === label.toLowerCase(),
            ) ? (
              (() => {
                const group = menuGroups.find(
                  (item) => item.toLowerCase() === label.toLowerCase(),
                );
                const configuredMenu =
                  settings.mega_menu?.[group.toLowerCase()];
                if (
                  (typeof configuredMenu === "string" &&
                    !configuredMenu.trim()) ||
                  (Array.isArray(configuredMenu) && !configuredMenu.length)
                )
                  return null;
                return (
                  <div className="mobile-group" key={group}>
                    <button
                      aria-expanded={active === group}
                      onClick={() => setActive(active === group ? null : group)}
                    >
                      {label}
                      <ChevronDown />
                    </button>
                    <div
                      aria-hidden={active !== group}
                      className={`mobile-submenu ${active === group ? "open" : ""}`}
                    >
                      <div>
                        {menus[group].columns
                          .flatMap((column) => column.links)
                          .map((link) => {
                            const target = linkTarget(link);
                            if (!target) return null;
                            return (
                              <Link key={link} to={target} onClick={onClose}>
                                {linkLabel(link)}
                              </Link>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              <Link key={label + target} to={target} onClick={onClose}>
                {label}
              </Link>
            ),
          )}
        </nav>
        <div className="mobile-utilities">
          <Link to={isAuthenticated ? "/account" : "/login"} onClick={onClose}>
            <UserRound /> {isAuthenticated ? "My account" : "Sign in"}
          </Link>
          <Link to="/account/wishlist" onClick={onClose}>
            <Heart /> Wishlist {wishlistCount > 0 && <i>{wishlistCount}</i>}
          </Link>
          <Link to="/compare" onClick={onClose}>
            <Scale /> Compare {compareCount > 0 && <i>{compareCount}</i>}
          </Link>
          {isAuthenticated && (
            <button
              onClick={() => {
                logout();
                onClose();
              }}
            >
              Log out
            </button>
          )}
        </div>
        {guidanceTitle && (
          <div className="support">
            <Headphones />
            <span>
              {guidanceTitle}
              {guidanceText && <small>{guidanceText}</small>}
            </span>
          </div>
        )}
      </aside>
    </div>
  );
}
