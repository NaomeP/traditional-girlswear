import { Mail, MapPin, RefreshCcw, Ruler, Truck } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "react-router";

const sections = [
  {
    id: "shipping",
    icon: Truck,
    title: "Shipping & delivery",
    body: "Orders are typically packed within 1–2 working days. Delivery usually takes 3–7 working days depending on your location. You will receive tracking details by email once the order ships.",
  },
  {
    id: "returns",
    icon: RefreshCcw,
    title: "Returns & refunds",
    body: "Unworn items with tags attached can be returned within 7 days of delivery. Start a return from My Orders. Refunds are issued to the original payment method after the item is inspected.",
  },
  {
    id: "size-guide",
    icon: Ruler,
    title: "Size guide",
    body: "Our sizes run from newborn through 10 years. If your child is between sizes, we recommend choosing the larger size for comfort and growth. Product pages include available sizes for each style.",
  },
  {
    id: "contact",
    icon: Mail,
    title: "Contact us",
    body: "Need help with an order? Write to hello@nilagirlswear.com and include your order number. We usually reply within one working day.",
  },
];

function Help() {
  const location = useLocation();

  useEffect(() => {
    const id = location.hash.replace("#", "");
    if (!id) return;
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [location.hash]);

  return (
    <section className="bg-[#fffaf1] px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#a56c25]">
          Customer care
        </p>
        <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-[#24160f]">
          How can we help?
        </h1>
        <p className="mt-3 text-sm leading-7 text-black/60">
          Simple answers for shipping, returns, sizing, and getting in touch.
        </p>

        <div className="mt-10 space-y-5">
          {sections.map(({ id, icon: Icon, title, body }) => (
            <article
              key={id}
              id={id}
              className="scroll-mt-28 rounded-3xl border border-[#24160f]/10 bg-white p-6 shadow-[0_10px_30px_rgba(55,35,20,0.05)]"
            >
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f8e8bd] text-[#8b541d]">
                  <Icon size={20} strokeWidth={1.7} />
                </span>
                <div>
                  <h2 className="font-serif text-2xl font-semibold text-[#24160f]">{title}</h2>
                  <p className="mt-2 text-sm leading-7 text-black/65">{body}</p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-8 flex items-center gap-2 text-sm text-black/50">
          <MapPin size={16} />
          Made with care in India
        </p>
      </div>
    </section>
  );
}

export default Help;
