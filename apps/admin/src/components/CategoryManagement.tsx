import { useState } from "react";
import type { FormEvent } from "react";

import {
  createAdminCategory,
  deleteAdminCategory,
  getAdminCategories,
  updateAdminCategory,
} from "../services/adminCategoryService";

import type { Category } from "../types/product";

type CategoryManagementProps = {
  categories: Category[];
  onCategoriesChange: (
    categories: Category[],
  ) => void;
};

type CategoryForm = {
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
};

const EMPTY_CATEGORY_FORM: CategoryForm = {
  name: "",
  slug: "",
  description: "",
  isActive: true,
  sortOrder: 0,
};

function createSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function CategoryManagement({
  categories,
  onCategoriesChange,
}: CategoryManagementProps) {
  const [modalOpen, setModalOpen] =
    useState(false);

  const [editingCategoryId, setEditingCategoryId] =
    useState<string | null>(null);

  const [form, setForm] =
    useState<CategoryForm>({
      ...EMPTY_CATEGORY_FORM,
    });

  const [saving, setSaving] =
    useState(false);

const [loading] =
  useState(false);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  const isEditing =
    editingCategoryId !== null;

  function openCreateModal(): void {
    setEditingCategoryId(null);

    setForm({
      ...EMPTY_CATEGORY_FORM,
    });

    setError("");
    setModalOpen(true);
  }

  function openEditModal(
    category: Category,
  ): void {
    setEditingCategoryId(category.id);

    setForm({
      name: category.name,
      slug: category.slug,
      description:
        category.description ?? "",
      isActive: category.isActive,
      sortOrder: category.sortOrder,
    });

    setError("");
    setModalOpen(true);
  }

  function closeModal(): void {
    if (saving) {
      return;
    }

    setModalOpen(false);
    setEditingCategoryId(null);
    setError("");
  }

  function updateField<
    K extends keyof CategoryForm,
  >(
    field: K,
    value: CategoryForm[K],
  ): void {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleNameChange(
    value: string,
  ): void {
    setForm((current) => ({
      ...current,
      name: value,
      slug: current.slug
        ? current.slug
        : createSlug(value),
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const name =
        form.name.trim();

      const slug =
        form.slug.trim() ||
        createSlug(name);

      if (!name) {
        throw new Error(
          "Category name is required",
        );
      }

      if (!slug) {
        throw new Error(
          "Category slug is required",
        );
      }

      if (
        !Number.isInteger(
          form.sortOrder,
        ) ||
        form.sortOrder < 0
      ) {
        throw new Error(
          "Sort order must be a valid number",
        );
      }

      const categoryData = {
        name,
        slug,
        description:
          form.description.trim(),
        imageUrl: "",
        isActive:
          form.isActive,
        sortOrder:
          form.sortOrder,
      };

      if (isEditing) {
        await updateAdminCategory(
          editingCategoryId,
          categoryData,
        );
      } else {
        await createAdminCategory(
          categoryData,
        );
      }

      const updatedCategories =
        await getAdminCategories();

      onCategoriesChange(
        updatedCategories,
      );

      setForm({
        ...EMPTY_CATEGORY_FORM,
      });

      setEditingCategoryId(null);
      setModalOpen(false);
    } catch (err) {
      console.error(
        "Failed to save category:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save category",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(
    category: Category,
  ): Promise<void> {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${category.name}"?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(category.id);
      setError("");

      await deleteAdminCategory(
        category.id,
      );

      const updatedCategories =
        await getAdminCategories();

      onCategoriesChange(
        updatedCategories,
      );
    } catch (err) {
      console.error(
        "Failed to delete category:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete category",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <section className="mt-8 border border-black/10 bg-white">
        <div className="flex flex-col gap-4 border-b border-black/10 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              Category Management
            </h3>

            <p className="mt-1 text-sm text-black/60">
              Manage the categories used
              for your products.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="bg-[#0B0B0B] px-5 py-3 text-sm font-semibold text-[#FFF9ED] transition hover:bg-[#D4AF37] hover:text-[#0B0B0B]"
          >
            + Add Category
          </button>
        </div>

        {error && !modalOpen && (
          <div className="mx-5 mt-5 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-8 text-sm text-black/50">
            Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-sm text-black/50">
            No categories found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full text-left">
              <thead>
                <tr className="border-b border-black/10 text-xs uppercase tracking-wider text-black/45">
                  <th className="px-5 py-4">
                    Category
                  </th>

                  <th className="px-5 py-4">
                    Slug
                  </th>

                  <th className="px-5 py-4">
                    Status
                  </th>

                  <th className="px-5 py-4">
                    Sort Order
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

                        {category.description && (
                          <p className="mt-1 max-w-md text-xs text-black/50">
                            {
                              category.description
                            }
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm text-black/60">
                        {category.slug}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex px-2.5 py-1 text-xs font-semibold ${
                            category.isActive
                              ? "bg-green-50 text-green-700"
                              : "bg-black/5 text-black/50"
                          }`}
                        >
                          {category.isActive
                            ? "ACTIVE"
                            : "INACTIVE"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm">
                        {
                          category.sortOrder
                        }
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(
                                category,
                              )
                            }
                            disabled={
                              deletingId ===
                              category.id
                            }
                            className="border border-black/15 bg-white px-4 py-2 text-xs font-semibold transition hover:border-[#D4AF37] hover:bg-[#FFF9ED] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                category,
                              )
                            }
                            disabled={
                              deletingId ===
                              category.id
                            }
                            className="border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingId ===
                            category.id
                              ? "Deleting..."
                              : "Delete"}
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

      {modalOpen && (
        <div className="fixed inset-0 z-[100000] overflow-y-auto bg-black/65 px-4 py-8">
          <div className="mx-auto w-full max-w-lg bg-[#FFF9ED]">
            <div className="flex items-center justify-between bg-[#0B0B0B] px-6 py-5 text-[#FFF9ED]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">
                  Category
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  {isEditing
                    ? "Edit Category"
                    : "Add Category"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="px-2 text-3xl leading-none text-white/80 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6"
            >
              {error && (
                <div className="mb-5 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <label className="block">
                <span className="text-sm font-semibold">
                  Category name
                </span>

                <input
                  value={form.name}
                  onChange={(event) =>
                    handleNameChange(
                      event.target.value,
                    )
                  }
                  placeholder="Cotton Frocks"
                  className="mt-2 w-full border border-black/15 bg-white px-4 py-3 outline-none focus:border-[#D4AF37]"
                  required
                />
              </label>

              <label className="mt-5 block">
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
                  placeholder="cotton-frocks"
                  className="mt-2 w-full border border-black/15 bg-white px-4 py-3 outline-none focus:border-[#D4AF37]"
                  required
                />
              </label>

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
                  rows={4}
                  placeholder="Traditional cotton frocks for girls"
                  className="mt-2 w-full resize-y border border-black/15 bg-white px-4 py-3 outline-none focus:border-[#D4AF37]"
                />
              </label>

              <label className="mt-5 block">
                <span className="text-sm font-semibold">
                  Sort order
                </span>

                <input
                  type="number"
                  min="0"
                  value={
                    form.sortOrder
                  }
                  onChange={(event) =>
                    updateField(
                      "sortOrder",
                      Number(
                        event.target.value,
                      ),
                    )
                  }
                  className="mt-2 w-full border border-black/15 bg-white px-4 py-3 outline-none focus:border-[#D4AF37]"
                />
              </label>

              <label className="mt-5 flex items-center gap-3 border border-black/10 bg-white p-4 text-sm">
                <input
                  type="checkbox"
                  checked={
                    form.isActive
                  }
                  onChange={(event) =>
                    updateField(
                      "isActive",
                      event.target.checked,
                    )
                  }
                />

                Category is active
              </label>

              <div className="mt-6 flex flex-col-reverse gap-3 border-t border-black/10 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="border border-black/15 bg-white px-6 py-3 text-sm font-semibold disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#0B0B0B] px-6 py-3 text-sm font-semibold text-[#FFF9ED] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? isEditing
                      ? "Saving..."
                      : "Creating..."
                    : isEditing
                      ? "Save Changes"
                      : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
