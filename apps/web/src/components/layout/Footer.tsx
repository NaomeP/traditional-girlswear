import { Heart } from "lucide-react";
import { Link } from "react-router";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-[#0B0B0B] to-[#000000] text-[#FFF9ED]">
      {/* ================================
          MAIN FOOTER
      ================================= */}

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-12 sm:grid-cols-2 md:grid-cols-4">
          {/* ================================
              BRAND
          ================================= */}

          <div>
            <Link to="/" className="group inline-flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d4af37]/55 bg-[#fff9ed] font-serif text-xl font-bold italic text-[#8b541d] transition-transform group-hover:rotate-6">
                N
              </span>
              <span>
                <span className="block font-serif text-2xl font-semibold tracking-[0.14em] text-[#fff9ed] transition-colors duration-300 group-hover:text-[#d4af37]">
                  NILA
                </span>
                <span className="block text-[9px] font-semibold uppercase tracking-[0.24em] text-[#d4af37]">
                  Girlswear
                </span>
              </span>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-7 text-[#FFF9ED]/70">
              A little wardrobe for grand celebrations, everyday comfort and
              the memories in between.
            </p>

            {/* Social Links */}
            <div className="mt-6 flex gap-4">
              {/* Instagram */}
              <a
                href="#"
                aria-label="Instagram"
                className="group inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF9ED]/10 text-sm font-bold text-[#FFF9ED] transition-all duration-300 hover:bg-[#D4AF37] hover:text-[#0B0B0B]"
              >
                IG
              </a>

              {/* Facebook */}
              <a
                href="#"
                aria-label="Facebook"
                className="group inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF9ED]/10 text-sm font-bold text-[#FFF9ED] transition-all duration-300 hover:bg-[#D4AF37] hover:text-[#0B0B0B]"
              >
                f
              </a>

              {/* Twitter */}
              <a
                href="#"
                aria-label="Twitter"
                className="group inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF9ED]/10 text-sm font-bold text-[#FFF9ED] transition-all duration-300 hover:bg-[#D4AF37] hover:text-[#0B0B0B]"
              >
                X
              </a>
            </div>
          </div>

          {/* ================================
              SHOP
          ================================= */}

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#D4AF37]">
              Shop
            </h3>

            <div className="mt-6 space-y-3">
              <Link
                to="/shop"
                className="group flex items-center gap-2 text-sm text-[#FFF9ED]/70 transition-colors duration-300 hover:text-[#D4AF37]"
              >
                <span className="h-1 w-1 rounded-full bg-[#D4AF37] transition-all duration-300 group-hover:w-2" />
                All Products
              </Link>

              <Link
                to="/shop?category=Cotton%20Frocks"
                className="group flex items-center gap-2 text-sm text-[#FFF9ED]/70 transition-colors duration-300 hover:text-[#D4AF37]"
              >
                <span className="h-1 w-1 rounded-full bg-[#D4AF37] transition-all duration-300 group-hover:w-2" />
                Cotton Collection
              </Link>

              <Link
                to="/shop?category=Pattu%20Frocks"
                className="group flex items-center gap-2 text-sm text-[#FFF9ED]/70 transition-colors duration-300 hover:text-[#D4AF37]"
              >
                <span className="h-1 w-1 rounded-full bg-[#D4AF37] transition-all duration-300 group-hover:w-2" />
                Pattu Collection
              </Link>

              <Link
                to="/wishlist"
                className="group flex items-center gap-2 text-sm text-[#FFF9ED]/70 transition-colors duration-300 hover:text-[#D4AF37]"
              >
                <span className="h-1 w-1 rounded-full bg-[#D4AF37] transition-all duration-300 group-hover:w-2" />
                My Wishlist
              </Link>
            </div>
          </div>

          {/* ================================
              CUSTOMER SERVICE
          ================================= */}

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#D4AF37]">
              Customer Service
            </h3>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                className="group flex items-center gap-2 text-sm text-[#FFF9ED]/70 transition-colors duration-300 hover:text-[#D4AF37]"
              >
                <span className="h-1 w-1 rounded-full bg-[#D4AF37] transition-all duration-300 group-hover:w-2" />
                Shipping & Delivery
              </button>

              <button
                type="button"
                className="group flex items-center gap-2 text-sm text-[#FFF9ED]/70 transition-colors duration-300 hover:text-[#D4AF37]"
              >
                <span className="h-1 w-1 rounded-full bg-[#D4AF37] transition-all duration-300 group-hover:w-2" />
                Returns & Refunds
              </button>

              <button
                type="button"
                className="group flex items-center gap-2 text-sm text-[#FFF9ED]/70 transition-colors duration-300 hover:text-[#D4AF37]"
              >
                <span className="h-1 w-1 rounded-full bg-[#D4AF37] transition-all duration-300 group-hover:w-2" />
                Size Guide
              </button>

              <button
                type="button"
                className="group flex items-center gap-2 text-sm text-[#FFF9ED]/70 transition-colors duration-300 hover:text-[#D4AF37]"
              >
                <span className="h-1 w-1 rounded-full bg-[#D4AF37] transition-all duration-300 group-hover:w-2" />
                Contact Us
              </button>
            </div>
          </div>

          {/* ================================
              ACCOUNT
          ================================= */}

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#D4AF37]">
              Account
            </h3>

            <div className="mt-6 space-y-3">
              <Link
                to="/login"
                className="group flex items-center gap-2 text-sm text-[#FFF9ED]/70 transition-colors duration-300 hover:text-[#D4AF37]"
              >
                <span className="h-1 w-1 rounded-full bg-[#D4AF37] transition-all duration-300 group-hover:w-2" />
                Login
              </Link>

              <Link
                to="/register"
                className="group flex items-center gap-2 text-sm text-[#FFF9ED]/70 transition-colors duration-300 hover:text-[#D4AF37]"
              >
                <span className="h-1 w-1 rounded-full bg-[#D4AF37] transition-all duration-300 group-hover:w-2" />
                Create Account
              </Link>

              <Link
                to="/account"
                className="group flex items-center gap-2 text-sm text-[#FFF9ED]/70 transition-colors duration-300 hover:text-[#D4AF37]"
              >
                <span className="h-1 w-1 rounded-full bg-[#D4AF37] transition-all duration-300 group-hover:w-2" />
                My Account
              </Link>

              <Link
                to="/account/orders"
                className="group flex items-center gap-2 text-sm text-[#FFF9ED]/70 transition-colors duration-300 hover:text-[#D4AF37]"
              >
                <span className="h-1 w-1 rounded-full bg-[#D4AF37] transition-all duration-300 group-hover:w-2" />
                My Orders
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ================================
          BOTTOM FOOTER
      ================================= */}

      <div className="border-t border-[#FFF9ED]/10 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[#FFF9ED]/50">
              © {currentYear} NILA GIRLSWEAR. All rights reserved.
            </p>

            <div className="flex flex-wrap gap-x-6 gap-y-3">
              <button
                type="button"
                className="text-sm text-[#FFF9ED]/50 transition-colors duration-300 hover:text-[#D4AF37]"
              >
                Privacy Policy
              </button>

              <button
                type="button"
                className="text-sm text-[#FFF9ED]/50 transition-colors duration-300 hover:text-[#D4AF37]"
              >
                Terms of Service
              </button>

              <button
                type="button"
                className="flex items-center gap-1 text-sm text-[#FFF9ED]/50 transition-colors duration-300 hover:text-[#D4AF37]"
              >
                Made with
                <Heart size={14} fill="currentColor" />
                in India
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
