import api, { setAccessToken } from "./api";
import type { ApiResponse, AuthResponse, User } from "@/types";

export async function loginUser(email: string, password: string) {
  const { data } = await api.post<ApiResponse<AuthResponse>>("/auth/login", {
    email,
    password,
  });
  if (data.success) {
    setAccessToken(data.data.accessToken);
  }
  return data;
}

export async function registerUser(username: string, email: string, password: string, fullName: string) {
  const { data } = await api.post<ApiResponse<AuthResponse>>("/auth/register", {
    username,
    email,
    password,
    fullName,
  });
  if (data.success) {
    setAccessToken(data.data.accessToken);
  }
  return data;
}

export async function logoutUser() {
  await api.post("/auth/logout");
  setAccessToken(null);
}

export async function refreshToken() {
  const { data } = await api.post<ApiResponse<AuthResponse>>("/auth/refresh");
  if (data.success) {
    setAccessToken(data.data.accessToken);
  }
  return data;
}

export async function getMe() {
  const { data } = await api.get<ApiResponse<User>>("/auth/me");
  return data;
}
