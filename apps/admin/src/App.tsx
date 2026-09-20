import {
  useEffect,
  useMemo,
  useState,
} from "react";

//import OrderManagement from "./components/OrderManagement";
import AgeGroupSelector from "./components/AgeGroupSelector";
import type { FormEvent } from "react";
import AdminReturnManagement from "./components/AdminReturnManagement";
import AdminDashboard from "./components/AdminDashboard";
import HomePageManager from "./components/HomePageManager";
import {
  createAdminProduct,
  deleteAdminProduct,
  getAdminProducts,
  updateAdminProduct,
} from "./services/adminProductService";

import {
  createAdminCategory,
  deleteAdminCategory,
  getAdminCategories,
} from "./services/adminCategoryService";

import {
  uploadProductImage,
} from "./services/imageUploadService";

import {
  getAdminOrders,
  updateAdminOrderStatus,
  updateAdminShipment,
  ADMIN_ORDER_STATUSES,
  SHIPMENT_STATUSES,
} from "./services/adminOrderService";

import type {
  AdminOrder,
  ShipmentStatus,
} from "./services/adminOrderService";

import {
  createAdminCoupon,
  deleteAdminCoupon,
  getAdminCoupons,
  updateAdminCoupon,
} from "./services/adminCouponService";

import type {
  AdminCoupon,
  AdminCouponInput,
} from "./services/adminCouponService";

import type {
  Category,
  Product,
  ProductInput,
  ProductStatus,
  ProductVariantInput,
} from "./types/product";

const EMPTY_VARIANT: ProductVariantInput = {
  size: "",
  color: "Black",
  sku: "",
  price: 799,
  stock: 0,
};

const EMPTY_PRODUCT: ProductInput = {
  name: "",
  slug: "",
  sku: "",
  description: "",
  material: "",
  color: "",
  status: "ACTIVE",
  basePrice: 799,
  discountPrice: null,
  isFeatured: false,
  isNewArrival: false,
  isBestseller: false,
  categoryId: "",
  ageGroups: [],
  tags: [],
  images: [],
  variants: [
    {
      ...EMPTY_VARIANT,
    },
  ],
};

const SIZES = [
  "NB",
  "0-3M",
  "3-6M",
  "6-12M",
  "1-2Y",
  "2-3Y",
  "3-4Y",
  "4-5Y",
  "5-6Y",
  "6-8Y",
  "8-10Y",
];

const LOW_STOCK_THRESHOLD = 5;

function formatPrice(
  value: string | number | null | undefined,
): string {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  return `₹${Number(value).toLocaleString("en-IN")}`;
}

function getTotalStock(
  product: Product,
): number {
  return product.variants.reduce(
    (total, variant) =>
      total + Number(variant.stock),
    0,
  );
}

function createSlug(
  name: string,
): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function App() {
  
  const [products, setProducts] =
    useState<Product[]>([]);

  const [categories, setCategories] =
    useState<Category[]>([]);

const [orderSearch, setOrderSearch] = useState("");
  const [orders, setOrders] =
    useState<AdminOrder[]>([]);

  const [shipmentOrderId, setShipmentOrderId] =
    useState<string | null>(null);

  const [courierName, setCourierName] =
    useState("");

  const [trackingNumber, setTrackingNumber] =
    useState("");

  const [shipmentStatus, setShipmentStatus] =
    useState<ShipmentStatus>("PENDING");

  const [shippedAt, setShippedAt] =
    useState("");

  const [deliveredAt, setDeliveredAt] =
    useState("");

  const [, setShipmentMessage] =
    useState("");

  const [coupons, setCoupons] =
    useState<AdminCoupon[]>([]);

  const [couponModalOpen, setCouponModalOpen] =
    useState(false);

  const [couponSaving, setCouponSaving] =
    useState(false);

  const [editingCoupon, setEditingCoupon] =
    useState<AdminCoupon | null>(null);

  const [couponForm, setCouponForm] =
    useState<AdminCouponInput>({
      code: "",
      discountType: "PERCENTAGE",
      discountValue: 10,
      minimumOrderValue: null,
      maximumDiscount: null,
      usageLimit: null,
      startsAt: "",
      expiresAt: "",
      status: "ACTIVE",
    });

  const [categoryModalOpen, setCategoryModalOpen] =
    useState(false);

  const [categorySaving, setCategorySaving] =
    useState(false);

  const [deletingCategoryId, setDeletingCategoryId] =
    useState<string | null>(null);

  const [categoryForm, setCategoryForm] =
    useState({
      name: "",
      slug: "",
      description: "",
      isActive: true,
      sortOrder: 0,
    });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [uploadingImages, setUploadingImages] =
    useState<number[]>([]);

  const [previewUrls, setPreviewUrls] =
    useState<Record<number, string>>({});

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [modalOpen, setModalOpen] =
    useState(false);

  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [form, setForm] =
    useState<ProductInput>({
      ...EMPTY_PRODUCT,
      variants: [
        {
          ...EMPTY_VARIANT,
        },
      ],
    });

  async function loadProducts(): Promise<void> {
    try {
      const productData =
        await getAdminProducts();

      setProducts(productData);
    } catch (err) {
      console.error(
        "Failed to load products:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load products",
      );
    }
  }

  async function loadCategories(): Promise<void> {
    try {
      const categoryData =
        await getAdminCategories();

      setCategories(categoryData);
    } catch (err) {
      console.error(
        "Failed to load categories:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load categories",
      );
    }
  }

  async function loadOrders(): Promise<void> {
    try {
      const orderData =
        await getAdminOrders();

      setOrders(orderData);
    } catch (err) {
      console.error(
        "Failed to load orders:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load orders",
      );
    }
  }

  async function handleShipmentUpdate(
    orderId: string,
  ): Promise<void> {
    try {
      setShipmentMessage("");

      await updateAdminShipment(orderId, {
        courierName,
        trackingNumber,
        status: shipmentStatus,
        shippedAt: shippedAt || null,
        deliveredAt: deliveredAt || null,
      });

      setShipmentMessage(
        "Shipping details updated successfully.",
      );



      setShipmentOrderId(null);

      setCourierName("");
      setTrackingNumber("");
      setShipmentStatus("PENDING");
      
      setShippedAt("");
      setDeliveredAt("");

      await loadOrders();
    } catch (error) {
      setShipmentMessage(
        error instanceof Error
          ? error.message
          : "Failed to update shipping details",
      );
    }
  }

  async function loadCoupons(): Promise<void> {
    try {
      const result =
        await getAdminCoupons();

      setCoupons(result);
    } catch (err) {
      console.error(
        "Failed to load coupons:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load coupons.",
      );
    }
  }

  async function loadData(): Promise<void> {
    setLoading(true);

    try {
      await Promise.all([
        loadProducts(),
        loadCategories(),
        loadOrders(),
        loadCoupons(),
      ]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  function openCategoryModal(): void {
    setCategoryForm({
      name: "",
      slug: "",
      description: "",
      isActive: true,
      sortOrder: categories.length,
    });

    setError("");
    setCategoryModalOpen(true);
  }

  function closeCategoryModal(): void {
    if (categorySaving) {
      return;
    }

    setCategoryModalOpen(false);
    setError("");
  }

  function updateCategoryField(
    field:
      | "name"
      | "slug"
      | "description"
      | "isActive"
      | "sortOrder",
    value:
      | string
      | boolean
      | number,
  ): void {
    setCategoryForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleCategorySubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    try {
      setCategorySaving(true);
      setError("");

      if (!categoryForm.name.trim()) {
        throw new Error(
          "Category name is required",
        );
      }

      if (!categoryForm.slug.trim()) {
        throw new Error(
          "Category slug is required",
        );
      }

      if (
        !Number.isInteger(
          categoryForm.sortOrder,
        ) ||
        categoryForm.sortOrder < 0
      ) {
        throw new Error(
          "Sort order must be 0 or greater",
        );
      }

      await createAdminCategory({
        name: categoryForm.name.trim(),
        slug: categoryForm.slug.trim(),
        description:
          categoryForm.description.trim(),
        imageUrl: "",
        isActive:
          categoryForm.isActive,
        sortOrder:
          categoryForm.sortOrder,
      });

      await loadCategories();

      setCategoryModalOpen(false);

      setCategoryForm({
        name: "",
        slug: "",
        description: "",
        isActive: true,
        sortOrder: 0,
      });
    } catch (err) {
      console.error(
        "Failed to create category:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to create category",
      );
    } finally {
      setCategorySaving(false);
    }
  }

  async function handleCategoryDelete(
    category: Category,
  ): Promise<void> {
    if (
      !window.confirm(
        `Delete the "${category.name}" category? This cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      setDeletingCategoryId(category.id);
      setError("");

      await deleteAdminCategory(category.id);
      await loadCategories();
    } catch (err) {
      console.error("Failed to delete category:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete category",
      );
    } finally {
      setDeletingCategoryId(null);
    }
  }

  async function handleOrderStatusChange(
    orderId: string,
    status: string,
  ): Promise<void> {
    try {
      setError("");

      await updateAdminOrderStatus(
        orderId,
        status as (typeof ADMIN_ORDER_STATUSES)[number],
      );

      await loadOrders();
    } catch (err) {
      console.error(
        "Failed to update order status:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update order status",
      );
    }
  }

  function openCouponModal(): void {
    setEditingCoupon(null);

    setCouponForm({
      code: "",
      discountType: "PERCENTAGE",
      discountValue: 10,
      minimumOrderValue: null,
      maximumDiscount: null,
      usageLimit: null,
      startsAt: "",
      expiresAt: "",
      status: "ACTIVE",
    });

    setError("");
    setCouponModalOpen(true);
  }

  function openEditCoupon(
    coupon: AdminCoupon,
  ): void {
    setEditingCoupon(coupon);

    setCouponForm({
      code: coupon.code,
      discountType:
        coupon.discountType,
      discountValue: Number(
        coupon.discountValue,
      ),
      minimumOrderValue:
        coupon.minimumOrderValue ===
        null
          ? null
          : Number(
              coupon.minimumOrderValue,
            ),
      maximumDiscount:
        coupon.maximumDiscount ===
        null
          ? null
          : Number(
              coupon.maximumDiscount,
            ),
      usageLimit:
        coupon.usageLimit === null
          ? null
          : Number(
              coupon.usageLimit,
            ),
      startsAt:
        coupon.startsAt.slice(0, 16),
      expiresAt:
        coupon.expiresAt.slice(0, 16),
      status: coupon.status,
    });

    setError("");
    setCouponModalOpen(true);
  }

  function closeCouponModal(): void {
    if (couponSaving) {
      return;
    }

    setCouponModalOpen(false);
    setEditingCoupon(null);
    setError("");
  }

  async function handleCouponSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    try {
      setCouponSaving(true);
      setError("");

      const code =
        couponForm.code
          .trim()
          .toUpperCase();

      if (!code) {
        throw new Error(
          "Coupon code is required.",
        );
      }

      if (
        !/^[A-Z0-9_-]+$/.test(code)
      ) {
        throw new Error(
          "Coupon code can contain only letters, numbers, hyphens and underscores.",
        );
      }

      if (
        !Number.isFinite(
          couponForm.discountValue,
        ) ||
        couponForm.discountValue <= 0
      ) {
        throw new Error(
          "Discount value must be greater than 0.",
        );
      }

      if (
        couponForm.discountType ===
          "PERCENTAGE" &&
        couponForm.discountValue > 100
      ) {
        throw new Error(
          "Percentage discount cannot exceed 100.",
        );
      }

      if (
        couponForm.minimumOrderValue !==
          null &&
        (
          !Number.isFinite(
            couponForm.minimumOrderValue,
          ) ||
          couponForm.minimumOrderValue < 0
        )
      ) {
        throw new Error(
          "Minimum order value cannot be negative.",
        );
      }

      if (
        couponForm.maximumDiscount !==
          null &&
        (
          !Number.isFinite(
            couponForm.maximumDiscount,
          ) ||
          couponForm.maximumDiscount <= 0
        )
      ) {
        throw new Error(
          "Maximum discount must be greater than 0.",
        );
      }

      if (
        couponForm.discountType ===
          "FIXED" &&
        couponForm.maximumDiscount !==
          null
      ) {
        throw new Error(
          "Maximum discount is only used for percentage coupons.",
        );
      }

      if (
        couponForm.usageLimit !==
          null &&
        (
          !Number.isInteger(
            couponForm.usageLimit,
          ) ||
          couponForm.usageLimit <= 0
        )
      ) {
        throw new Error(
          "Usage limit must be a positive whole number.",
        );
      }

      if (!couponForm.startsAt) {
        throw new Error(
          "Start date and time are required.",
        );
      }

      if (!couponForm.expiresAt) {
        throw new Error(
          "Expiry date and time are required.",
        );
      }

      const startsAt =
        new Date(
          couponForm.startsAt,
        );

      const expiresAt =
        new Date(
          couponForm.expiresAt,
        );

      if (
        Number.isNaN(
          startsAt.getTime(),
        ) ||
        Number.isNaN(
          expiresAt.getTime(),
        )
      ) {
        throw new Error(
          "Please enter valid coupon dates.",
        );
      }

      if (
        expiresAt <= startsAt
      ) {
        throw new Error(
          "Expiry must be later than the start date.",
        );
      }

      const payload: AdminCouponInput = {
        ...couponForm,
        code,
        discountValue:
          Number(
            couponForm.discountValue,
          ),
        minimumOrderValue:
          couponForm.minimumOrderValue ===
          null
            ? null
            : Number(
                couponForm.minimumOrderValue,
              ),
        maximumDiscount:
          couponForm.maximumDiscount ===
          null
            ? null
            : Number(
                couponForm.maximumDiscount,
              ),
        usageLimit:
          couponForm.usageLimit ===
          null
            ? null
            : Number(
                couponForm.usageLimit,
              ),
      };

      if (editingCoupon) {
        await updateAdminCoupon(
          editingCoupon.id,
          payload,
        );
      } else {
        await createAdminCoupon(
          payload,
        );
      }

      await loadCoupons();

      setCouponModalOpen(false);
      setEditingCoupon(null);
      setError("");
    } catch (err) {
      console.error(
        "Failed to save coupon:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save coupon.",
      );
    } finally {
      setCouponSaving(false);
    }
  }

  async function handleDeleteCoupon(
    coupon: AdminCoupon,
  ): Promise<void> {
    const confirmed =
      window.confirm(
        `Delete coupon "${coupon.code}"?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteAdminCoupon(
        coupon.id,
      );

      await loadCoupons();
    } catch (err) {
      console.error(
        "Failed to delete coupon:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete coupon.",
      );
    }
  }

  const filteredProducts = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    if (!query) {
      return products;
    }

    return products.filter(
      (product) =>
        product.name
          .toLowerCase()
          .includes(query) ||
        product.sku
          .toLowerCase()
          .includes(query) ||
        product.category.name
          .toLowerCase()
          .includes(query),
    );
  }, [products, search]);

  const totalProducts =
    products.length;

  const activeProducts =
    products.filter(
      (product) =>
        product.status === "ACTIVE",
    ).length;

  const outOfStockProducts =
    products.filter(
      (product) =>
        product.status ===
        "OUT_OF_STOCK",
    ).length;

  const lowStockVariants = useMemo(
    () =>
      products.flatMap((product) =>
        product.status === "ACTIVE"
          ? product.variants
              .filter(
                (variant) =>
                  Number(variant.stock) > 0 &&
                  Number(variant.stock) <= LOW_STOCK_THRESHOLD,
              )
              .map((variant) => ({ product, variant }))
          : [],
      ),
    [products],
  );

  function clearPreviewUrls(): void {
    Object.values(previewUrls).forEach(
      (url) => {
        URL.revokeObjectURL(url);
      },
    );

    setPreviewUrls({});
  }

  useEffect(() => {
    return () => {
      Object.values(previewUrls).forEach(
        (url) => {
          URL.revokeObjectURL(url);
        },
      );
    };
  }, [previewUrls]);

  function openCreateModal(): void {
    clearPreviewUrls();

    setEditingProduct(null);

    setForm({
      ...EMPTY_PRODUCT,
      ageGroups: [],
      tags: [],
      images: [],
      variants: [
        {
          ...EMPTY_VARIANT,
        },
      ],
    });

    setError("");
    setUploadingImages([]);
    setModalOpen(true);
  }

  function openEditModal(
    product: Product,
  ): void {
    clearPreviewUrls();

    setEditingProduct(product);

    setForm({
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      description: product.description,
      material: product.material,
      color: product.color,
      status: product.status,
      basePrice: Number(
        product.basePrice,
      ),
      discountPrice:
        product.discountPrice ===
          null ||
        product.discountPrice ===
          undefined
          ? null
          : Number(
              product.discountPrice,
            ),
      isFeatured:
        product.isFeatured,
      isNewArrival:
        product.isNewArrival,
      isBestseller:
        product.isBestseller,
      categoryId:
        product.categoryId,
      ageGroups: [
        ...product.ageGroups,
      ],
      tags: [
        ...product.tags,
      ],
      images:
        product.images.map(
          (image) => ({
            imageUrl:
              image.imageUrl,
            altText:
              image.altText || "",
            sortOrder:
              image.sortOrder,
            isPrimary:
              image.isPrimary,
          }),
        ),
      variants:
        product.variants.map(
          (variant) => ({
            id: variant.id,
            size:
              variant.size,
            color:
              variant.color,
            sku:
              variant.sku,
            price:
              Number(
                variant.price,
              ),
            stock:
              Number(
                variant.stock,
              ),
          }),
        ),
    });

    setError("");
    setUploadingImages([]);
    setModalOpen(true);
  }

  function closeModal(): void {
    if (saving) {
      return;
    }

    clearPreviewUrls();

    setModalOpen(false);
    setEditingProduct(null);
    setError("");
    setUploadingImages([]);
  }

  function updateField<
    K extends keyof ProductInput,
  >(
    field: K,
    value: ProductInput[K],
  ): void {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateVariant(
    index: number,
    field: keyof ProductVariantInput,
    value: string | number,
  ): void {
    setForm((current) => ({
      ...current,
      variants:
        current.variants.map(
          (
            variant,
            variantIndex,
          ) =>
            variantIndex === index
              ? {
                  ...variant,
                  [field]: value,
                }
              : variant,
        ),
    }));
  }

  function addVariant(): void {
    setForm((current) => ({
      ...current,
      variants: [
        ...current.variants,
        {
          size: "",
          color:
            current.color ||
            "Black",
          sku: "",
          price:
            Number(
              current.basePrice,
            ) || 799,
          stock: 0,
        },
      ],
    }));
  }

  function removeVariant(
    index: number,
  ): void {
    if (
      form.variants.length <= 1
    ) {
      return;
    }

    setForm((current) => ({
      ...current,
      variants:
        current.variants.filter(
          (_, variantIndex) =>
            variantIndex !== index,
        ),
    }));
  }

  function addImage(): void {
    setForm((current) => ({
      ...current,
      images: [
        ...current.images,
        {
          imageUrl: "",
          altText: "",
          sortOrder:
            current.images.length,
          isPrimary:
            current.images.length === 0,
        },
      ],
    }));
  }

  async function handleImageUpload(
    index: number,
    file: File,
  ): Promise<void> {
    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setError(
        "Image must be 5 MB or smaller",
      );

      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (
      !allowedTypes.includes(
        file.type,
      )
    ) {
      setError(
        "Only JPG, PNG and WebP images are allowed",
      );

      return;
    }

    const previewUrl =
      URL.createObjectURL(file);

    setPreviewUrls((current) => ({
      ...current,
      [index]: previewUrl,
    }));

    setForm((current) => ({
      ...current,
      images:
        current.images.map(
          (
            image,
            imageIndex,
          ) =>
            imageIndex === index
              ? {
                  ...image,
                  altText:
                    file.name.replace(
                      /\.[^/.]+$/,
                      "",
                    ),
                }
              : image,
        ),
    }));

    setError("");

    setUploadingImages(
      (current) => [
        ...current.filter(
          (imageIndex) =>
            imageIndex !== index,
        ),
        index,
      ],
    );

    try {
      const imageUrl =
        await uploadProductImage(
          file,
        );

      setForm((current) => ({
        ...current,
        images:
          current.images.map(
            (
              image,
              imageIndex,
            ) =>
              imageIndex === index
                ? {
                    ...image,
                    imageUrl:
                      imageUrl.trim(),
                  }
                : image,
          ),
      }));

      setError("");
    } catch (err) {
      console.error(
        "Image upload failed:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to upload image",
      );
    } finally {
      setUploadingImages(
        (current) =>
          current.filter(
            (imageIndex) =>
              imageIndex !== index,
          ),
      );
    }
  }

  function updateImage(
    index: number,
    field:
      | "imageUrl"
      | "altText"
      | "sortOrder"
      | "isPrimary",
    value:
      | string
      | number
      | boolean,
  ): void {
    setForm((current) => ({
      ...current,
      images:
        current.images.map(
          (
            image,
            imageIndex,
          ) =>
            imageIndex === index
              ? {
                  ...image,
                  [field]: value,
                }
              : image,
        ),
    }));
  }

  function removeImage(
    index: number,
  ): void {
    const previewUrl =
      previewUrls[index];

    if (previewUrl) {
      URL.revokeObjectURL(
        previewUrl,
      );
    }

    setPreviewUrls((current) => {
      const next = {
        ...current,
      };

      delete next[index];

      return next;
    });

    setForm((current) => {
      const images =
        current.images.filter(
          (_, imageIndex) =>
            imageIndex !== index,
        );

      if (
        images.length > 0 &&
        !images.some(
          (image) =>
            image.isPrimary,
        )
      ) {
        images[0] = {
          ...images[0],
          isPrimary: true,
        };
      }

      return {
        ...current,
        images,
      };
    });
  }

  function setPrimaryImage(
    index: number,
  ): void {
    setForm((current) => ({
      ...current,
      images:
        current.images.map(
          (
            image,
            imageIndex,
          ) => ({
            ...image,
            isPrimary:
              imageIndex === index,
          }),
        ),
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (
        !form.name.trim() ||
        !form.slug.trim() ||
        !form.sku.trim()
      ) {
        throw new Error(
          "Name, slug and SKU are required",
        );
      }

      if (!form.categoryId) {
        throw new Error(
          "Please select a category",
        );
      }

      if (
        form.variants.length === 0
      ) {
        throw new Error(
          "Add at least one size variant",
        );
      }

      if (
        uploadingImages.length > 0
      ) {
        throw new Error(
          "Please wait for image uploads to finish",
        );
      }

      const variantSizes =
        new Set<string>();

      const variantSkus =
        new Set<string>();

      for (
        const variant of form.variants
      ) {
        if (!variant.size) {
          throw new Error(
            "Every variant needs a size",
          );
        }

        if (
          variantSizes.has(
            variant.size,
          )
        ) {
          throw new Error(
            `Duplicate size: ${variant.size}`,
          );
        }

        if (!variant.sku.trim()) {
          throw new Error(
            "Every variant needs a SKU",
          );
        }

        if (
          variantSkus.has(
            variant.sku.trim(),
          )
        ) {
          throw new Error(
            `Duplicate variant SKU: ${variant.sku}`,
          );
        }

        variantSizes.add(
          variant.size,
        );

        variantSkus.add(
          variant.sku.trim(),
        );

        if (
          !Number.isFinite(
            variant.price,
          ) ||
          variant.price <= 0
        ) {
          throw new Error(
            "Every variant price must be greater than 0",
          );
        }

        if (
          !Number.isInteger(
            variant.stock,
          ) ||
          variant.stock < 0
        ) {
          throw new Error(
            "Stock cannot be negative",
          );
        }
      }

      if (
        !Number.isFinite(
          form.basePrice,
        ) ||
        form.basePrice <= 0
      ) {
        throw new Error(
          "Base price must be greater than 0",
        );
      }

      if (
        form.discountPrice !==
          null &&
        form.discountPrice !==
          undefined &&
        (
          !Number.isFinite(
            form.discountPrice,
          ) ||
          form.discountPrice <= 0
        )
      ) {
        throw new Error(
          "Discount price must be greater than 0",
        );
      }

      if (
        form.discountPrice !==
          null &&
        form.discountPrice !==
          undefined &&
        form.discountPrice >=
          form.basePrice
      ) {
        throw new Error(
          "Discount price must be lower than base price",
        );
      }

      const payload: ProductInput = {
        ...form,

        name:
          form.name.trim(),

        slug:
          form.slug.trim() ||
          createSlug(form.name),

        sku:
          form.sku.trim(),

        description:
          form.description.trim(),

        material:
          form.material.trim(),

        color:
          form.color.trim(),

        ageGroups: [
          ...form.ageGroups,
        ],

        tags:
          form.tags
            .map(
              (tag) =>
                tag.trim(),
            )
            .filter(Boolean),

        images:
          form.images
            .filter(
              (image) =>
                image.imageUrl.trim() !== "",
            )
            .map(
              (
                image,
                index,
              ) => ({
                imageUrl:
                  image.imageUrl.trim(),

                altText:
                  image.altText?.trim() ||
                  undefined,

                sortOrder:
                  index,

                isPrimary:
                  image.isPrimary,
              }),
            ),

        variants:
          form.variants.map(
            (variant) => ({
              ...variant,

              size:
                variant.size.trim(),

              color:
                variant.color.trim(),

              sku:
                variant.sku.trim(),

              price:
                Number(
                  variant.price,
                ),

              stock:
                Number(
                  variant.stock,
                ),
            }),
          ),
      };

      if (editingProduct) {
        await updateAdminProduct(
          editingProduct.id,
          payload,
        );
      } else {
        await createAdminProduct(
          payload,
        );
      }

      clearPreviewUrls();

      await loadData();

      setModalOpen(false);
      setEditingProduct(null);
      setError("");
      setUploadingImages([]);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save product",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(
    product: Product,
  ): Promise<void> {
    const confirmed =
      window.confirm(
        `Delete "${product.name}"?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const message =
        await deleteAdminProduct(
          product.id,
        );

      window.alert(message);

      await loadData();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete product",
      );
    }
  }

  return (
    <div className="min-h-screen bg-[#FFF9ED] text-[#0B0B0B]">
      <header className="border-b border-black/10 bg-[#0B0B0B] px-4 py-5 text-[#FFF9ED] sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">
              Traditional Girlswear
            </p>

            <h1 className="mt-1 text-xl font-semibold">
              Admin Panel
            </h1>
          </div>

          <span className="text-sm text-white/60">
            Administrator
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
       <AdminDashboard />
<AdminReturnManagement />
        <HomePageManager />
        {error &&
          !modalOpen &&
          !categoryModalOpen &&
          !couponModalOpen && (
            <div className="mt-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="border border-black/10 bg-white p-5">
            <p className="text-sm text-black/50">
              Total Products
            </p>

            <p className="mt-2 text-3xl font-semibold">
              {loading
                ? "..."
                : totalProducts}
            </p>
          </div>

          <div className="border border-black/10 bg-white p-5">
            <p className="text-sm text-black/50">
              Active Products
            </p>

            <p className="mt-2 text-3xl font-semibold">
              {loading
                ? "..."
                : activeProducts}
            </p>
          </div>

          <div className="border border-black/10 bg-white p-5">
            <p className="text-sm text-black/50">
              Out of Stock
            </p>

            <p className="mt-2 text-3xl font-semibold">
              {loading
                ? "..."
                : outOfStockProducts}
            </p>
          </div>

          <div className="border border-amber-200 bg-amber-50 p-5">
            <p className="text-sm text-amber-900/70">
              Low-stock variants
            </p>

            <p className="mt-2 text-3xl font-semibold text-amber-950">
              {loading
                ? "..."
                : lowStockVariants.length}
            </p>
          </div>

          <div className="border border-black/10 bg-white p-5">
            <p className="text-sm text-black/50">
              Orders
            </p>

            <p className="mt-2 text-3xl font-semibold">
              {loading
                ? "..."
                : orders.length}
            </p>
          </div>
        </div>

        <section className="mt-8 border border-amber-200 bg-white">
          <div className="flex flex-col gap-2 border-b border-amber-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold">
                Low-stock attention
              </h3>

              <p className="mt-1 text-sm text-black/60">
                Variants with 1–{LOW_STOCK_THRESHOLD} units left. Update stock before they sell out.
              </p>
            </div>

            <span className="text-sm font-semibold text-amber-800">
              {lowStockVariants.length} need attention
            </span>
          </div>

          {loading ? (
            <div className="p-5 text-sm text-black/50">
              Loading inventory...
            </div>
          ) : lowStockVariants.length === 0 ? (
            <div className="p-5 text-sm text-black/60">
              All active variants are above the low-stock threshold.
            </div>
          ) : (
            <div className="divide-y divide-black/5">
              {lowStockVariants.map(({ product, variant }) => (
                <div
                  key={variant.id}
                  className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold">{product.name}</p>
                    <p className="mt-1 text-sm text-black/60">
                      {variant.size} · {variant.color} · SKU {variant.sku}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="bg-amber-100 px-3 py-2 text-sm font-semibold text-amber-900">
                      {variant.stock} left
                    </span>

                    <button
                      type="button"
                      onClick={() => openEditModal(product)}
                      className="border border-black/15 px-3 py-2 text-xs font-semibold hover:border-[#D4AF37]"
                    >
                      Adjust stock
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-8 border border-black/10 bg-white">
          <div className="flex flex-col gap-4 border-b border-black/10 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              
              <h3 className="text-lg font-semibold">
                Product Management
              </h3>

              <p className="mt-1 text-sm text-black/60">
                Manage your store products
                and size-level inventory.
              </p>
            </div>

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search products..."
              className="w-full border border-black/15 px-4 py-3 text-sm outline-none focus:border-[#D4AF37] sm:max-w-xs"
            />
          </div>

          {loading ? (
            <div className="p-8 text-sm text-black/50">
              Loading products...
            </div>
          ) : filteredProducts.length ===
            0 ? (
            <div className="p-8">
              <p className="text-sm text-black/50">
                No products found.
              </p>

              <button
                type="button"
                onClick={openCreateModal}
                className="mt-5 bg-[#0B0B0B] px-5 py-3 text-sm font-semibold text-[#FFF9ED]"
              >
                Add Your First Product
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[900px] w-full text-left">
                <thead>
                  <tr className="border-b border-black/10 text-xs uppercase tracking-wider text-black/45">
                    <th className="px-5 py-4">
                      Product
                    </th>

                    <th className="px-5 py-4">
                      SKU
                    </th>

                    <th className="px-5 py-4">
                      Category
                    </th>

                    <th className="px-5 py-4">
                      Price
                    </th>

                    <th className="px-5 py-4">
                      Stock
                    </th>

                    <th className="px-5 py-4">
                      Status
                    </th>

                    <th className="px-5 py-4">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProducts.map(
                    (product) => (
                      <tr
                        key={product.id}
                        className="border-b border-black/5 last:border-0"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-4">
                            <div className="h-16 w-16 shrink-0 overflow-hidden bg-[#F6F0E4]">
                              {product.images[0]
                                ?.imageUrl ? (
                                <img
                                  src={
                                    product
                                      .images[0]
                                      .imageUrl
                                  }
                                  alt={
                                    product
                                      .images[0]
                                      .altText ||
                                    product.name
                                  }
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-xs text-black/30">
                                  No image
                                </div>
                              )}
                            </div>

                            <div>
                              <p className="font-semibold">
                                {product.name}
                              </p>

                              <p className="mt-1 text-xs text-black/50">
                                {product.material}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm">
                          {product.sku}
                        </td>

                        <td className="px-5 py-4 text-sm">
                          {product.category.name}
                        </td>

                        <td className="px-5 py-4 text-sm font-semibold">
                          {formatPrice(
                            product.discountPrice ??
                              product.basePrice,
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm">
                          {getTotalStock(
                            product,
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex bg-black/5 px-2.5 py-1 text-xs font-semibold">
                            {product.status}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                openEditModal(
                                  product,
                                )
                              }
                              className="border border-black/15 px-3 py-2 text-xs font-semibold hover:border-[#D4AF37]"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                void handleDelete(
                                  product,
                                )
                              }
                              className="border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="mt-8 border border-black/10 bg-white">
          <div className="flex flex-col gap-4 border-b border-black/10 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold">
                Category Management
              </h3>

              <p className="mt-1 text-sm text-black/60">
                Manage product categories used by your store.
              </p>
            </div>

            <button
              type="button"
              onClick={openCategoryModal}
              className="bg-[#0B0B0B] px-5 py-3 text-sm font-semibold text-[#FFF9ED] transition hover:bg-[#D4AF37] hover:text-[#0B0B0B]"
            >
              + Add Category
            </button>
          </div>

          {categories.length === 0 ? (
            <div className="p-8 text-sm text-black/50">
              No categories found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[800px] w-full text-left">
                <thead>
                  <tr className="border-b border-black/10 text-xs uppercase tracking-wider text-black/45">
                    <th className="px-5 py-4">
                      Category
                    </th>

                    <th className="px-5 py-4">
                      Slug
                    </th>

                    <th className="px-5 py-4">
                      Description
                    </th>

                    <th className="px-5 py-4">
                      Sort Order
                    </th>

                    <th className="px-5 py-4">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {categories.map(
                    (category) => (
                      <tr
                        key={category.id}
                        className="border-b border-black/5 last:border-0"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold">
                            {category.name}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm text-black/60">
                          {category.slug}
                        </td>

                        <td className="max-w-sm px-5 py-4 text-sm text-black/60">
                          {category.description ||
                            "—"}
                        </td>

                        <td className="px-5 py-4 text-sm">
                          {category.sortOrder}
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex bg-black/5 px-2.5 py-1 text-xs font-semibold">
                            {category.isActive
                              ? "ACTIVE"
                              : "INACTIVE"}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              void handleCategoryDelete(
                                category,
                              )
                            }
                            disabled={
                              deletingCategoryId ===
                              category.id
                            }
                            className="border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingCategoryId ===
                            category.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

          <section className="mt-8 border border-black/10 bg-white">
          <div className="border-b border-black/10 p-5">
            <h3 className="text-lg font-semibold">
              Customer Orders
            </h3>

            <p className="mt-1 text-sm text-black/60">
              View customer information, ordered products,
              payment and delivery details.
            </p>
            <div className="mt-4">
  <input
    type="search"
    value={orderSearch}
    onChange={(event) => {
 
  setOrderSearch(event.target.value);
}}
    placeholder="Search orders by order ID, customer name, email or mobile"
    className="w-full border border-black/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37] sm:max-w-xl"
  />
</div>
          </div>

          {orders.length === 0 ? (
            <div className="p-8 text-sm text-black/50">
              No customer orders yet.
            </div>
          ) : (
            <div className="space-y-4 p-5">
            <p className="mb-3 text-xs text-black/50">
  Showing {orders.filter((order) => {
    const search = orderSearch.trim().toLowerCase();

    if (!search) {
      return true;
    }

    const searchableText = [
      order.id,
      order.user.name,
      order.user.email,
      order.user.mobile,
      order.status,
      order.payment?.status,
      order.payment?.method,
      ...order.items.flatMap((item) => [
        item.productName,
        item.variant.sku,
        item.variant.size,
        item.variant.color,
      ]),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(search);
  }).length} of {orders.length} orders
</p>
             {orders
  .filter((order) => {
    const search = orderSearch.trim().toLowerCase();

    if (!search) {
      return true;
    }

    const searchableText = [
      order.id,
      order.user.name,
      order.user.email,
      order.user.mobile,
      order.status,
      order.payment?.status,
      order.payment?.method,
      ...order.items.flatMap((item) => [
        item.productName,
        item.variant.sku,
        item.variant.size,
        item.variant.color,
      ]),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(search);
  })
  .map((order) => (
                
                <div
                  key={order.id}
                  className="border border-black/10 bg-[#FFF9ED] p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-black/45">
                        Order
                      </p>

                      <p className="mt-1 font-semibold">
                        #{order.id}
                      </p>

                      <p className="mt-1 text-xs text-black/50">
                        {new Date(
                          order.createdAt,
                        ).toLocaleString("en-IN")}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <select
                        value={order.status}
                        onChange={(event) =>
                          void handleOrderStatusChange(
                            order.id,
                            event.target.value,
                          )
                        }
                        className="border border-black/15 bg-black px-3 py-1.5 text-xs font-semibold text-white outline-none focus:border-[#D4AF37]"
                      >
                        {ADMIN_ORDER_STATUSES.map(
                          (status) => (
                            <option
                              key={status}
                              value={status}
                              className="bg-white text-black"
                            >
                              {status}
                            </option>
                          ),
                        )}
                      </select>


                      <span className="bg-[#D4AF37] px-3 py-1.5 text-xs font-semibold text-black">
                        {formatPrice(
                          order.totalAmount,
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-black/45">
                        Customer
                      </p>

                      <p className="mt-2 font-semibold">
                        {order.user.name}
                      </p>

                      <p className="mt-1 text-sm text-black/60">
                        {order.user.email}
                      </p>

                      <p className="mt-1 text-sm text-black/60">
                        {order.user.mobile ||
                          "Mobile not available"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-black/45">
                        Delivery Address
                      </p>

                      <p className="mt-2 text-sm">
                        {order.address.name}
                      </p>

                      <p className="text-sm">
                        {order.address.addressLine1}
                      </p>

                      {order.address.addressLine2 && (
                        <p className="text-sm">
                          {order.address.addressLine2}
                        </p>
                      )}

                      <p className="text-sm">
                        {order.address.city},{" "}
                        {order.address.state}
                      </p>

                      <p className="text-sm">
                        {order.address.pincode}
                      </p>

                      <p className="mt-1 text-sm text-black/60">
                        {order.address.mobile}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-black/45">
                        Payment
                      </p>

                      <p className="mt-2 text-sm">
                        Method:{" "}
                        <span className="font-semibold">
                          {order.payment?.method ||
                            "COD"}
                        </span>
                      </p>

                      <p className="mt-1 text-sm">
                        Status:{" "}
                        <span className="font-semibold">
                          {order.payment?.status ||
                            "Pending"}
                        </span>
                      </p>

                      {order.shipment && (
                        <>
                          <p className="mt-3 text-sm">
                            Shipment:{" "}
                            <span className="font-semibold">
                              {order.shipment.status}
                            </span>
                          </p>

                          {order.shipment
                            .trackingNumber && (
                            <p className="mt-1 text-sm">
                              Tracking:{" "}
                              {
                                order.shipment
                                  .trackingNumber
                              }
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
<div className="mt-4 rounded-lg border p-4">
  <h3 className="mb-3 text-lg font-semibold">
    Shipping & Tracking
  </h3>

  {order.shipment && (
    <div className="mb-3 text-sm">
      <p>
        <strong>Courier:</strong>{" "}
        {order.shipment.courierName || "Not assigned"}
      </p>

      <p>
        <strong>Tracking number:</strong>{" "}
        {order.shipment.trackingNumber || "Not available"}
      </p>

      <p>
        <strong>Shipment status:</strong>{" "}
        {order.shipment.status}
      </p>

   
    </div>
  )}

  {shipmentOrderId === order.id ? (
    <div className="space-y-3">
      <input
        type="text"
        placeholder="Courier name"
        value={courierName}
        onChange={(event) =>
          setCourierName(event.target.value)
        }
        className="w-full rounded border p-2"
      />

      <input
        type="text"
        placeholder="Tracking number"
        value={trackingNumber}
        onChange={(event) =>
          setTrackingNumber(event.target.value)
        }
        className="w-full rounded border p-2"
      />

      

      <select
        value={shipmentStatus}
        onChange={(event) =>
          setShipmentStatus(
            event.target.value as ShipmentStatus,
          )
        }
        
        className="w-full rounded border p-2"
      >
        {SHIPMENT_STATUSES.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
            <div>
        <label className="mb-1 block text-sm font-medium">
          Shipped Date
        </label>

        <input
          type="date"
          value={shippedAt}
          onChange={(event) =>
            setShippedAt(event.target.value)
          }
          className="w-full rounded border p-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Delivered Date
        </label>

        <input
          type="date"
          value={deliveredAt}
          onChange={(event) =>
            setDeliveredAt(event.target.value)
          }
          className="w-full rounded border p-2"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() =>
            handleShipmentUpdate(order.id)
          }
          className="rounded bg-black px-4 py-2 text-white"
        >
          Save Shipping
        </button>

        <button
          type="button"
          onClick={() => setShipmentOrderId(null)}
          className="rounded border px-4 py-2"
        >
          Cancel
        </button>
      </div>
    </div>
  ) : (
    <button
      type="button"
      onClick={() => {
        setShipmentOrderId(order.id);
        setCourierName(
          order.shipment?.courierName || "",
        );
        setTrackingNumber(
          order.shipment?.trackingNumber || "",
        );
       
        setShipmentStatus(
          (order.shipment?.status ||
            "PENDING") as ShipmentStatus,
        );
        setShippedAt(
  order.shipment?.shippedAt
    ? order.shipment.shippedAt.slice(0, 10)
    : "",
);

setDeliveredAt(
  order.shipment?.deliveredAt
    ? order.shipment.deliveredAt.slice(0, 10)
    : "",
);
      }}
      className="rounded bg-blue-600 px-4 py-2 text-white"
    >
     {order.shipment
        ? "Edit Shipping Details"
        : "Add Shipping Details"}
    </button>
    
  )}
</div>
                  <div className="mt-5 border-t border-black/10 pt-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-black/45">
                      Ordered Items
                    </p>

                    <div className="mt-3 space-y-2">
                      {order.items.map(
                        (item) => (
                          <div
                            key={item.id}
                            className="flex flex-col gap-2 border border-black/10 bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div>
                              <p className="text-sm font-semibold">
                                {item.productName}
                              </p>

                              <p className="mt-1 text-xs text-black/55">
                                Size:{" "}
                                {item.variant.size}
                                {" · "}
                                Color:{" "}
                                {item.variant.color}
                                {" · "}
                                SKU:{" "}
                                {item.variant.sku}
                              </p>
                            </div>

                            <div className="text-sm">
                              Qty:{" "}
                              <span className="font-semibold">
                                {item.quantity}
                              </span>
                              {" · "}
                              {formatPrice(
                                item.unitPrice,
                              )}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

   
   
        <section className="mt-8 border border-black/10 bg-white">
          <div className="flex flex-col gap-4 border-b border-black/10 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold">
                Coupon Management
              </h3>

              <p className="mt-1 text-sm text-black/60">
                Create and manage discount coupons for your customers.
              </p>
            </div>

            <button
              type="button"
              onClick={openCouponModal}
              className="bg-[#0B0B0B] px-5 py-3 text-sm font-semibold text-[#FFF9ED] transition hover:bg-[#D4AF37] hover:text-[#0B0B0B]"
            >
              + Add Coupon
            </button>
          </div>

          {coupons.length === 0 ? (
            <div className="p-8 text-sm text-black/50">
              No coupons created yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[1100px] w-full text-left">
                <thead>
                  <tr className="border-b border-black/10 text-xs uppercase tracking-wider text-black/45">
                    <th className="px-5 py-4">
                      Code
                    </th>

                    <th className="px-5 py-4">
                      Discount
                    </th>

                    <th className="px-5 py-4">
                      Minimum Order
                    </th>

                    <th className="px-5 py-4">
                      Max Discount
                    </th>

                    <th className="px-5 py-4">
                      Usage
                    </th>

                    <th className="px-5 py-4">
                      Validity
                    </th>

                    <th className="px-5 py-4">
                      Status
                    </th>

                    <th className="px-5 py-4">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {coupons.map((coupon) => (
                    <tr
                      key={coupon.id}
                      className="border-b border-black/5 last:border-0"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold">
                          {coupon.code}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm">
                        {coupon.discountType ===
                        "PERCENTAGE"
                          ? `${coupon.discountValue}%`
                          : formatPrice(
                              coupon.discountValue,
                            )}
                      </td>

                      <td className="px-5 py-4 text-sm">
                        {coupon.minimumOrderValue ===
                        null
                          ? "No minimum"
                          : formatPrice(
                              coupon.minimumOrderValue,
                            )}
                      </td>

                      <td className="px-5 py-4 text-sm">
                        {coupon.maximumDiscount ===
                        null
                          ? "—"
                          : formatPrice(
                              coupon.maximumDiscount,
                            )}
                      </td>

                      <td className="px-5 py-4 text-sm">
                        {coupon.usageLimit ===
                        null
                          ? `${coupon.usedCount} used`
                          : `${coupon.usedCount} / ${coupon.usageLimit}`}
                      </td>

                      <td className="px-5 py-4 text-xs text-black/60">
                        <div>
                          {new Date(
                            coupon.startsAt,
                          ).toLocaleString(
                            "en-IN",
                          )}
                        </div>

                        <div className="mt-1">
                          to{" "}
                          {new Date(
                            coupon.expiresAt,
                          ).toLocaleString(
                            "en-IN",
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex px-2.5 py-1 text-xs font-semibold ${
                            coupon.status ===
                            "ACTIVE"
                              ? "bg-green-100 text-green-700"
                              : "bg-black/5 text-black/50"
                          }`}
                        >
                          {coupon.status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openEditCoupon(
                                coupon,
                              )
                            }
                            className="border border-black/15 px-3 py-2 text-xs font-semibold hover:border-[#D4AF37]"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              void handleDeleteCoupon(
                                coupon,
                              )
                            }
                            className="border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

              
      </main>

      {modalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            backgroundColor:
              "rgba(0, 0, 0, 0.65)",
            overflowY: "auto",
            padding: "30px 20px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "1000px",
              margin: "0 auto",
              backgroundColor: "#FFF9ED",
              color: "#0B0B0B",
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                backgroundColor: "#0B0B0B",
                color: "#FFF9ED",
                padding: "20px 24px",
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{
                    color: "#D4AF37",
                    fontSize: "12px",
                    fontWeight: 600,
                    textTransform:
                      "uppercase",
                    letterSpacing:
                      "2px",
                  }}
                >
                  {editingProduct
                    ? "Edit"
                    : "Create"}
                </div>

                <h2
                  style={{
                    margin:
                      "4px 0 0",
                    fontSize:
                      "24px",
                    fontWeight: 700,
                  }}
                >
                  {editingProduct
                    ? "Edit Product"
                    : "Add Product"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                style={{
                  border: "none",
                  background:
                    "transparent",
                  color: "#FFF9ED",
                  fontSize: "30px",
                  lineHeight: 1,
                  padding:
                    "8px 12px",
                  cursor: saving
                    ? "not-allowed"
                    : "pointer",
                }}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              style={{
                padding: "24px",
                maxHeight:
                  "calc(100vh - 120px)",
                overflowY: "auto",
              }}
            >
              {error && (
                <div
                  style={{
                    marginBottom:
                      "20px",
                    border:
                      "1px solid #fecaca",
                    backgroundColor:
                      "#fef2f2",
                    color:
                      "#b91c1c",
                    padding:
                      "12px 16px",
                    fontSize:
                      "14px",
                  }}
                >
                  {error}
                </div>
              )}

              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold">
                    Product name
                  </span>

                  <input
                    value={form.name}
                    onChange={(event) =>
                      updateField(
                        "name",
                        event.target.value,
                      )
                    }
                    className="mt-2 w-full border border-black/15 bg-white px-4 py-3 outline-none focus:border-[#D4AF37]"
                    required
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold">
                    Product SKU
                  </span>

                  <input
                    value={form.sku}
                    onChange={(event) =>
                      updateField(
                        "sku",
                        event.target.value,
                      )
                    }
                    className="mt-2 w-full border border-black/15 bg-white px-4 py-3 outline-none focus:border-[#D4AF37]"
                    required
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold">
                    Slug
                  </span>

                  <input
                    value={form.slug}
                    onChange={(event) =>
                      updateField(
                        "slug",
                        event.target.value,
                      )
                    }
                    className="mt-2 w-full border border-black/15 bg-white px-4 py-3 outline-none focus:border-[#D4AF37]"
                    placeholder="product-name"
                    required
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold">
                    Category
                  </span>

                  <select
                    value={
                      form.categoryId
                    }
                    onChange={(event) =>
                      updateField(
                        "categoryId",
                        event.target.value,
                      )
                    }
                    className="mt-2 w-full border border-black/15 bg-white px-4 py-3 outline-none focus:border-[#D4AF37]"
                    required
                  >
                    <option value="">
                      Select category
                    </option>

                    {categories.map(
                      (category) => (
                        <option
                          key={
                            category.id
                          }
                          value={
                            category.id
                          }
                        >
                          {category.name}
                        </option>
                      ),
                    )}
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-semibold">
                    Material
                  </span>

                  <input
                    value={
                      form.material
                    }
                    onChange={(event) =>
                      updateField(
                        "material",
                        event.target.value,
                      )
                    }
                    className="mt-2 w-full border border-black/15 bg-white px-4 py-3 outline-none focus:border-[#D4AF37]"
                    placeholder="Pure Cotton"
                    required
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold">
                    Main color
                  </span>

                  <input
                    value={form.color}
                    onChange={(event) =>
                      updateField(
                        "color",
                        event.target.value,
                      )
                    }
                    className="mt-2 w-full border border-black/15 bg-white px-4 py-3 outline-none focus:border-[#D4AF37]"
                    placeholder="Black"
                    required
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold">
                    Base price
                  </span>

                  <input
                    type="number"
                    min="1"
                    value={
                      form.basePrice
                    }
                    onChange={(event) =>
                      updateField(
                        "basePrice",
                        Number(
                          event.target.value,
                        ),
                      )
                    }
                    className="mt-2 w-full border border-black/15 bg-white px-4 py-3 outline-none focus:border-[#D4AF37]"
                    required
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold">
                    Discount price
                  </span>

                  <input
                    type="number"
                    min="1"
                    value={
                      form.discountPrice ??
                      ""
                    }
                    onChange={(event) =>
                      updateField(
                        "discountPrice",
                        event.target
                          .value ===
                          ""
                          ? null
                          : Number(
                              event.target
                                .value,
                            ),
                      )
                    }
                    className="mt-2 w-full border border-black/15 bg-white px-4 py-3 outline-none focus:border-[#D4AF37]"
                    placeholder="Optional"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold">
                    Status
                  </span>

                  <select
                    value={
                      form.status
                    }
                    onChange={(event) =>
                      updateField(
                        "status",
                        event.target
                          .value as ProductStatus,
                      )
                    }
                    className="mt-2 w-full border border-black/15 bg-white px-4 py-3 outline-none focus:border-[#D4AF37]"
                  >
                    <option value="ACTIVE">
                      ACTIVE
                    </option>

                    <option value="INACTIVE">
                      INACTIVE
                    </option>

                    <option value="OUT_OF_STOCK">
                      OUT_OF_STOCK
                    </option>
                  </select>
                </label>
              </div>

              <label className="mt-5 block">
                <span className="text-sm font-semibold">
                  Description
                </span>

                <textarea
                  value={
                    form.description
                  }
                  onChange={(event) =>
                    updateField(
                      "description",
                      event.target.value,
                    )
                  }
                  rows={5}
                  className="mt-2 w-full resize-y border border-black/15 bg-white px-4 py-3 outline-none focus:border-[#D4AF37]"
                  required
                />
              </label>

              <AgeGroupSelector
                value={form.ageGroups}
                onChange={(ageGroups) => {
                  updateField(
                    "ageGroups",
                    typeof ageGroups ===
                      "function"
                      ? ageGroups(
                          form.ageGroups,
                        )
                      : ageGroups,
                  );
                }}
              />

              <section className="mt-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="font-semibold">
                      Size & inventory
                    </h4>

                    <p className="mt-1 text-xs text-black/50">
                      Each size has its own
                      price, SKU and stock.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addVariant}
                    className="border border-black/15 bg-white px-4 py-2 text-sm font-semibold hover:border-[#D4AF37]"
                  >
                    + Add Size
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  {form.variants.map(
                    (
                      variant,
                      index,
                    ) => (
                      <div
                        key={`variant-row-${index}`}
                        className="border border-black/10 bg-white p-4"
                      >
                        <div className="grid gap-4 md:grid-cols-5">
                          <label>
                            <span className="text-xs font-semibold text-black/60">
                              Size
                            </span>

                            <select
                              value={
                                variant.size
                              }
                              onChange={(
                                event,
                              ) =>
                                updateVariant(
                                  index,
                                  "size",
                                  event
                                    .target
                                    .value,
                                )
                              }
                              className="mt-2 w-full border border-black/15 px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]"
                              required
                            >
                              <option value="">
                                Select size
                              </option>

                              {SIZES.map(
                                (
                                  size,
                                ) => (
                                  <option
                                    key={
                                      size
                                    }
                                    value={
                                      size
                                    }
                                  >
                                    {size}
                                  </option>
                                ),
                              )}
                            </select>
                          </label>

                          <label>
                            <span className="text-xs font-semibold text-black/60">
                              Color
                            </span>

                            <input
                              value={
                                variant.color
                              }
                              onChange={(
                                event,
                              ) =>
                                updateVariant(
                                  index,
                                  "color",
                                  event
                                    .target
                                    .value,
                                )
                              }
                              className="mt-2 w-full border border-black/15 px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]"
                              required
                            />
                          </label>

                          <label>
                            <span className="text-xs font-semibold text-black/60">
                              Variant SKU
                            </span>

                            <input
                              value={
                                variant.sku
                              }
                              onChange={(
                                event,
                              ) =>
                                updateVariant(
                                  index,
                                  "sku",
                                  event
                                    .target
                                    .value,
                                )
                              }
                              className="mt-2 w-full border border-black/15 px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]"
                              required
                            />
                          </label>

                          <label>
                            <span className="text-xs font-semibold text-black/60">
                              Price
                            </span>

                            <input
                              type="number"
                              min="1"
                              value={
                                variant.price
                              }
                              onChange={(
                                event,
                              ) =>
                                updateVariant(
                                  index,
                                  "price",
                                  Number(
                                    event
                                      .target
                                      .value,
                                  ),
                                )
                              }
                              className="mt-2 w-full border border-black/15 px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]"
                              required
                            />
                          </label>

                          <label>
                            <span className="text-xs font-semibold text-black/60">
                              Stock
                            </span>

                            <input
                              type="number"
                              min="0"
                              value={
                                variant.stock
                              }
                              onChange={(
                                event,
                              ) =>
                                updateVariant(
                                  index,
                                  "stock",
                                  Number(
                                    event
                                      .target
                                      .value,
                                  ),
                                )
                              }
                              className="mt-2 w-full border border-black/15 px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]"
                              required
                            />
                          </label>
                        </div>

                        {form.variants
                          .length >
                          1 && (
                          <button
                            type="button"
                            onClick={() =>
                              removeVariant(
                                index,
                              )
                            }
                            className="mt-3 text-xs font-semibold text-red-600"
                          >
                            Remove size
                          </button>
                        )}
                      </div>
                    ),
                  )}
                </div>
              </section>

              <section className="mt-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="font-semibold">
                      Product images
                    </h4>

                    <p className="mt-1 text-xs text-black/50">
                      Choose images directly
                      from your device. JPG,
                      PNG and WebP up to 5 MB.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addImage}
                    className="border border-black/15 bg-white px-4 py-2 text-sm font-semibold hover:border-[#D4AF37]"
                  >
                    + Add Image
                  </button>
                </div>

                <div className="mt-4 space-y-4">
                  {form.images.length ===
                  0 ? (
                    <div className="border border-dashed border-black/15 bg-white p-6 text-center">
                      <p className="text-sm text-black/50">
                        No images added yet.
                      </p>

                      <button
                        type="button"
                        onClick={addImage}
                        className="mt-4 bg-[#0B0B0B] px-5 py-3 text-sm font-semibold text-[#FFF9ED]"
                      >
                        Choose Image
                      </button>
                    </div>
                  ) : (
                    form.images.map(
                      (
                        image: ProductInput["images"][number],
                        index: number,
                      ) => (
                        <div
                          key={`image-${index}`}
                          className="border border-black/10 bg-white p-4"
                        >
                          <div className="flex flex-col gap-5 md:flex-row">
                            <div className="h-40 w-40 shrink-0 overflow-hidden bg-[#F6F0E4]">
                              {previewUrls[
                                index
                              ] ||
                              image.imageUrl ? (
                                <img
                                  src={
                                    previewUrls[
                                      index
                                    ] ||
                                    image.imageUrl
                                  }
                                  alt={
                                    image.altText ||
                                    "Product image"
                                  }
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center px-4 text-center text-xs text-black/35">
                                  Image preview
                                </div>
                              )}
                            </div>

                            <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
                              <div>
                                <p className="text-sm font-semibold">
                                  Image{" "}
                                  {index + 1}
                                </p>

                                <p className="mt-1 text-xs text-black/50">
                                  Select an
                                  image from
                                  your device.
                                </p>
                              </div>

                              <div className="flex flex-wrap items-center gap-3">
                                <label
                                  className={`inline-flex items-center border border-black/15 bg-white px-4 py-2.5 text-sm font-semibold ${
                                    uploadingImages.includes(
                                      index,
                                    )
                                      ? "cursor-not-allowed opacity-60"
                                      : "cursor-pointer hover:border-[#D4AF37]"
                                  }`}
                                >
                                  {uploadingImages.includes(
                                    index,
                                  )
                                    ? "Uploading..."
                                    : image.imageUrl
                                      ? "Change Image"
                                      : "Choose Image"}

                                  <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    disabled={uploadingImages.includes(
                                      index,
                                    )}
                                    onChange={(
                                      event,
                                    ) => {
                                      const file =
                                        event
                                          .target
                                          .files?.[0];

                                      if (
                                        file
                                      ) {
                                        void handleImageUpload(
                                          index,
                                          file,
                                        );
                                      }

                                      event.target.value =
                                        "";
                                    }}
                                  />
                                </label>

                                <label className="flex items-center gap-2 text-xs font-semibold">
                                  <input
                                    type="checkbox"
                                    checked={
                                      image.isPrimary
                                    }
                                    onChange={() =>
                                      setPrimaryImage(
                                        index,
                                      )
                                    }
                                  />

                                  Primary image
                                </label>

                                <button
                                  type="button"
                                  onClick={() =>
                                    removeImage(
                                      index,
                                    )
                                  }
                                  className="text-xs font-semibold text-red-600 hover:text-red-700"
                                >
                                  Remove
                                </button>
                              </div>

                              <input
                                value={
                                  image.altText ||
                                  ""
                                }
                                onChange={(
                                  event,
                                ) =>
                                  updateImage(
                                    index,
                                    "altText",
                                    event
                                      .target
                                      .value,
                                  )
                                }
                                placeholder="Image description"
                                className="w-full border border-black/15 px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]"
                              />

                              {uploadingImages.includes(
                                index,
                              ) && (
                                <div className="text-xs font-semibold text-[#9A7A16]">
                                  Uploading image...
                                </div>
                              )}

                              {image.imageUrl &&
                                !uploadingImages.includes(
                                  index,
                                ) && (
                                  <div className="text-xs font-semibold text-green-700">
                                    Image uploaded successfully
                                  </div>
                                )}
                            </div>
                          </div>
                        </div>
                      ),
                    )
                  )}
                </div>
              </section>

              <section className="mt-8">
                <h4 className="font-semibold">
                  Store flags
                </h4>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <label className="flex items-center gap-3 border border-black/10 bg-white p-4 text-sm">
                    <input
                      type="checkbox"
                      checked={
                        form.isFeatured
                      }
                      onChange={(event) =>
                        updateField(
                          "isFeatured",
                          event.target
                            .checked,
                        )
                      }
                    />

                    Featured
                  </label>

                  <label className="flex items-center gap-3 border border-black/10 bg-white p-4 text-sm">
                    <input
                      type="checkbox"
                      checked={
                        form.isNewArrival
                      }
                      onChange={(event) =>
                        updateField(
                          "isNewArrival",
                          event.target
                            .checked,
                        )
                      }
                    />

                    New arrival
                  </label>

                  <label className="flex items-center gap-3 border border-black/10 bg-white p-4 text-sm">
                    <input
                      type="checkbox"
                      checked={
                        form.isBestseller
                      }
                      onChange={(event) =>
                        updateField(
                          "isBestseller",
                          event.target
                            .checked,
                        )
                      }
                    />

                    Bestseller
                  </label>
                </div>
              </section>

              <div className="mt-8 flex flex-col-reverse gap-3 border-t border-black/10 pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="border border-black/15 bg-white px-6 py-3 text-sm font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    saving ||
                    uploadingImages.length >
                      0
                  }
                  className="bg-[#0B0B0B] px-6 py-3 text-sm font-semibold text-[#FFF9ED] disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingProduct
                      ? "Update Product"
                      : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {categoryModalOpen && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center overflow-y-auto bg-black/60 px-4 py-6">
          <div className="w-full max-w-lg bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  Add Category
                </h2>

                <p className="mt-1 text-sm text-black/50">
                  Create a new product category.
                </p>
              </div>

              <button
                type="button"
                onClick={closeCategoryModal}
                disabled={categorySaving}
                className="text-2xl text-black/50 hover:text-black disabled:opacity-50"
              >
                ×
              </button>
            </div>

            {error && (
              <div className="mt-5 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form
              onSubmit={handleCategorySubmit}
              className="mt-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium">
                  Category Name
                </label>

                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(event) =>
                    updateCategoryField(
                      "name",
                      event.target.value,
                    )
                  }
                  className="mt-2 w-full border border-black/15 px-4 py-3 outline-none focus:border-[#D4AF37]"
                  placeholder="Pattu Frocks"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Slug
                </label>

                <input
                  type="text"
                  value={categoryForm.slug}
                  onChange={(event) =>
                    updateCategoryField(
                      "slug",
                      event.target.value,
                    )
                  }
                  className="mt-2 w-full border border-black/15 px-4 py-3 outline-none focus:border-[#D4AF37]"
                  placeholder="pattu-frocks"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Description
                </label>

                <textarea
                  value={
                    categoryForm.description
                  }
                  onChange={(event) =>
                    updateCategoryField(
                      "description",
                      event.target.value,
                    )
                  }
                  rows={3}
                  className="mt-2 w-full resize-none border border-black/15 px-4 py-3 outline-none focus:border-[#D4AF37]"
                  placeholder="Category description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Sort Order
                </label>

                <input
                  type="number"
                  min="0"
                  value={
                    categoryForm.sortOrder
                  }
                  onChange={(event) =>
                    updateCategoryField(
                      "sortOrder",
                      Number(
                        event.target.value,
                      ),
                    )
                  }
                  className="mt-2 w-full border border-black/15 px-4 py-3 outline-none focus:border-[#D4AF37]"
                />
              </div>

              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={
                    categoryForm.isActive
                  }
                  onChange={(event) =>
                    updateCategoryField(
                      "isActive",
                      event.target.checked,
                    )
                  }
                  className="h-4 w-4"
                />

                Active category
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeCategoryModal}
                  disabled={categorySaving}
                  className="flex-1 border border-black/15 px-4 py-3 text-sm font-semibold disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={categorySaving}
                  className="flex-1 bg-[#0B0B0B] px-4 py-3 text-sm font-semibold text-[#FFF9ED] disabled:opacity-50"
                >
                  {categorySaving
                    ? "Creating..."
                    : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {couponModalOpen && (
        <div className="fixed inset-0 z-[100001] flex items-center justify-center overflow-y-auto bg-black/60 px-4 py-6">
          <div className="w-full max-w-2xl bg-[#FFF9ED]">
            <div className="flex items-center justify-between bg-[#0B0B0B] px-6 py-5 text-[#FFF9ED]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">
                  Coupon
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  {editingCoupon
                    ? "Edit Coupon"
                    : "Create Coupon"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeCouponModal}
                disabled={couponSaving}
                className="text-3xl leading-none text-white/70 hover:text-white disabled:opacity-50"
              >
                ×
              </button>
            </div>

            {error && (
              <div className="mx-6 mt-5 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form
              onSubmit={handleCouponSubmit}
              className="space-y-5 p-6"
            >
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold">
                    Coupon Code
                  </span>

                  <input
                    value={couponForm.code}
                    onChange={(event) =>
                      setCouponForm(
                        (current) => ({
                          ...current,
                          code: event.target.value
                            .toUpperCase(),
                        }),
                      )
                    }
                    placeholder="WELCOME10"
                    className="mt-2 w-full border border-black/15 bg-white px-4 py-3 uppercase outline-none focus:border-[#D4AF37]"
                    required
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold">
                    Status
                  </span>

                  <select
                    value={
                      couponForm.status
                    }
                    onChange={(event) =>
                      setCouponForm(
                        (current) => ({
                          ...current,
                          status:
                            event.target
                              .value as AdminCouponInput["status"],
                        }),
                      )
                    }
                    className="mt-2 w-full border border-black/15 bg-white px-4 py-3 outline-none focus:border-[#D4AF37]"
                  >
                    <option value="ACTIVE">
                      ACTIVE
                    </option>

                    <option value="INACTIVE">
                      INACTIVE
                    </option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-semibold">
                    Discount Type
                  </span>

                  <select
                    value={
                      couponForm.discountType
                    }
                    onChange={(event) =>
                      setCouponForm(
                        (current) => ({
                          ...current,
                          discountType:
                            event.target
                              .value as AdminCouponInput["discountType"],
                          maximumDiscount:
                            event.target
                              .value ===
                            "FIXED"
                              ? null
                              : current.maximumDiscount,
                        }),
                      )
                    }
                    className="mt-2 w-full border border-black/15 bg-white px-4 py-3 outline-none focus:border-[#D4AF37]"
                  >
                    <option value="PERCENTAGE">
                      Percentage
                    </option>

                    <option value="FIXED">
                      Fixed Amount
                    </option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-semibold">
                    Discount Value
                  </span>

                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={
                      couponForm.discountValue
                    }
                    onChange={(event) =>
                      setCouponForm(
                        (current) => ({
                          ...current,
                          discountValue:
                            Number(
                              event.target
                                .value,
                            ),
                        }),
                      )
                    }
                    className="mt-2 w-full border border-black/15 bg-white px-4 py-3 outline-none focus:border-[#D4AF37]"
                    required
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold">
                    Minimum Order Value
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      couponForm.minimumOrderValue ??
                      ""
                    }
                    onChange={(event) =>
                      setCouponForm(
                        (current) => ({
                          ...current,
                          minimumOrderValue:
                            event.target
                              .value ===
                            ""
                              ? null
                              : Number(
                                  event.target
                                    .value,
                                ),
                        }),
                      )
                    }
                    placeholder="Optional"
                    className="mt-2 w-full border border-black/15 bg-white px-4 py-3 outline-none focus:border-[#D4AF37]"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold">
                    Maximum Discount
                  </span>

                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={
                      couponForm.maximumDiscount ??
                      ""
                    }
                    disabled={
                      couponForm.discountType ===
                      "FIXED"
                    }
                    onChange={(event) =>
                      setCouponForm(
                        (current) => ({
                          ...current,
                          maximumDiscount:
                            event.target
                              .value ===
                            ""
                              ? null
                              : Number(
                                  event.target
                                    .value,
                                ),
                        }),
                      )
                    }
                    placeholder={
                      couponForm.discountType ===
                      "FIXED"
                        ? "Not used for fixed coupons"
                        : "Optional"
                    }
                    className="mt-2 w-full border border-black/15 bg-white px-4 py-3 outline-none focus:border-[#D4AF37] disabled:bg-black/5 disabled:text-black/40"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold">
                    Usage Limit
                  </span>

                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={
                      couponForm.usageLimit ??
                      ""
                    }
                    onChange={(event) =>
                      setCouponForm(
                        (current) => ({
                          ...current,
                          usageLimit:
                            event.target
                              .value ===
                            ""
                              ? null
                              : Number(
                                  event.target
                                    .value,
                                ),
                        }),
                      )
                    }
                    placeholder="Unlimited"
                    className="mt-2 w-full border border-black/15 bg-white px-4 py-3 outline-none focus:border-[#D4AF37]"
                  />
                </label>

                <div>
                  <span className="text-sm font-semibold">
                    Used Count
                  </span>

                  <div className="mt-2 border border-black/10 bg-black/5 px-4 py-3 text-sm text-black/60">
                    {editingCoupon
                      ? `${editingCoupon.usedCount} used`
                      : "0 used"}
                  </div>
                </div>

                <label className="block">
                  <span className="text-sm font-semibold">
                    Starts At
                  </span>

                  <input
                    type="datetime-local"
                    value={
                      couponForm.startsAt
                    }
                    onChange={(event) =>
                      setCouponForm(
                        (current) => ({
                          ...current,
                          startsAt:
                            event.target
                              .value,
                        }),
                      )
                    }
                    className="mt-2 w-full border border-black/15 bg-white px-4 py-3 outline-none focus:border-[#D4AF37]"
                    required
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold">
                    Expires At
                  </span>

                  <input
                    type="datetime-local"
                    value={
                      couponForm.expiresAt
                    }
                    onChange={(event) =>
                      setCouponForm(
                        (current) => ({
                          ...current,
                          expiresAt:
                            event.target
                              .value,
                        }),
                      )
                    }
                    className="mt-2 w-full border border-black/15 bg-white px-4 py-3 outline-none focus:border-[#D4AF37]"
                    required
                  />
                </label>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-black/10 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeCouponModal}
                  disabled={couponSaving}
                  className="border border-black/15 bg-white px-6 py-3 text-sm font-semibold disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={couponSaving}
                  className="bg-[#0B0B0B] px-6 py-3 text-sm font-semibold text-[#FFF9ED] disabled:opacity-50"
                >
                  {couponSaving
                    ? "Saving..."
                    : editingCoupon
                      ? "Update Coupon"
                      : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
