import { Router } from "express";
import { getHomePageContent } from "../controllers/homePageController";
const router = Router(); router.get("/", getHomePageContent); export default router;
