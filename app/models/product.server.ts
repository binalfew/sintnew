import type { Product } from "@prisma/client";

import { prisma } from "~/db.server";

export function getProduct({ id }: Pick<Product, "id">) {
  return prisma.product.findFirst({ where: { id } });
}

export async function getProducts() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      sku: true,
      description: true,
      status: true,
      price: true,
      imageUrl: true,
      imagePublicId: true,
      category: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return products.map((product) => ({
    ...product,
    price: formatMoney(product.price),
  }));
}

export async function createProduct(
  product: Pick<
    Product,
    | "name"
    | "sku"
    | "description"
    | "status"
    | "price"
    | "imageUrl"
    | "imagePublicId"
    | "categoryId"
  >
) {
  return prisma.product.create({ data: product });
}

export async function deleteProduct({ id }: Pick<Product, "id">) {
  return prisma.product.delete({ where: { id } });
}

export async function updateProduct(
  product: Pick<
    Product,
    | "id"
    | "name"
    | "sku"
    | "description"
    | "status"
    | "price"
    | "imageUrl"
    | "imagePublicId"
    | "categoryId"
  >
) {
  return prisma.product.update({
    data: product,
    where: { id: product.id },
  });
}

export function formatMoney(amount = 0) {
  const options = {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  };

  if (amount % 100 === 0) {
    options.minimumFractionDigits = 0;
  }

  const formatter = Intl.NumberFormat("en-US", options);

  return formatter.format(amount / 100);
}
