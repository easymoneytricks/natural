import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { linkLabel, linkTarget } from "../../data/navigationLinks";

export function MegaMenu({ item }) {
  return (
    <div className="mega-menu" role="menu">
      <div className="mega-grid">
        {item.columns.map((column) => (
          <section key={column.title}>
            <h3>{column.title}</h3>
            <ul className="mega-links">
              {column.links.map((link) => {
                const target = linkTarget(link);
                if (!target) return null;
                return (
                  <li key={link}>
                    <Link to={target} role="menuitem">
                      {linkLabel(link)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
        <Link className="mega-feature" to={item.feature.url || "/shop"}>
          <img src={item.feature.image} alt="" />
          <div>
            <p>{item.feature.title}</p>
            <span>{item.feature.text}</span>
            <b>
              {item.feature.cta} <ArrowUpRight size={14} />
            </b>
          </div>
        </Link>
      </div>
    </div>
  );
}
