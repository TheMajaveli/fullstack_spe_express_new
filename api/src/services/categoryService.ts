import { db } from "../database/connection";
import { HttpError } from "../middlewares/errorHandler";
import { randomUUID } from "crypto";

export async function listCategories() {
  const [rows] = await db.execute("SELECT id, name, createdAt FROM categories ORDER BY name ASC");
  return (rows as any[]).map((c) => ({ 
    id: c.id, 
    name: c.name,
    createdAt: c.createdAt 
  }));
}

export async function createCategory(name: string) {
  try {
    const categoryId = randomUUID();
    await db.execute("INSERT INTO categories (id, name) VALUES (?, ?)", [categoryId, name]);
    const [rows] = await db.execute("SELECT id, name, createdAt FROM categories WHERE id = ?", [categoryId]);
    const category = (rows as any[])[0];
    return { id: category.id, name: category.name, createdAt: category.createdAt };
  } catch (error: any) {
    if (error.code === "ER_DUP_ENTRY") {
      throw new HttpError(409, "La catégorie existe déjà", { code: "DUPLICATE" });
    }
    throw error;
  }
}

export async function updateCategory(id: string, name: string) {
  const [result] = await db.execute("UPDATE categories SET name = ? WHERE id = ?", [name, id]);
  const affectedRows = (result as any).affectedRows;
  if (affectedRows === 0) {
    throw new HttpError(404, "Catégorie non trouvée", { code: "NOT_FOUND" });
  }
  const [rows] = await db.execute("SELECT id, name, createdAt FROM categories WHERE id = ?", [id]);
  const category = (rows as any[])[0];
  return { id: category.id, name: category.name, createdAt: category.createdAt };
}

export async function deleteCategory(id: string) {
  const [result] = await db.execute("DELETE FROM categories WHERE id = ?", [id]);
  const affectedRows = (result as any).affectedRows;
  if (affectedRows === 0) {
    throw new HttpError(404, "Catégorie non trouvée", { code: "NOT_FOUND" });
  }
  return { ok: true };
}
