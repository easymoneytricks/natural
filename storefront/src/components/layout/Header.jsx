import { Link } from 'react-router-dom'
import { Menu, Search, UserRound, Heart, Scale, ShoppingBag, ChevronDown } from 'lucide-react'
import { IconButton } from '../ui/IconButton'
import { MegaMenu } from '../navigation/MegaMenu'
import { menus } from '../../data/navigation'
import { useCart } from '../../context/CartContext'

const navItems = ['Shop', 'Skin', 'Concerns', 'Collections']

export function Header({ onSearch, onCart, onMenu }) {
  const { count } = useCart()
  const bagLabel = `Shopping bag, ${count} ${count === 1 ? 'item' : 'items'}`
  return <header className="site-header"><div className="mobile-header"><IconButton label="Open menu" onClick={onMenu}><Menu /></IconButton><Link to="/" className="wordmark">Natural Beauty</Link><span><IconButton label="Search" onClick={onSearch}><Search /></IconButton><IconButton label={bagLabel} onClick={onCart}><ShoppingBag /></IconButton></span></div><div className="desktop-header container"><Link to="/" className="wordmark">Natural Beauty</Link><nav aria-label="Main navigation"><ul>{navItems.map((name) => <li className="nav-item" key={name}><button>{name}<ChevronDown size={14} /></button><MegaMenu item={menus[name]} /></li>)}<li><Link to="/journal">Journal</Link></li><li><Link to="/about">About</Link></li></ul></nav><div className="header-actions"><button className="text-action" onClick={onSearch}>Search</button><Link aria-label="Account" to="/account"><UserRound /></Link><Link className="with-badge" aria-label="Wishlist, 2 items" to="/wishlist"><Heart /><i>2</i></Link><Link className="with-badge" aria-label="Compare, 1 item" to="/compare"><Scale /><i>1</i></Link><IconButton label={bagLabel} onClick={onCart}><ShoppingBag />{count > 0 && <i>{count}</i>}</IconButton></div></div></header>
}
