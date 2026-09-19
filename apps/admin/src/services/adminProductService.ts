import {
  ADMIN_PRODUCT_API,
} from "../config/api";

import type {
  Product,
  ProductInput,
} from "../types/product";

type ProductsResponse = {
  success: boolean;
  data: Product[];
  message?: string;
};

type ProductResponse = {
  success: boolean;
  data: Product;
  message?: string;
};

type DeleteResponse = {
  success: boolean;
  message?: string;
};

type ValidationErrors = {
  fieldErrors?: Record<
    string,
    string[] | undefined
  >;
};

type ErrorResponse = {
  success?: boolean;
  message?: string;
  errors?: ValidationErrors;
};

async function handleResponse<T>(
  response: Response,
): Promise<T> {
  const result =
    (await response
      .json()
      .catch(() => null)) as
      | ErrorResponse
      | T
      | null;

  if (!response.ok) {
    const errorResult =
      result as ErrorResponse | null;

    if (
      errorResult?.errors?.fieldErrors
    ) {
      const messages =
        Object.entries(
          errorResult.errors.fieldErrors,
        ).flatMap(
          ([field, errors]) =>
            Array.isArray(errors)
              ? errors.map(
                  (error) =>
                    `${field}: ${error}`,
                )
              : [],
        );

      if (messages.length > 0) {
        throw new Error(
          messages.join(" | "),
        );
      }
    }

    throw new Error(
      errorResult?.message ||
        "Request failed",
    );
  }

  const successResult =
    result as
      | {
          success?: boolean;
          message?: string;
        }
      | null;

  if (!successResult?.success) {
    throw new Error(
      successResult?.message ||
        "Request failed",
    );
  }

  return result as T;
}

export async function getAdminProducts(): Promise<Product[]> {
  const response = await fetch(
    ADMIN_PRODUCT_API,
    {
      method: "GET",
      credentials: "include",
    },
  );

  const result =
    await handleResponse<ProductsResponse>(
      response,
    );

  return result.data;
}

export async function createAdminProduct(
  product: ProductInput,
): Promise<Product> {
  const response = await fetch(
    ADMIN_PRODUCT_API,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(product),
    },
  );

  const result =
    await handleResponse<ProductResponse>(
      response,
    );

  return result.data;
}

export async function updateAdminProduct(
  productId: string,
  product: Partial<ProductInput>,
): Promise<Product> {
  const response = await fetch(
    `${ADMIN_PRODUCT_API}/${productId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(product),
    },
  );

  const result =
    await handleResponse<ProductResponse>(
      response,
    );

  return result.data;
}

export async function deleteAdminProduct(
  productId: string,
): Promise<string> {
  const response = await fetch(
    `${ADMIN_PRODUCT_API}/${productId}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );

  const result =
    await handleResponse<DeleteResponse>(
      response,
    );

  return (
    result.message ||
    "Product deleted successfully"
  );
}