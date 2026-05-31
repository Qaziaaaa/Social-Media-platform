import type { Request, Response } from "express";
import { registerSchema, loginSchema } from "./auth.validator";
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

export async function me(req: Request, res: Response) {
  const user = await authService.getCurrentUser(req.user!.userId);
  res.json(success(user));
}
