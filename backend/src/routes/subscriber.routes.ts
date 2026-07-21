import { Router } from "express";
import { asyncHandler } from "../utils/async-handler.js";
import { subscribe } from "../controllers/subscriber.controller.js";

export const subscriberRouter = Router();

subscriberRouter.post("/", asyncHandler(subscribe));
