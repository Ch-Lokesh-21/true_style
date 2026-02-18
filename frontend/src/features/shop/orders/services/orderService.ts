import axiosInstance from '../../../../lib/axios';
import type { Order, OrderItem } from '../types';
import type { RazorpayOrderResponse, RazorpayPaymentData } from '../../checkout/types';

const ORDERS_ENDPOINT = '/orders';
const ORDER_ITEMS_ENDPOINT = '/order-items';

export const orderService = {
  // =============== Razorpay Flow ===============
  // Initiate order for Razorpay payment
  initiateOrder: async (addressId: string): Promise<RazorpayOrderResponse> => {
    const response = await axiosInstance.post(`${ORDERS_ENDPOINT}/initiate-order`, null, {
      params: { address_id: addressId }
    });
    return response.data;
  },

  // Confirm order after Razorpay payment
  confirmOrder: async (
    addressId: string,
    paymentData: RazorpayPaymentData
  ): Promise<Order> => {
    const response = await axiosInstance.post(`${ORDERS_ENDPOINT}/confirm-order`, null, {
      params: {
        address_id: addressId,
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_signature: paymentData.razorpay_signature,
      }
    });
    return response.data;
  },

  // =============== COD Flow ===============
  // Place order with Cash on Delivery
  placeOrderCOD: async (addressId: string): Promise<Order> => {
    const response = await axiosInstance.post(`${ORDERS_ENDPOINT}/place-order-cod`, null, {
      params: { address_id: addressId }
    });
    return response.data;
  },

  // =============== User Orders ===============
  // List user's orders
  listMyOrders: async (params?: { skip?: number; limit?: number }): Promise<Order[]> => {
    const response = await axiosInstance.get(`${ORDERS_ENDPOINT}/my`, { params });
    return response.data;
  },

  // Get single order
  getMyOrder: async (id: string): Promise<Order> => {
    const response = await axiosInstance.get(`${ORDERS_ENDPOINT}/my/${id}`);
    return response.data;
  },

  // Update order status (limited statuses for user)
  updateMyOrderStatus: async (id: string, statusId: string): Promise<Order> => {
    const response = await axiosInstance.put(`${ORDERS_ENDPOINT}/my/${id}`, {
      status_id: statusId
    });
    return response.data;
  },

  // =============== Order Items ===============
  // List order items for an order
  listOrderItems: async (orderId: string): Promise<OrderItem[]> => {
    const response = await axiosInstance.get(`${ORDER_ITEMS_ENDPOINT}/my`, {
      params: { order_id: orderId }
    });
    return response.data;
  },

  // Get single order item
  getOrderItem: async (orderItemId: string): Promise<OrderItem> => {
    const response = await axiosInstance.get(`${ORDER_ITEMS_ENDPOINT}/${orderItemId}`);
    return response.data;
  },

  // Get all my order items
  listMyOrderItems: async (params?: { skip?: number; limit?: number }): Promise<OrderItem[]> => {
    const response = await axiosInstance.get(`${ORDER_ITEMS_ENDPOINT}/my`, { params });
    return response.data;
  },
};
