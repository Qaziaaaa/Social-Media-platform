import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "../../database/prisma";
import { signAccessToken, signRefreshToken, verifyToken } from "../../utils/jwt";
import { AppError } from "../../middleware/errorHandler";
import type { TokenPayload } from "../../utils/jwt";
import { sendVerificationEmail, sendPasswordResetEmail } from "../../services/email";

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function registerUser(data: {
  username: string;
  email: string;
  password: string;
  fullName: string;
}) {
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email: data.email }, { username: data.username }],
    },
  });

  if (existing) {
    if (existing.email === data.email) {
      throw new AppError(409, "Email already in use");
    }
    throw new AppError(409, "Username already taken");
  }

  const passwordHash = await bcrypt.hash(data.password, 12);
  const verificationToken = generateToken();

  const user = await prisma.user.create({
    data: {
      username: data.username,
      email: data.email,
      passwordHash,
      fullName: data.fullName,
      verificationToken,
    },
    select: {
      id: true,
      username: true,
      email: true,
      fullName: true,
      bio: true,
      avatar: true,
      coverImage: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: { posts: true, followers: true, following: true },
      },
    },
  });

  sendVerificationEmail(data.email, verificationToken).catch(() => {});

  const payload: TokenPayload = { userId: user.id };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  return { user, accessToken, refreshToken };
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new AppError(401, "Invalid email or password");
  }

  const payload: TokenPayload = { userId: user.id };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  const { passwordHash: _, ...safeUser } = user;
  return {
    user: {
      ...safeUser,
      _count: {
        posts: 0,
        followers: 0,
        following: 0,
      },
    },
    accessToken,
    refreshToken,
  };
}

export async function refreshUserToken(refreshToken: string) {
  try {
    const payload = verifyToken(refreshToken);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        bio: true,
        avatar: true,
        coverImage: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { posts: true, followers: true, following: true },
        },
      },
    });

    if (!user) {
      throw new AppError(401, "User not found");
    }

    const newPayload: TokenPayload = { userId: user.id };
    const newAccessToken = signAccessToken(newPayload);
    const newRefreshToken = signRefreshToken(newPayload);

    return { user, accessToken: newAccessToken, refreshToken: newRefreshToken };
  } catch {
    throw new AppError(401, "Invalid refresh token");
  }
}

export async function verifyEmail(token: string) {
  const user = await prisma.user.findFirst({
    where: { verificationToken: token, emailVerified: false },
  });

  if (!user) {
    throw new AppError(400, "Invalid or expired verification token");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, verificationToken: null },
  });
}

export async function forgotPassword(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return;
  }

  const resetToken = generateToken();

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken,
      resetTokenExpires: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  sendPasswordResetEmail(email, resetToken).catch(() => {});
}

export async function resetPassword(token: string, password: string) {
  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpires: { gt: new Date() },
    },
  });

  if (!user) {
    throw new AppError(400, "Invalid or expired reset token");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, resetToken: null, resetTokenExpires: null },
  });
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      fullName: true,
      bio: true,
      avatar: true,
      coverImage: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: { posts: true, followers: true, following: true },
      },
    },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  return user;
}
