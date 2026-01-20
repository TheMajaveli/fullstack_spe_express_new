import type { Request, Response, NextFunction } from "express";
import { createCategory, deleteCategory, listCategories, updateCategory } from "../services/categoryService";

export async function listCategoriesController(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await listCategories();
    return res.json({ success: true, data });
  } catch (e) {
    return next(e);
  }
}

export async function createCategoryController(req: Request, res: Response, next: NextFunction) {
  try {
    const name = String((req.body as any).name || "").trim();
    const data = await createCategory(name);
    return res.status(201).json({ success: true, data });
  } catch (e) {
    return next(e);
  }
}

export async function updateCategoryController(req: Request, res: Response, next: NextFunction) {
  try {
    const id = String((req.params as any).id);
    const name = String((req.body as any).name || "").trim();
    const data = await updateCategory(id, name);
    return res.json({ success: true, data });
  } catch (e) {
    return next(e);
  }
}

export async function deleteCategoryController(req: Request, res: Response, next: NextFunction) {
  try {
    const id = String((req.params as any).id);
    await deleteCategory(id);
    return res.json({ success: true, data: true });
  } catch (e) {
    return next(e);
  }
}

