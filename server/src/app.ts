import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import path from "path";
import wishlistRoutes from "./routes/wishlistRoutes";
import adminProductRoutes from "./routes/adminProductRoutes";
import adminCategoryRoutes from "./routes/adminCategoryRoutes";
import adminDashboardRoutes from "./routes/adminDashboardRoutes";
//import adminCategoryManagementRoutes from "./routes/adminCategoryManagementRoutes";
//import { router as adminDashboardRoutes } from "./routes/adminDashboardRoutes";
import adminOrderRoutes from "./routes/adminOrderRoutes";
import {
  AuthenticatedRequest,
  requireAuth,
} from "./middleware/authMiddleware";
import adminCouponRoutes from "./routes/adminCouponRoutes";
import { env } from "./config/env";
import prisma from "./config/prisma";
import reviewRoutes from "./routes/reviewRoutes";
import authRoutes from "./routes/authRoutes";
import productRoutes from "./routes/productRoutes";
import orderRoutes from "./routes/orderRoutes";
import addressRoutes from "./routes/addressRoutes";
import imageUploadRoutes from "./routes/imageUploadRoutes";
import returnRoutes from "./routes/returnRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import adminReturnRoutes from "./routes/adminReturnRoutes";
import homePageRoutes from "./routes/homePageRoutes";
import adminHomePageRoutes from "./routes/adminHomePageRoutes";


const app = express();
const allowedOrigins = [
  env.FRONTEND_URL,
  env.ADMIN_URL,
  // Render production sites. Keep these here so a missing/stale dashboard
  // variable cannot block the public storefront.
  "https://traditional-girlswear-web.onrender.com",
  "https://traditional-girlswear-admin.onrender.com",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
  "http://localhost:5177",
].filter((origin): origin is string => Boolean(origin));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(
        new Error(`CORS blocked origin: ${origin}`),
      );
    },
    credentials: true,
  }),
);

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  }),
);
app.use(cookieParser());
app.use(
  "/uploads",
  express.static(
    // Product uploads are stored in /tmp by the Multer route.  Serve that
    // same directory; serving process.cwd()/uploads made every uploaded
    // image URL return 404 because the two directories are different.
    path.resolve("/tmp/uploads"),
  ),
);

app.use(
  express.json({
    limit: "1mb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  }),
);
app.use(
  "/api/v1/admin/dashboard",
  adminDashboardRoutes,
);
app.use(
  "/api/v1/admin/coupons",
  adminCouponRoutes,
);

app.use(
  "/api/v1/orders",
  orderRoutes
  ,
);

app.use(
  "/api/v1/returns",
  returnRoutes,
);
console.log("RETURN ROUTES REGISTERED");
app.use(
  "/api/v1/uploads",
  imageUploadRoutes,
);
app.use(
  "/api/v1/payments",
  paymentRoutes,
);

app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Traditional Girlswear API is running",
  });
});

app.get("/api/v1/admin-test", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Admin route registration test works",
  });
});

app.get(
  "/api/v1/auth/me",
  requireAuth,
  async (req: AuthenticatedRequest, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: req.user!.userId,
        },
        select: {
          id: true,
          name: true,
          email: true,
          mobile: true,
          role: true,
        },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          userId: user.id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
        },
      });
    } catch (error) {
      console.error(
        "Failed to load user:",
        error,
      );

      res.status(500).json({
        success: false,
        message: "Failed to load account",
      });
    }
  },
);
app.use(
  "/api/v1/reviews",
  reviewRoutes,
);
app.use(
  "/api/v1/auth",
  authRoutes,
);
app.use("/api/v1/admin/returns", adminReturnRoutes);
app.use(
  "/api/v1/products",
  productRoutes,
);
app.use("/api/v1/homepage", homePageRoutes);
app.use("/api/v1/admin/homepage", adminHomePageRoutes);

app.use(
  "/api/v1/orders",
  orderRoutes,
);

app.use(
  "/api/v1/addresses",
  addressRoutes,
);

app.use(
  "/api/v1/wishlist",
  wishlistRoutes,
);

app.use(
  "/api/v1/admin/products",
  adminProductRoutes,
);



app.use(
  "/api/v1/admin/categories",
  adminCategoryRoutes,
);
console.log(
  "adminOrderRoutes type:",
  typeof adminOrderRoutes,
);


//app.use(
 // "/api/v1/admin/categories-management",
  //adminCategoryManagementRoutes,
//);


app.use("/api/v1/admin/orders", adminOrderRoutes);
export default app;


