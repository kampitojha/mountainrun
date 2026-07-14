import type { NextFunction, Request, Response } from "express";
import type { AuthenticatedRequest } from "../middleware/clerk-auth.js";

type AsyncRoute = (
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction,
) => Promise<unknown>;

export function asyncHandler(route: AsyncRoute) {
  return (request: Request, response: Response, next: NextFunction) => {
    void route(request as AuthenticatedRequest, response, next).catch(next);
  };
}
