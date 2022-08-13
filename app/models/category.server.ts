import type { ProductCategory } from "@prisma/client";

import { prisma } from "~/db.server";

export function getProductCategory({ id }: Pick<ProductCategory, "id">) {
  return prisma.productCategory.findFirst({ where: { id } });
}

export async function getProductCategories() {
  return prisma.productCategory.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      imageUrl: true,
      imagePublicId: true,
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function createProductCategory(
  category: Pick<
    ProductCategory,
    "name" | "description" | "imageUrl" | "imagePublicId"
  >
) {
  return prisma.productCategory.create({ data: category });
}

export async function deleteProductCategory({
  id,
}: Pick<ProductCategory, "id">) {
  return prisma.productCategory.delete({ where: { id } });
}

export async function updateProductCategory(
  category: Pick<
    ProductCategory,
    "id" | "name" | "description" | "imageUrl" | "imagePublicId"
  >
) {
  return prisma.productCategory.update({
    data: category,
    where: { id: category.id },
  });
}
