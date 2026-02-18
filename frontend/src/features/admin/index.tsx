import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AdminLayout } from './layouts/AdminLayout';
import { AdminDashboard } from './dashboard';
import { BrandList } from './brands';
import { CategoryList } from './categories';
import { OccasionList } from './occasions';
import { ProductList } from './products';
import { OrderList } from './orders';
import { ReturnList } from './returns';
import { ExchangeList } from './exchanges';
import { ReviewList } from './reviews';
import { RatingList } from './ratings';

export const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="brands" element={<BrandList />} />
        <Route path="categories" element={<CategoryList />} />
        <Route path="occasions" element={<OccasionList />} />
        <Route path="products" element={<ProductList />} />
        <Route path="orders" element={<OrderList />} />
        <Route path="returns" element={<ReturnList />} />
        <Route path="exchanges" element={<ExchangeList />} />
        <Route path="reviews" element={<ReviewList />} />
        <Route path="ratings" element={<RatingList />} />
      </Route>
    </Routes>
  );
};
