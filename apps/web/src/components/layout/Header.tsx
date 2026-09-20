// ===================================
// 1. HEADER_IMPROVED.tsx
// ===================================

import {
  Heart,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useCartStore } from "../../store/cartStore";

function Header() {
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const cartItems = useCartStore((state) => state.items);

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const toggleSearch = () => {
    setIsSearchOpen((current) => !current);
    setIsMenuOpen(false);
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const query = searchQuery.trim();

    if (!query) {
      return;
    }

    setIsSearchOpen(false);
    setIsMenuOpen(false);

    navigate(`/shop?search=${encodeURIComponent(query)}`);
  };

  const handlePopularSearch = (category: string) => {
    setIsSearchOpen(false);
    setSearchQuery("");

    navigate(`/shop?category=${encodeURIComponent(category)}`);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#24160f]/10 bg-[#fffaf1]/95 shadow-[0_10px_30px_rgba(55,35,20,0.05)] backdrop-blur-md transition-all duration-300">
      <div className="bg-[#24160f] px-4 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-[#f6d77c] sm:text-[11px]">
        Little traditions, beautifully made · NB to 10Y
      </div>

      <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => {
            setIsMenuOpen((current) => !current);
            setIsSearchOpen(false);
          }}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
          className="rounded-full p-2 transition-all duration-200 hover:bg-black/5 active:scale-95 md:hidden"
        >
          {isMenuOpen ? (
            <X size={22} strokeWidth={1.7} className="transition-transform duration-300" />
          ) : (
            <Menu size={22} strokeWidth={1.7} className="transition-transform duration-300" />
          )}
        </button>

        {/* Brand Logo */}
        <Link
          to="/"
          onClick={() => {
            closeMenu();
            closeSearch();
          }}
          className="group inline-flex items-center gap-2.5 text-[#24160f] transition-all duration-300 hover:text-[#a56c25]"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#c99b4a]/60 bg-[#f8e8bd] font-serif text-lg font-bold italic text-[#8b541d] shadow-sm">
            N
          </span>
          <span className="leading-none">
            <span className="block font-serif text-xl font-semibold tracking-[0.12em]">NILA</span>
            <span className="mt-1 block text-[8px] font-semibold uppercase tracking-[0.25em] text-[#a56c25]">Girlswear</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-10 md:flex">
          <Link
            to="/"
            className="relative text-sm font-medium text-[#0B0B0B] transition-colors duration-300 hover:text-[#C9A227]"
          >
            Home
            <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-[#D4AF37] transition-all duration-300 hover:w-full" />
          </Link>

          <Link
            to="/shop"
            className="relative text-sm font-medium text-[#0B0B0B] transition-colors duration-300 hover:text-[#C9A227]"
          >
            Shop
            <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-[#D4AF37] transition-all duration-300 hover:w-full" />
          </Link>

          <div className="group relative">
            <button className="flex items-center gap-1 text-sm font-medium text-[#0B0B0B] transition-colors duration-300 hover:text-[#C9A227]">
              Collections
              <ChevronDown size={16} className="transition-transform duration-300 group-hover:rotate-180" />
            </button>
            
            {/* Dropdown Menu */}
            <div className="absolute left-0 mt-0 hidden w-48 bg-[#FFF9ED] shadow-xl group-hover:block rounded-lg border border-black/5 overflow-hidden">
              <Link
                to="/shop?category=Cotton%20Frocks"
                className="block px-4 py-3 text-sm text-[#0B0B0B] hover:bg-[#F7F3EA] transition-colors"
              >
                Cotton Frocks
              </Link>
              <Link
                to="/shop?category=Pattu%20Frocks"
                className="block px-4 py-3 text-sm text-[#0B0B0B] hover:bg-[#F7F3EA] transition-colors"
              >
                Pattu Frocks
              </Link>
              <Link
                to="/shop?category=Cotton%20Pavadai"
                className="block px-4 py-3 text-sm text-[#0B0B0B] hover:bg-[#F7F3EA] transition-colors"
              >
                Cotton Pavadai
              </Link>
              <Link
                to="/shop?category=Pattu%20Pavadai"
                className="block px-4 py-3 text-sm text-[#0B0B0B] hover:bg-[#F7F3EA] transition-colors border-t border-black/5"
              >
                Pattu Pavadai
              </Link>
            </div>
          </div>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-3">

          {/* Search Button */}
          <button
            type="button"
            onClick={toggleSearch}
            aria-label={isSearchOpen ? "Close search" : "Open search"}
            aria-expanded={isSearchOpen}
            className="rounded-full p-2 transition-all duration-200 hover:bg-black/5 active:scale-95"
          >
            {isSearchOpen ? (
              <X size={20} strokeWidth={1.7} className="text-[#C9A227]" />
            ) : (
              <Search size={20} strokeWidth={1.7} />
            )}
          </button>

          {/* Wishlist */}
          <Link
            to="/wishlist"
            aria-label="Wishlist"
            className="rounded-full p-2 transition-all duration-200 hover:bg-black/5 active:scale-95"
          >
            <Heart size={20} strokeWidth={1.7} />
          </Link>

          {/* Account */}
          <Link
            to="/account"
            aria-label="Account"
            className="hidden rounded-full p-2 transition-all duration-200 hover:bg-black/5 active:scale-95 sm:block"
          >
            <User size={20} strokeWidth={1.7} />
          </Link>

          {/* Cart */}
          <div className="relative">
            <Link
              to="/cart"
              aria-label={`Shopping cart with ${cartCount} items`}
              className="block rounded-full p-2 transition-all duration-200 hover:bg-black/5 active:scale-95"
            >
              <ShoppingBag size={20} strokeWidth={1.7} />

              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-br from-[#D4AF37] to-[#C9A227] px-1 text-[10px] font-bold text-[#0B0B0B] shadow-md ">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Search Panel - Enhanced */}
      {isSearchOpen && (
        <div className="animate-in fade-in slide-in-from-top-2 border-t border-black/8 bg-[#FFF9ED]">
          <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">

            {/* Search Form */}
            <form onSubmit={handleSearch}>
              <div className="flex items-center gap-3 rounded-lg border border-black/12 bg-white/50 backdrop-blur px-4 py-3.5 transition-all duration-300 focus-within:border-[#D4AF37] focus-within:shadow-lg focus-within:shadow-[#D4AF37]/10">
                <Search
                  size={20}
                  strokeWidth={1.7}
                  className="shrink-0 text-black/40"
                />

                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search traditional girlswear..."
                  autoFocus
                  aria-label="Search products"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-black/30"
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search"
                    className="shrink-0 rounded-full p-1.5 transition-all duration-200 hover:bg-black/5 active:scale-90"
                  >
                    <X size={17} strokeWidth={1.7} />
                  </button>
                )}

                <button
                  type="submit"
                  aria-label="Search"
                  className="shrink-0 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#C9A227] p-2.5 text-[#0B0B0B] transition-all duration-300 hover:shadow-lg hover:shadow-[#D4AF37]/20 active:scale-95"
                >
                  <Search size={17} strokeWidth={1.7} />
                </button>
              </div>
            </form>

            {/* Popular Searches */}
            <div className="mt-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C9A227]">
                ✨ Popular Searches
              </p>

              <div className="mt-4 flex flex-wrap gap-2.5">

                <button
                  type="button"
                  onClick={() => handlePopularSearch("Cotton Frocks")}
                  className="group relative overflow-hidden rounded-lg border border-black/10 px-4 py-2.5 text-xs font-medium transition-all duration-300 hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0B0B0B]"
                >
                  <span className="relative z-10">Cotton Frocks</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePopularSearch("Pattu Frocks")}
                  className="group relative overflow-hidden rounded-lg border border-black/10 px-4 py-2.5 text-xs font-medium transition-all duration-300 hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0B0B0B]"
                >
                  <span className="relative z-10">Pattu Frocks</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePopularSearch("Cotton Pavadai")}
                  className="group relative overflow-hidden rounded-lg border border-black/10 px-4 py-2.5 text-xs font-medium transition-all duration-300 hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0B0B0B]"
                >
                  <span className="relative z-10">Cotton Pavadai</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePopularSearch("Pattu Pavadai")}
                  className="group relative overflow-hidden rounded-lg border border-black/10 px-4 py-2.5 text-xs font-medium transition-all duration-300 hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0B0B0B]"
                >
                  <span className="relative z-10">Pattu Pavadai</span>
                </button>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Navigation - Enhanced */}
      {isMenuOpen && (
        <nav className="animate-in slide-in-from-top-4 border-t border-black/8 bg-[#FFF9ED]">
          <div className="mx-auto flex max-w-7xl flex-col px-4 py-4 sm:px-6">

            <Link
              to="/"
              onClick={closeMenu}
              className="border-b border-black/8 py-4 text-sm font-medium transition-colors duration-300 hover:text-[#C9A227]"
            >
              Home
            </Link>

            <Link
              to="/shop"
              onClick={closeMenu}
              className="border-b border-black/8 py-4 text-sm font-medium transition-colors duration-300 hover:text-[#C9A227]"
            >
              Shop
            </Link>

            <Link
              to="/shop"
              onClick={closeMenu}
              className="border-b border-black/8 py-4 text-sm font-medium transition-colors duration-300 hover:text-[#C9A227]"
            >
              Collections
            </Link>

            <Link
              to="/account"
              onClick={closeMenu}
              className="py-4 text-sm font-medium transition-colors duration-300 hover:text-[#C9A227]"
            >
              My Account
            </Link>

          </div>
        </nav>
      )}
    </header>
  );
}

export default Header;
