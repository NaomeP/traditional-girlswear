import { Router } from "express";
import { getShippingQuote } from "../controllers/shippingController";
const router = Router(); router.get("/quote", getShippingQuote); export default router;
