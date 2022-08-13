import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import {
  json,
  redirect,
  unstable_parseMultipartFormData as parseMultipartFormData,
} from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import invariant from "tiny-invariant";
import {
  createProductCategory,
  deleteProductCategory,
  getProductCategory,
  updateProductCategory,
} from "~/models/category.server";
import { requireAdminUser } from "~/session.server";
import { deleteImage, getUploadHandler } from "~/utils/uploader.server";

type LoaderData = {
  category: Awaited<ReturnType<typeof getProductCategory>>;
};

type ActionData = {
  name?: string;
  description?: string;
  image?: string;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireAdminUser(request);
  invariant(params.categoryId, "categoryId not found");
  if (params.categoryId === "new") {
    return json<LoaderData>({ category: null });
  }

  const category = await getProductCategory({ id: params.categoryId });
  invariant(category, `Category not found: ${params.categoryId}`);
  return json<LoaderData>({ category });
};

export const action: ActionFunction = async ({ request, params }) => {
  invariant(params.categoryId, "categoryId not found");

  const clonedRequest = request.clone();
  const formData = await clonedRequest.formData();
  const intent = formData.get("intent");

  if (intent === "cancel") {
    return redirect("/admin/categories");
  }

  if (intent === "delete") {
    const category = await getProductCategory({ id: params.categoryId });
    invariant(category, `Category not found: ${params.categoryId}`);
    deleteImage(category.imagePublicId);
    await deleteProductCategory({ id: params.categoryId });
    return redirect("/admin/categories");
  }

  const name = formData.get("name");
  const description = formData.get("description");
  let image = formData.get("image");

  const errors = {
    name: name ? null : "Name is required",
    description: description ? null : "Description is required",
    image: image ? null : "Cover photo is required",
  };

  const hasErrors = Object.values(errors).some((errorMessage) => errorMessage);
  if (hasErrors) {
    return json(errors);
  }

  invariant(typeof name === "string", "title must be a string");
  invariant(typeof description === "string", "slug must be a string");

  const data = await parseMultipartFormData(
    request,
    getUploadHandler("category")
  );
  image = data.get("image");
  invariant(typeof image === "string", "image must be a string");
  const imageData: { secureUrl: string; publicId: string } = JSON.parse(image);

  if (params.categoryId === "new") {
    await createProductCategory({
      name,
      description,
      imageUrl: imageData.secureUrl,
      imagePublicId: imageData.publicId,
    });
  } else {
    const category = await getProductCategory({ id: params.categoryId });
    invariant(category, `Category not found: ${params.categoryId}`);
    deleteImage(category.imagePublicId);
    await updateProductCategory({
      id: params.categoryId,
      name,
      description,
      imageUrl: imageData.secureUrl,
      imagePublicId: imageData.publicId,
    });
  }

  return redirect("/admin/categories");
};

export default function CategoryRoute() {
  const data = useLoaderData<LoaderData>();
  const errors = useActionData<ActionData>();

  const transition = useTransition();
  const isCreating = transition.submission?.formData.get("intent") === "create";
  const isUpdating = transition.submission?.formData.get("intent") === "update";
  const isDeleting = transition.submission?.formData.get("intent") === "delete";
  const isNewPost = !data.category;

  return (
    <div className="mt-8 space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
      <Form method="post" encType="multipart/form-data">
        <div className="shadow sm:overflow-hidden sm:rounded-md">
          <div className="space-y-6 bg-white py-6 px-4 sm:p-6">
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  autoComplete="name"
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  key={data?.category?.id ?? "new"}
                  defaultValue={data.category?.name}
                />
                {errors?.name ? (
                  <p className="mt-2 text-sm text-red-600" id="name-error">
                    {errors.name}
                  </p>
                ) : null}
              </div>

              <div className="col-span-6">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  id="description"
                  autoComplete="description"
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  key={data?.category?.id ?? "new"}
                  defaultValue={data.category?.description}
                />
                {errors?.description ? (
                  <p className="mt-2 text-sm text-red-600" id="name-error">
                    {errors.description}
                  </p>
                ) : null}
              </div>

              <div className="col-span-6">
                <label className="block text-sm font-medium text-gray-700">
                  Cover photo
                </label>
                <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="image"
                        className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="image"
                          name="image"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          key={data?.category?.id ?? "new"}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </div>
                {errors?.image ? (
                  <p className="mt-2 text-sm text-red-600" id="name-error">
                    {errors.image}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
            {isNewPost ? null : (
              <button
                type="submit"
                name="intent"
                value="delete"
                className="rounded-md bg-red-500 py-2 px-4 text-sm font-medium text-white hover:bg-red-600 focus:bg-red-400 disabled:bg-red-300"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            )}

            <button
              type="submit"
              name="intent"
              value={isNewPost ? "create" : "update"}
              className="ml-3 rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              disabled={isCreating || isUpdating}
            >
              {isNewPost ? (isCreating ? "Creating..." : "Create") : null}
              {isNewPost ? null : isUpdating ? "Updating..." : "Update"}
            </button>

            <button
              type="submit"
              name="intent"
              value="cancel"
              className="ml-3 rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Cancel
            </button>
          </div>
        </div>
      </Form>
    </div>
  );
}
