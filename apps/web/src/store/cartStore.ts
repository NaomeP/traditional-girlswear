import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "../data/products";

export type CartItem = {
  product: Product;
  variantId: string;
  size: string;
  quantity: number;
};

type CartStore = {
  items: CartItem[];

  addToCart: (
    product: Product,
    size: string,
    quantity: number,
  ) => void;

  removeFromCart: (
    productId: string,
    size: string,
  ) => void;

  updateQuantity: (
    productId: string,
    size: string,
    quantity: number,
  ) => void;

  clearCart: () => void;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],

      addToCart: (product, size, quantity) =>
        set((state) => {
          const variant = product.variants.find(
            (item) => item.size === size && Number(item.stock) > 0,
          ) ?? product.variants.find(
            (item) => item.size === size,
          );

          if (!variant) {
            console.error(
              "Selected product variant not found:",
              {
                productId: product.id,
                size,
              },
            );

            return state;
          }

          if (Number(variant.stock) <= 0) {
            console.warn("Cannot add an out-of-stock variant to cart", variant.id);
            return state;
          }
          const existingItem = state.items.find(
            (item) =>
              item.product.id === product.id &&
              item.variantId === variant.id,
          );

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id &&
                item.variantId === variant.id
                  ? {
                      ...item,
                      quantity: item.quantity + quantity,
                    }
                  : item,
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                product,
                variantId: variant.id,
                size: variant.size,
                quantity,
              },
            ],
          };
        }),

      removeFromCart: (productId, size) =>
        set((state) => ({
          items: state.items.filter(
            (item) =>
              !(
                item.product.id === productId &&
                item.size === size
              ),
          ),
        })),

      updateQuantity: (
        productId,
        size,
        quantity,
      ) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter(
                  (item) =>
                    !(
                      item.product.id === productId &&
                      item.size === size
                    )
                )
              : state.items.map((item) =>
                  item.product.id === productId &&
                  item.size === size
                    ? {
                        ...item,
                        quantity,
                      }
                    : item,
                ),
        })),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: "traditional-girlswear-cart",
    },
  ),
);