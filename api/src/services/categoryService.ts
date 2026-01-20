import { prisma } from "../prisma/client";
import { HttpError } from "../middlewares/errorHandler";

export async function listCategories() {
  const rows = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return rows.map((c) => ({ id: c.id, name: c.name }));
}

export async function createCategory(name: string) {
  try {
    const c = await prisma.category.create({ data: { name } });
    return { id: c.id, name: c.name };
  } catch {
    throw new HttpError(409, "Category already exists", { code: "DUPLICATE" });
  }
}

export async function updateCategory(id: string, name: string) {
  try {
    const c = await prisma.category.update({ where: { id }, data: { name } });
    return { id: c.id, name: c.name };
  } catch {
    throw new HttpError(404, "Category not found", { code: "NOT_FOUND" });
  }
}

export async function deleteCategory(id: string) {
  await prisma.category.delete({ where: { id } }).catch(() => {
    throw new HttpError(404, "Category not found", { code: "NOT_FOUND" });
  });
  return { ok: true };
}

