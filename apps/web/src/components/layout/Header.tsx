import {
  Heart,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
  ChevronDown,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useCartStore } from "../../store/cartStore";
import { useWishlistStore } from "../../store/wishlistStore";

const collections = [
  { label: "Cotton Frocks", category: "Cotton Frocks" },
  { label: "Pattu Frocks", category: "Pattu Frocks" },
  { label: "Cotton Pavadai", category: "Cotton Pavadai" },
  { label: "Pattu Pavadai", category: "Pattu Pavadai" },
];

function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const cartItems = useCartStore((state) => state.items);
  const wishlistCount = useWishlistStore((state) => state.items.length);

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const closeMenu = () => setIsMenuOpen(false);

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  const toggleSearch = () => {
    setIsSearchOpen((current) => !current);
    setIsMenuOpen(false);
  };

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    closeSearch();
    closeMenu();
    navigate(`/shop?search=${encodeURIComponent(query)}`);
  };

  const handlePopularSearch = (category: string) => {
    closeSearch();
    navigate(`/shop?category=${encodeURIComponent(category)}`);
  };

  const isActive = (path: string) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path);

  useEffect(() => {
    closeMenu();
    closeSearch();
  }, [location.pathname, location.search]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
        closeSearch();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const navLinkClass = (active: boolean) =>
    `relative text-sm font-medium transition-colors ${
      active ? "text-[#a56c25]" : "text-[#24160f] hover:text-[#a56c25]"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-[#24160f]/10 bg-[#fffaf1]/92 shadow-[0_10px_30px_rgba(55,35,20,0.05)] backdrop-blur-md">
      <div className="bg-[#24160f] px-4 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-[#f6d77c] sm:text-[11px]">
        Little traditions, beautifully made · NB to 10Y
      </div>

      <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => {
            setIsMenuOpen((current) => !current);
            setIsSearchOpen(false);
          }}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
          className="rounded-full p-2 transition hover:bg-black/5 active:scale-95 xl:hidden"
        >
          {isMenuOpen ? (
            <X size={22} strokeWidth={1.7} />
          ) : (
            <Menu size={22} strokeWidth={1.7} />
          )}
        </button>

        <Link
          to="/"
          onClick={() => {
            closeMenu();
            closeSearch();
          }}
          className="inline-flex items-center gap-2.5 text-[#24160f]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#c99b4a]/60 bg-[#f8e8bd] font-serif text-lg font-bold italic text-[#8b541d]">
            N
          </span>
          <span className="leading-none">
            <span className="block font-serif text-xl font-semibold tracking-[0.12em]">
              NILA
            </span>
            <span className="mt-1 block text-[8px] font-semibold uppercase tracking-[0.25em] text-[#a56c25]">
              Girlswear
            </span>
          </span>
        </Link>

        <form onSubmit={handleSearch} className="mx-4 hidden max-w-xl flex-1 lg:flex">
          <label className="flex w-full items-center gap-2 rounded-full border border-[#c99b4a]/35 bg-white px-4 py-2 shadow-sm focus-within:border-[#a56c25] focus-within:ring-4 focus-within:ring-[#c99b4a]/15">
            <Search size={17} className="shrink-0 text-[#8b541d]" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search dresses, fabrics, colours…"
              aria-label="Search products"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-black/40"
            />
            <button
              type="submit"
              className="rounded-full bg-[#f6d77c] px-3 py-1.5 text-xs font-bold text-[#24160f] transition hover:bg-[#e9c45d]"
            >
              Search
            </button>
          </label>
        </form>

        <nav className="hidden items-center gap-7 xl:flex">
          <Link to="/" className={navLinkClass(isActive("/") && location.pathname === "/")}>
            Home
          </Link>
          <Link to="/shop" className={navLinkClass(location.pathname.startsWith("/shop"))}>
            Shop
          </Link>
          <div className="group relative">
            <button
              type="button"
              className="flex items-center gap-1 text-sm font-medium text-[#24160f] transition-colors hover:text-[#a56c25]"
              aria-haspopup="true"
            >
              Collections
              <ChevronDown
                size={16}
                className="transition-transform duration-300 group-hover:rotate-180"
              />
            </button>
            <div className="invisible absolute left-0 top-full z-20 w-52 pt-3 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <div className="overflow-hidden rounded-2xl border border-black/8 bg-[#fffaf1] shadow-xl">
                {collections.map((item) => (
                  <Link
                    key={item.category}
                    to={`/shop?category=${encodeURIComponent(item.category)}`}
                    className="block px-4 py-3 text-sm text-[#24160f] transition hover:bg-[#f7f1e5] hover:text-[#a56c25]"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </nav>

        <div className="flex items-center gap-0.5 sm:gap-1">
          <button
            type="button"
            onClick={toggleSearch}
            aria-label={isSearchOpen ? "Close search" : "Open search"}
            aria-expanded={isSearchOpen}
            className="rounded-full p-2 transition hover:bg-black/5 lg:hidden"
          >
            {isSearchOpen ? (
              <X size={20} strokeWidth={1.7} className="text-[#a56c25]" />
            ) : (
              <Search size={20} strokeWidth={1.7} />
            )}
          </button>

          <Link
            to="/wishlist"
            aria-label={`Wishlist with ${wishlistCount} items`}
            className="relative rounded-full p-2 transition hover:bg-black/5"
          >
            <Heart size={20} strokeWidth={1.7} />
            {wishlistCount > 0 && (
              <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-[#c99b4a]" />
            )}
          </Link>

          <Link
            to="/account"
            aria-label="Account"
            className="hidden rounded-full p-2 transition hover:bg-black/5 sm:block"
          >
            <User size={20} strokeWidth={1.7} />
          </Link>

          <Link
            to="/cart"
            aria-label={`Shopping cart with ${cartCount} items`}
            className="relative rounded-full p-2 transition hover:bg-black/5"
          >
            <ShoppingBag size={20} strokeWidth={1.7} />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f6d77c] px-1 text-[10px] font-bold text-[#24160f]">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {isSearchOpen && (
        <div className="border-t border-black/8 bg-[#fffaf1] lg:hidden">
          <div className="mx-auto max-w-3xl px-4 py-5 sm:px-6">
            <form onSubmit={handleSearch}>
              <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 focus-within:border-[#c99b4a] focus-within:ring-4 focus-within:ring-[#c99b4a]/12">
                <Search size={18} className="shrink-0 text-black/40" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search traditional girlswear…"
                  autoFocus
                  aria-label="Search products"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-black/30"
                />
                <button
                  type="submit"
                  aria-label="Search"
                  className="rounded-full bg-[#f6d77c] p-2 text-[#24160f]"
                >
                  <Search size={16} strokeWidth={1.7} />
                </button>
              </div>
            </form>
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#a56c25]">
              Popular searches
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {collections.map((item) => (
                <button
                  key={item.category}
                  type="button"
                  onClick={() => handlePopularSearch(item.category)}
                  className="rounded-full border border-black/10 px-3.5 py-2 text-xs font-medium transition hover:border-[#c99b4a] hover:bg-[#f6d77c]"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {isMenuOpen && (
        <nav className="border-t border-black/8 bg-[#fffaf1] xl:hidden">
          <div className="mx-auto flex max-h-[calc(100vh-8rem)] max-w-7xl flex-col overflow-y-auto px-4 py-3 sm:px-6">
            <Link to="/" onClick={closeMenu} className="border-b border-black/8 py-4 text-sm font-medium">
              Home
            </Link>
            <Link to="/shop" onClick={closeMenu} className="border-b border-black/8 py-4 text-sm font-medium">
              Shop
            </Link>
            <p className="pt-4 pb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#a56c25]">
              Collections
            </p>
            {collections.map((item) => (
              <Link
                key={item.category}
                to={`/shop?category=${encodeURIComponent(item.category)}`}
                onClick={closeMenu}
                className="border-b border-black/8 py-3.5 text-sm"
              >
                {item.label}
              </Link>
            ))}
            <Link to="/account" onClick={closeMenu} className="py-4 text-sm font-medium">
              My Account
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}

export default Header;
