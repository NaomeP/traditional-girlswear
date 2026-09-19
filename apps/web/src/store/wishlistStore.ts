
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  mapApiProductToProduct,
  type Product,
} from "../data/products";
import { getProducts } from "../services/productService";
import {
  getWishlist,
  addWishlistItem,
  removeWishlistItem,
  clearWishlist as clearWishlistApi,
} from "../services/wishlistService";

type WishlistStore = {
  items: Product[];
  loading: boolean;

  loadWishlist: () => Promise<void>;
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => Promise<void>;
  setItems: (items: Product[]) => void;
};

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,

      setItems: (items) =>
        set({
          items,
        }),

      loadWishlist: async () => {
        set({ loading: true });

        try {
          const wishlistItems = await getWishlist();

          if (wishlistItems.length === 0) {
            set({
              items: [],
              loading: false,
            });
            return;
          }

          const apiProducts = await getProducts();

          const variantIds = new Set(
            wishlistItems.map(
              (item) => item.variantId,
            ),
          );

          const wishlistProducts = apiProducts
            .filter((product) =>
              product.variants.some((variant) =>
                variantIds.has(variant.id),
              ),
            )
            .map(mapApiProductToProduct);

          set({
            items: wishlistProducts,
            loading: false,
          });
        } catch (error) {
          console.error(
            "Failed to load wishlist:",
            error,
          );

          set({
            loading: false,
          });
        }
      },

      addToWishlist: async (product) => {
        const variant =
          product.variants?.find(
            (item) => item.stock > 0,
          ) ?? product.variants?.[0];

        if (!variant) {
          return;
        }

        await addWishlistItem(variant.id);

        set((state) => {
          const alreadyExists = state.items.some(
            (item) => item.id === product.id,
          );

          if (alreadyExists) {
            return state;
          }

          return {
            items: [...state.items, product],
          };
        });
      },

      removeFromWishlist: async (productId) => {
        const product = get().items.find(
          (item) => item.id === productId,
        );

        if (!product) {
          return;
        }

        const variant =
          product.variants?.[0];

        if (!variant) {
          return;
        }

        await removeWishlistItem(variant.id);

        set((state) => ({
          items: state.items.filter(
            (item) => item.id !== productId,
          ),
        }));
      },

      isInWishlist: (productId) =>
        get().items.some(
          (item) => item.id === productId,
        ),

      clearWishlist: async () => {
        await clearWishlistApi();

        set({
          items: [],
        });
      },
    }),
    {
      name: "traditional-girlswear-wishlist",
    },
  ),
);

