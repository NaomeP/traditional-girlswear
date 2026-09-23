
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router";
import { lazy, Suspense, useEffect } from "react";
import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const ChangePassword = lazy(() => import("./pages/ChangePassword"));
const EditProfile = lazy(() => import("./pages/EditProfile"));
const OrderDetails = lazy(() => import("./pages/OrderDetails"));
const Home = lazy(() => import("./pages/Home"));
const Shop = lazy(() => import("./pages/Shop"));
const ProductDetailsPage = lazy(() => import("./pages/ProductDetails"));
const CartPage = lazy(() => import("./pages/Cart"));
const WishlistPage = lazy(() => import("./pages/Wishlist"));
const Account = lazy(() => import("./pages/Account"));
const Orders = lazy(() => import("./pages/Orders"));
const Addresses = lazy(() => import("./pages/Addresses"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const MyReturns = lazy(() => import("./pages/MyReturns"));
const RequestReturn = lazy(() => import("./pages/RequestReturn"));
const Help = lazy(() => import("./pages/Help"));
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [pathname]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />

      <Suspense fallback={<main className="flex min-h-[40vh] items-center justify-center bg-[#FFF9ED] px-4 text-sm text-[#756d62]">Loading page…</main>}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />

          <Route path="/shop" element={<Shop />} />

          <Route
            path="/product/:slug"
            element={<ProductDetailsPage />}
          />

          <Route path="/cart" element={<CartPage />} />

          <Route path="/checkout" element={<Checkout />} />

          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />

          {/* Public routes */}
          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />
          


          <Route
            path="/reset-password"
            element={<ResetPassword />}
          />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/account" element={<Account />} />

            <Route
              path="/account/orders"
              element={<Orders />}
            />

            <Route
              path="/account/orders/:id"
              element={<OrderDetails />}
            />
 <Route
    path="/account/orders/:id/return"
    element={<RequestReturn />}
  />
  <Route
  path="/account/returns"
  element={<MyReturns />}
/>

            <Route
              path="/account/addresses"
              element={<Addresses />}
            />

            <Route
              path="/account/change-password"
              element={<ChangePassword />}
            />

            <Route
              path="/account/edit-profile"
              element={<EditProfile />}
            />
          </Route>

          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/help" element={<Help />} />
        </Route>
      </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;

