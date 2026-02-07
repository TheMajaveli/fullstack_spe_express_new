import { Request, Response, NextFunction } from "express";
import { forgotPassword, resetPassword, updatePassword } from "../services/authService";
import type { AuthedRequest } from "../middlewares/authenticate";

export async function forgotPasswordController(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body;
    await forgotPassword({ email });
    res.json({ success: true, message: "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé" });
  } catch (e) {
    return next(e);
  }
}

export async function resetPasswordController(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, password } = req.body;
    await resetPassword({ token, newPassword: password });
    res.json({ success: true, message: "Mot de passe réinitialisé avec succès" });
  } catch (e) {
    return next(e);
  }
}

export async function updatePasswordController(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.auth!.userId;
    
    await updatePassword({ userId, currentPassword, newPassword });
    res.json({ success: true, message: "Mot de passe mis à jour avec succès" });
  } catch (e) {
    return next(e);
  }
}
