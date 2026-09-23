import { Camera, Heart } from "lucide-react";
import { Link } from "react-router";
import type { ReactNode } from "react";

type FooterLinkGroupProps = {
  title: string;
  children: ReactNode;
};

function FooterLinkGroup({ title, children }: FooterLinkGroupProps) {
  return (
    <div>
      <h3 className="hidden text-sm font-bold uppercase tracking-wider text-[#f6d77c] sm:block">
        {title}
      </h3>
      <div className="hidden space-y-2 text-sm sm:mt-6 sm:block sm:space-y-3">
        {children}
      </div>
      <details className="border-b border-white/10 py-1.5 sm:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between py-2 text-xs font-bold uppercase tracking-wider text-[#f6d77c]">
          {title}
          <span aria-hidden="true" className="text-base font-normal text-[#fffaf1]/70">+</span>
        </summary>
        <div className="space-y-2 pb-2 text-xs [&_a]:block [&_a]:py-1">
          {children}
        </div>
      </details>
    </div>
  );
}

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#24160f] text-[#fffaf1]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:gap-12 lg:grid-cols-4">
          <div className="col-span-2 lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d4af37]/55 bg-[#fffaf1] font-serif text-xl font-bold italic text-[#8b541d]">
                N
              </span>
              <span>
                <span className="block font-serif text-2xl font-semibold tracking-[0.14em]">NILA</span>
                <span className="block text-[9px] font-semibold uppercase tracking-[0.24em] text-[#f6d77c]">Girlswear</span>
              </span>
            </Link>
            <p className="mt-3 max-w-sm text-xs leading-5 text-[#fffaf1]/70 sm:mt-5 sm:text-sm sm:leading-7">
              A little wardrobe for grand celebrations, everyday comfort and
              the memories in between.
            </p>
            <div className="mt-3 flex gap-3 sm:mt-6">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-[#f6d77c] hover:text-[#24160f]"
              >
                <Camera size={16} />
              </a>
            </div>
          </div>

          <FooterLinkGroup title="Shop">
            <Link to="/shop" className="text-[#fffaf1]/70 hover:text-[#f6d77c]">All products</Link>
            <Link to="/shop?category=Cotton%20Frocks" className="text-[#fffaf1]/70 hover:text-[#f6d77c]">Cotton collection</Link>
            <Link to="/shop?category=Pattu%20Frocks" className="text-[#fffaf1]/70 hover:text-[#f6d77c]">Pattu collection</Link>
            <Link to="/wishlist" className="text-[#fffaf1]/70 hover:text-[#f6d77c]">Wishlist</Link>
          </FooterLinkGroup>

          <FooterLinkGroup title="Customer service">
            <Link to="/help#shipping" className="text-[#fffaf1]/70 hover:text-[#f6d77c]">Shipping &amp; delivery</Link>
            <Link to="/help#returns" className="text-[#fffaf1]/70 hover:text-[#f6d77c]">Returns &amp; refunds</Link>
            <Link to="/help#size-guide" className="text-[#fffaf1]/70 hover:text-[#f6d77c]">Size guide</Link>
            <Link to="/help#contact" className="text-[#fffaf1]/70 hover:text-[#f6d77c]">Contact us</Link>
          </FooterLinkGroup>

          <FooterLinkGroup title="Account">
            <Link to="/login" className="text-[#fffaf1]/70 hover:text-[#f6d77c]">Login</Link>
            <Link to="/register" className="text-[#fffaf1]/70 hover:text-[#f6d77c]">Create account</Link>
            <Link to="/account" className="text-[#fffaf1]/70 hover:text-[#f6d77c]">My account</Link>
            <Link to="/account/orders" className="text-[#fffaf1]/70 hover:text-[#f6d77c]">My orders</Link>
          </FooterLinkGroup>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-4 sm:px-6 sm:py-7 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <p className="text-xs text-[#fffaf1]/50 sm:text-sm">
            © {currentYear} NILA Girlswear. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5 text-xs text-[#fffaf1]/50 sm:text-sm">
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
