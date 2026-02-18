import { lazy } from 'react';

export const HomePage = lazy(() =>
  import('../features/home/HomePage').then((module) => ({
    default: module.HomePage,
  }))
);

export const LoginPage = lazy(() =>
  import('../features/auth/components/LoginPage').then((module) => ({
    default: module.LoginPage,
  }))
);

export const RegisterPage = lazy(() =>
  import('../features/auth/components/RegisterPage').then((module) => ({
    default: module.RegisterPage,
  }))
);

export const ForgotPasswordPage = lazy(() =>
  import('../features/auth/components/ForgotPasswordPage').then((module) => ({
    default: module.ForgotPasswordPage,
  }))
);

export const AdminHomePage = lazy(() =>
  import('../features/admin/AdminHomePage').then((module) => ({
    default: module.AdminHomePage,
  }))
);

export const UserProfilePage = lazy(() =>
  import('../features/shop/profile/pages/ProfilePage').then((module) => ({
    default: module.ProfilePage,
  }))
);

export const UserOrdersPage = lazy(() =>
  import('../features/shop/orders/pages/OrdersPage').then((module) => ({
    default: module.OrdersPage,
  }))
);

export const UserAddressesPage = lazy(() =>
  import('../features/shop/addresses/pages/AddressesPage').then((module) => ({
    default: module.AddressesPage,
  }))
);

export const WishlistPage = lazy(() =>
  import('../features/shop/wishlist/pages/WishlistPage').then((module) => ({
    default: module.WishlistPage,
  }))
);

export const CartPage = lazy(() =>
  import('../features/shop/cart/pages/CartPage').then((module) => ({
    default: module.CartPage,
  }))
);

export const ProductListPage = lazy(() =>
  import('../features/shop/products/pages/ProductListPage').then((module) => ({
    default: module.ProductListPage,
  }))
);

export const ProductDetailPage = lazy(() =>
  import('../features/shop/products/pages/ProductDetailPage').then((module) => ({
    default: module.ProductDetailPage,
  }))
);

export const CheckoutPage = lazy(() =>
  import('../features/shop/checkout/pages/CheckoutPage').then((module) => ({
    default: module.CheckoutPage,
  }))
);

export const OrderDetailPage = lazy(() =>
  import('../features/shop/orders/pages/OrderDetailPage').then((module) => ({
    default: module.OrderDetailPage,
  }))
);

export const OrderSuccessPage = lazy(() =>
  import('../features/shop/orders/pages/OrderSuccessPage').then((module) => ({
    default: module.OrderSuccessPage,
  }))
);

export const ReturnsPage = lazy(() =>
  import('../features/shop/returns/pages/ReturnsPage').then((module) => ({
    default: module.ReturnsPage,
  }))
);

export const ExchangesPage = lazy(() =>
  import('../features/shop/exchanges/pages/ExchangesPage').then((module) => ({
    default: module.ExchangesPage,
  }))
);



export const NotFoundPage = lazy(()=> import('./NotFoundPage').then((module) => ({
  default: module.NotFoundPage,
})));