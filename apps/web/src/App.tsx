
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router";
import { useEffect } from "react";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ChangePassword from "./pages/ChangePassword";
import EditProfile from "./pages/EditProfile";
import MainLayout from "./components/layout/MainLayout";
import OrderDetails from "./pages/OrderDetails";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetailsPage from "./pages/ProductDetails";
import CartPage from "./pages/Cart";
import WishlistPage from "./pages/Wishlist";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Account from "./pages/Account";
import Orders from "./pages/Orders";
import Addresses from "./pages/Addresses";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyReturns from "./pages/MyReturns";
import RequestReturn from "./pages/RequestReturn";
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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

