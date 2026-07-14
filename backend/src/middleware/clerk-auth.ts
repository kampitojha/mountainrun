import { createClerkClient, verifyToken } from "@clerk/backend";
import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { ApiError } from "../utils/api-error.js";

export type AuthenticatedRequest = Request & {
  auth?: {
    userId: string;
    sessionId?: string;
  };
};

const clerkClient = env.clerkSecretKey
  ? createClerkClient({ secretKey: env.clerkSecretKey })
  : null;

export async function requireClerkAuth(
  request: AuthenticatedRequest,
  _response: Response,
  next: NextFunction,
) {
  try {
    if (!env.clerkSecretKey) {
      if (env.nodeEnv === "production") {
        throw new ApiError(500, "Clerk is not configured on the server");
      }

      // Allow local development without Clerk when secret is missing.
      next();
      return;
    }

    const header = request.header("authorization");
    if (!header?.startsWith("Bearer ")) {
      throw new ApiError(401, "Authentication required. Sign in and try again.");
    }

    const token = header.slice("Bearer ".length).trim();
    if (!token) {
      throw new ApiError(401, "Authentication required. Sign in and try again.");
    }

    const payload = await verifyToken(token, {
      secretKey: env.clerkSecretKey,
    });

    if (!payload.sub) {
      throw new ApiError(401, "Invalid authentication token");
    }

    request.auth = {
      userId: payload.sub,
      sessionId: typeof payload.sid === "string" ? payload.sid : undefined,
    };

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
      return;
    }

    next(new ApiError(401, "Invalid or expired authentication token"));
  }
}

export async function requireAdmin(
  request: AuthenticatedRequest,
  _response: Response,
  next: NextFunction,
) {
  try {
    if (!env.clerkSecretKey || !clerkClient) {
      if (env.nodeEnv !== "production") {
        next();
        return;
      }
      throw new ApiError(500, "Clerk is not configured on the server");
    }

    if (!request.auth?.userId) {
      throw new ApiError(401, "Authentication required");
    }

    const user = await clerkClient.users.getUser(request.auth.userId);
    const role = (user.publicMetadata?.role ?? user.privateMetadata?.role) as
      | string
      | undefined;

    if (role !== "admin" && role !== "super_admin") {
      throw new ApiError(403, "Admin access required");
    }

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
      return;
    }

    next(new ApiError(403, "Admin access required"));
  }
}
