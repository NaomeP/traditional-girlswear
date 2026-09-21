import { Heart, Instagram } from "lucide-react";
import { Link } from "react-router";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#24160f] text-[#fffaf1]">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="inline-flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d4af37]/55 bg-[#fffaf1] font-serif text-xl font-bold italic text-[#8b541d]">
                N
              </span>
              <span>
                <span className="block font-serif text-2xl font-semibold tracking-[0.14em]">
                  NILA
                </span>
                <span className="block text-[9px] font-semibold uppercase tracking-[0.24em] text-[#f6d77c]">
                  Girlswear
                </span>
              </span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-7 text-[#fffaf1]/70">
              A little wardrobe for grand celebrations, everyday comfort and
              the memories in between.
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-[#f6d77c] hover:text-[#24160f]"
              >
                <Instagram size={16} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#f6d77c]">
              Shop
            </h3>
            <div className="mt-6 space-y-3">
              <Link to="/shop" className="block text-sm text-[#fffaf1]/70 hover:text-[#f6d77c]">
                All products
              </Link>
              <Link
                to="/shop?category=Cotton%20Frocks"
                className="block text-sm text-[#fffaf1]/70 hover:text-[#f6d77c]"
              >
                Cotton collection
              </Link>
              <Link
                to="/shop?category=Pattu%20Frocks"
                className="block text-sm text-[#fffaf1]/70 hover:text-[#f6d77c]"
              >
                Pattu collection
              </Link>
              <Link to="/wishlist" className="block text-sm text-[#fffaf1]/70 hover:text-[#f6d77c]">
                Wishlist
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#f6d77c]">
              Customer service
            </h3>
            <div className="mt-6 space-y-3">
              <Link to="/help#shipping" className="block text-sm text-[#fffaf1]/70 hover:text-[#f6d77c]">
                Shipping & delivery
              </Link>
              <Link to="/help#returns" className="block text-sm text-[#fffaf1]/70 hover:text-[#f6d77c]">
                Returns & refunds
              </Link>
              <Link to="/help#size-guide" className="block text-sm text-[#fffaf1]/70 hover:text-[#f6d77c]">
                Size guide
              </Link>
              <Link to="/help#contact" className="block text-sm text-[#fffaf1]/70 hover:text-[#f6d77c]">
                Contact us
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#f6d77c]">
              Account
            </h3>
            <div className="mt-6 space-y-3">
              <Link to="/login" className="block text-sm text-[#fffaf1]/70 hover:text-[#f6d77c]">
                Login
              </Link>
              <Link to="/register" className="block text-sm text-[#fffaf1]/70 hover:text-[#f6d77c]">
                Create account
              </Link>
              <Link to="/account" className="block text-sm text-[#fffaf1]/70 hover:text-[#f6d77c]">
                My account
              </Link>
              <Link to="/account/orders" className="block text-sm text-[#fffaf1]/70 hover:text-[#f6d77c]">
                My orders
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-7 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[#fffaf1]/50">
            © {currentYear} NILA Girlswear. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5 text-sm text-[#fffaf1]/50">
            Made with
            <Heart size={14} fill="currentColor" className="text-[#f6d77c]" />
            in India
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
