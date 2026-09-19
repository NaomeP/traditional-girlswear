// apps/admin/src/services/imageUploadService.ts

import { API_BASE_URL } from "../config/api";

type UploadImageResponse = {
  success: boolean;
  message?: string;
  data?: {
    imageUrl: string;
    filename: string;
    originalName: string;
    size: number;
    mimeType: string;
  };
};

export async function uploadProductImage(
  file: File,
): Promise<string> {
  const formData = new FormData();

  formData.append("image", file);

  const response = await fetch(
    `${API_BASE_URL}/uploads/product`,
    {
      method: "POST",
      credentials: "include",
      body: formData,
    },
  );

  const result =
    (await response.json().catch(() => null)) as
      | UploadImageResponse
      | null;

  if (!response.ok) {
    throw new Error(
      result?.message ||
        `Image upload failed (${response.status})`,
    );
  }

  if (!result?.success) {
    throw new Error(
      result?.message ||
        "Image upload failed",
    );
  }

  if (!result.data?.imageUrl) {
    throw new Error(
      "Image upload succeeded but no image URL was returned",
    );
  }

  return `${API_BASE_URL.replace(
    "/api/v1",
    "",
  )}${result.data.imageUrl}`;
}