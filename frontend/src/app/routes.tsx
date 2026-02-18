import { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import {
  HomePage,
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  NotFoundPage,
  UserProfilePage,
  UserOrdersPage,
  UserAddressesPage,
  WishlistPage,
  CartPage,
  ProductListPage,
  ProductDetailPage,
  CheckoutPage,
  OrderDetailPage,
  OrderSuccessPage,
  ReturnsPage,
  ExchangesPage,
} from "./lazyPages";
import { ProtectedRoute } from "../components/ProtectedRoute/ProtectedRoute";
import { PublicRoute } from "../components/PublicRoute/PublicRoute";
import AdminLayout from "../features/admin/AdminLayout";
import { MainLayout } from "../layouts/MainLayout";
import { AdminDashboard } from "../features/admin/dashboard";
import { BrandList } from "../features/admin/brands";
import { CategoryList } from "../features/admin/categories";
import { OccasionList } from "../features/admin/occasions";
import { ProductList } from "../features/admin/products";
import { ProductTypeList } from "../features/admin/product-types";
import { OrderList } from "../features/admin/orders";
import { ReturnList } from "../features/admin/returns";
import { ExchangeList } from "../features/admin/exchanges";
import { ReviewList } from "../features/admin/reviews";
import { RatingList } from "../features/admin/ratings";
import { ContactUsList } from "../features/admin/contact-us";
import { ContentLayout } from "../features/content/components/ContentLayout";
import {
  AboutContent,
  FAQContent,
  HeroImagesContent,
  HeroImagesMobileContent,
  TestimonialsContent,
  TermsAndConditionsContent,
  PoliciesContent,
  HowItWorksContent,
  StoreDetailsContent,
  Cards1Content,
  Cards2Content,
} from "../features/content/lazyComponents";
import { ROUTES } from "../config/constants";

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh",
            }}
          >
            <CircularProgress />
          </Box>
        }
      >
        <Routes>
          <Route element={<MainLayout />}>
            <Route index element={<HomePage />} />

            <Route
              path={ROUTES.LOGIN}
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path={ROUTES.REGISTER}
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              }
            />
            <Route
              path={ROUTES.FORGOT_PASSWORD}
              element={
                <PublicRoute>
                  <ForgotPasswordPage />
                </PublicRoute>
              }
            />

            <Route path={ROUTES.PRODUCTS} element={<ProductListPage />} />
            <Route path={ROUTES.SHOP} element={<ProductListPage />} />
            <Route
              path={ROUTES.PRODUCT_DETAIL}
              element={<ProductDetailPage />}
            />

            <Route
              path={ROUTES.USER.PROFILE}
              element={
                <ProtectedRoute allowedRoles={["user"]}>
                  <UserProfilePage />
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.USER.ORDERS}
              element={
                <ProtectedRoute allowedRoles={["user"]}>
                  <UserOrdersPage />
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.USER.ORDER_DETAIL}
              element={
                <ProtectedRoute allowedRoles={["user"]}>
                  <OrderDetailPage />
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.USER.ADDRESSES}
              element={
                <ProtectedRoute allowedRoles={["user"]}>
                  <UserAddressesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.USER.WISHLIST}
              element={
                <ProtectedRoute allowedRoles={["user"]}>
                  <WishlistPage />
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.USER.CART}
              element={
                <ProtectedRoute allowedRoles={["user"]}>
                  <CartPage />
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.CHECKOUT}
              element={
                <ProtectedRoute allowedRoles={["user"]}>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.ORDER_SUCCESS}
              element={
                <ProtectedRoute allowedRoles={["user"]}>
                  <OrderSuccessPage />
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.USER.RETURNS}
              element={
                <ProtectedRoute allowedRoles={["user"]}>
                  <ReturnsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.USER.EXCHANGES}
              element={
                <ProtectedRoute allowedRoles={["user"]}>
                  <ExchangesPage />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route
            path={ROUTES.ADMIN.HOME}
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="brands" element={<BrandList />} />
            <Route path="categories" element={<CategoryList />} />
            <Route path="occasions" element={<OccasionList />} />
            <Route path="product-types" element={<ProductTypeList />} />
            <Route path="products" element={<ProductList />} />
            <Route path="orders" element={<OrderList />} />
            <Route path="returns" element={<ReturnList />} />
            <Route path="exchanges" element={<ExchangeList />} />
            <Route path="reviews" element={<ReviewList />} />
            <Route path="ratings" element={<RatingList />} />
            <Route path="contact-us" element={<ContactUsList />} />
            <Route path="content" element={<ContentLayout />}>
              <Route index element={<AboutContent />} />
              <Route path="about" element={<AboutContent />} />
              <Route path="faq" element={<FAQContent />} />
              <Route path="hero-images" element={<HeroImagesContent />} />
              <Route
                path="hero-images-mobile"
                element={<HeroImagesMobileContent />}
              />
              <Route path="testimonials" element={<TestimonialsContent />} />
              <Route path="terms" element={<TermsAndConditionsContent />} />
              <Route path="policies" element={<PoliciesContent />} />
              <Route path="how-it-works" element={<HowItWorksContent />} />
              <Route path="store-details" element={<StoreDetailsContent />} />
              <Route path="cards-1" element={<Cards1Content />} />
              <Route path="cards-2" element={<Cards2Content />} />
            </Route>
          </Route>

          {/* 404 Not Found - Catch all undefined routes */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRoutes;
