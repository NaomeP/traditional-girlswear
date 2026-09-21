import { Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router";
import { useCartStore } from "../store/cartStore";

function Cart() {
  const items = useCartStore((state) => state.items);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  const subtotal = items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  if (items.length === 0) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center bg-[#FFF9ED] px-4 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight">
            Your Cart Is Empty
          </h1>

          <p className="mt-3 text-sm text-black/60">
            Add something beautiful to your little one's wardrobe.
          </p>

            <Link
              to="/shop"
              className="mt-7 inline-flex rounded-full bg-[#24160f] px-7 py-3.5 text-sm font-semibold text-[#fffaf1] transition hover:bg-[#3a2418]"
            >
            Continue Shopping
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#f7f8f8] px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C9A227]">
            Your Selection
          </p>

          <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
            Shopping Cart
          </h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px] lg:gap-10">
          <div className="space-y-6">
            {items.map((item) => (
              <article
                key={`${item.product.id}-${item.size}`}
                className="flex gap-4 rounded-xl border border-black/10 bg-white p-3 shadow-sm sm:gap-6 sm:p-5"
              >
                <Link
                  to={`/product/${item.product.slug}`}
                  className="h-32 w-24 shrink-0 overflow-hidden bg-[#F7F3EA] sm:h-40 sm:w-32"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="h-full w-full object-cover"
                  />
                </Link>

                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#C9A227]">
                    {item.product.category}
                  </p>

                  <Link to={`/product/${item.product.slug}`}>
                    <h2 className="mt-1 text-sm font-semibold leading-6 sm:text-base">
                      {item.product.name}
                    </h2>
                  </Link>

                  <p className="mt-2 text-xs text-black/60">
                    Size: <span className="font-medium text-black">{item.size}</span>
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    ₹{item.product.price.toLocaleString("en-IN")}
                  </p>

                  <div className="mt-4 flex items-center justify-between gap-4">
                    <div className="flex items-center rounded-full border border-black/15">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            item.size,
                            item.quantity - 1
                          )
                        }
                        aria-label="Decrease quantity"
                        className="p-2.5 transition hover:bg-black/5"
                      >
                        <Minus size={14} />
                      </button>

                      <span className="min-w-9 text-center text-sm font-medium">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            item.size,
                            item.quantity + 1
                          )
                        }
                        aria-label="Increase quantity"
                        className="p-2.5 transition hover:bg-black/5"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        removeFromCart(item.product.id, item.size)
                      }
                      className="flex items-center gap-1.5 text-xs text-black/50 transition hover:text-red-600"
                    >
                      <Trash2 size={15} />
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="h-fit rounded-2xl border border-black/10 bg-white p-6 shadow-[0_8px_28px_rgba(55,35,20,0.08)] sm:p-8 lg:sticky lg:top-24">
            <h2 className="text-lg font-semibold">Order Summary</h2>

            <div className="mt-6 space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-black/60">Subtotal</span>
                <span className="font-medium">
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-black/60">Shipping</span>
                <span className="font-medium">Calculated at checkout</span>
              </div>
            </div>

            <div className="my-6 h-px bg-black/10" />

            <div className="flex items-center justify-between">
              <span className="font-semibold">Total</span>
              <span className="text-lg font-semibold">
                ₹{subtotal.toLocaleString("en-IN")}
              </span>
            </div>

            <Link
              to="/checkout"
              className="btn-primary mt-7 w-full"
            >
              Proceed to Checkout
            </Link>

            <Link
              to="/shop"
              className="btn-ghost mt-3 w-full"
            >
              Continue Shopping
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default Cart;