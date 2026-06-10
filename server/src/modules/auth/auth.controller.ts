import type { Request, Response } from "express";
import { registerSchema, loginSchema, verifyEmailSchema, forgotPasswordSchema, resetPasswordSchema } from "./auth.validator";
import * as authService from "./auth.service";
import { success } from "../../types/responses";

export async function register(req: Request, res: Response) {
  const data = registerSchema.parse(req.body);
  const result = await authService.registerUser(data);

  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/api/auth",
  });

  res.status(201).json(success({
    user: result.user,
    accessToken: result.accessToken,
  }));
}

export async function login(req: Request, res: Response) {
  const data = loginSchema.parse(req.body);
  const result = await authService.loginUser(data.email, data.password);

  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/api/auth",
  });

  res.json(success({
    user: result.user,
    accessToken: result.accessToken,
  }));
}

export async function refresh(req: Request, res: Response) {
  const token = req.cookies.refreshToken;
  if (!token) {
    res.status(401).json({ success: false, message: "No refresh token" });
    return;
  }

  const result = await authService.refreshUserToken(token);

  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/api/auth",
  });

  res.json(success({
    user: result.user,
    accessToken: result.accessToken,
  }));
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie("refreshToken", { path: "/api/auth" });
  res.json(success({ message: "Logged out" }));
}

export async function verifyEmail(req: Request, res: Response) {
  const { token } = verifyEmailSchema.parse(req.body);
  await authService.verifyEmail(token);
  res.json(success({ message: "Email verified" }));
}

export async function forgotPassword(req: Request, res: Response) {
  const { email } = forgotPasswordSchema.parse(req.body);
  await authService.forgotPassword(email);
  res.json(success({ message: "If the email exists, a reset link has been sent" }));
}

export async function resetPassword(req: Request, res: Response) {
  const { token, password } = resetPasswordSchema.parse(req.body);
  await authService.resetPassword(token, password);
  res.json(success({ message: "Password reset successfully" }));
}

export async function me(req: Request, res: Response) {
  const user = await authService.getCurrentUser(req.user!.userId);
  res.json(success(user));
}
