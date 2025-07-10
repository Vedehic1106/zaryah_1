import { supabase } from '../lib/supabase';
import { emailService } from './emailService';
import { smsService } from './smsService';
import { CartItem } from '../contexts/CartContext';

export interface OrderData {
  id: string;
  user_id: string;
  items: CartItem[];
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  delivery_type: 'standard' | 'instant';
  delivery_address: any;
  friend_delivery?: any;
  tracking_number?: string;
  estimated_delivery?: string;
  payment_intent_id?: string;
  created_at: string;
  updated_at: string;
}

class OrderService {
  async createOrder(orderData: {
    userId: string;
    items: CartItem[];
    totalAmount: number;
    deliveryType: 'standard' | 'instant';
    deliveryAddress: any;
    friendDelivery?: any;
    paymentIntentId?: string;
  }): Promise<OrderData | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert({
          user_id: orderData.userId,
          items: orderData.items,
          total_amount: orderData.totalAmount * 100, // Convert to paise
          delivery_type: orderData.deliveryType,
          delivery_address: orderData.deliveryAddress,
          friend_delivery: orderData.friendDelivery,
          payment_intent_id: orderData.paymentIntentId,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating order:', error);
        return null;
      }

      // Send confirmation communications
      await this.sendOrderConfirmation(data);

      // Create automatic notification for order received
      await this.createOrderNotification(data, 'order_received');

      return data;
    } catch (error) {
      console.error('Error in createOrder:', error);
      return null;
    }
  }

  async updateOrderStatus(
    orderId: string, 
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled',
    trackingNumber?: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status, 
          tracking_number: trackingNumber,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order status:', error);
        return false;
      }

      // Get updated order data for communications
      const { data: orderData } = await supabase
        .from('orders')
        .select(`
          *,
          profiles!orders_user_id_fkey (
            name,
            email
          )
        `)
        .eq('id', orderId)
        .single();

      if (orderData) {
        await this.sendStatusUpdateCommunications(orderData, status, trackingNumber);
        await this.createOrderNotification(orderData, this.getNotificationTypeForStatus(status));
      }

      return true;
    } catch (error) {
      console.error('Error in updateOrderStatus:', error);
      return false;
    }
  }

  private getNotificationTypeForStatus(status: string): string {
    switch (status) {
      case 'confirmed':
        return 'order_confirmed';
      case 'shipped':
        return 'order_dispatched';
      case 'delivered':
        return 'order_delivered';
      case 'cancelled':
        return 'order_cancelled';
      default:
        return 'order_update';
    }
  }

  private async createOrderNotification(orderData: OrderData, notificationType: string) {
    try {
      const notificationMessages = {
        order_received: {
          title: 'Order Received',
          message: `Your order #${orderData.id.slice(-8)} has been received and is being processed.`
        },
        order_confirmed: {
          title: 'Order Confirmed',
          message: `Your order #${orderData.id.slice(-8)} has been confirmed and will be prepared for shipping.`
        },
        order_dispatched: {
          title: 'Order Dispatched',
          message: `Your order #${orderData.id.slice(-8)} has been dispatched${orderData.tracking_number ? ` with tracking number ${orderData.tracking_number}` : ''}.`
        },
        delivery_partner_assigned: {
          title: 'Delivery Partner Assigned',
          message: `A delivery partner has been assigned to your order #${orderData.id.slice(-8)}. You'll be contacted shortly.`
        },
        order_delivered: {
          title: 'Order Delivered',
          message: `Your order #${orderData.id.slice(-8)} has been delivered successfully. Hope you love your handmade treasures!`
        },
        order_cancelled: {
          title: 'Order Cancelled',
          message: `Your order #${orderData.id.slice(-8)} has been cancelled. If you have any questions, please contact support.`
        }
      };

      const notification = notificationMessages[notificationType as keyof typeof notificationMessages];
      
      if (notification) {
        await supabase
          .from('notifications')
          .insert({
            user_id: orderData.user_id,
            type: 'order',
            title: notification.title,
            message: notification.message,
            data: { 
              order_id: orderData.id, 
              status: orderData.status,
              notification_type: notificationType
            }
          });
      }
    } catch (error) {
      console.error('Error creating order notification:', error);
    }
  }

  private async sendOrderConfirmation(orderData: OrderData) {
    try {
      // Get user details
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('name, email')
        .eq('id', orderData.user_id)
        .single();

      if (!userProfile) return;

      // Send email confirmation
      await emailService.sendOrderConfirmation(
        orderData,
        userProfile.email,
        orderData.user_id
      );

      // Send SMS confirmation (if phone number available in delivery address)
      const phoneNumber = orderData.delivery_address?.phone;
      if (phoneNumber) {
        await smsService.sendOrderConfirmationSMS(
          orderData.id,
          orderData.total_amount,
          phoneNumber,
          orderData.user_id
        );
      }
    } catch (error) {
      console.error('Error sending order confirmation:', error);
    }
  }

  private async sendStatusUpdateCommunications(
    orderData: any,
    status: string,
    trackingNumber?: string
  ) {
    try {
      const userEmail = orderData.profiles?.email;
      const phoneNumber = orderData.delivery_address?.phone;

      if (!userEmail) return;

      switch (status) {
        case 'shipped':
          if (trackingNumber) {
            await emailService.sendShippingUpdate(
              orderData,
              trackingNumber,
              userEmail,
              orderData.user_id
            );

            if (phoneNumber) {
              if (orderData.delivery_type === 'instant') {
                await smsService.sendInstantDeliveryUpdateSMS(
                  orderData.id,
                  phoneNumber,
                  orderData.user_id
                );
                // Create delivery partner assigned notification
                await this.createOrderNotification(orderData, 'delivery_partner_assigned');
              } else {
                await smsService.sendShippingUpdateSMS(
                  orderData.id,
                  trackingNumber,
                  phoneNumber,
                  orderData.user_id
                );
              }
            }
          }
          break;

        case 'delivered':
          await emailService.sendDeliveryConfirmation(
            orderData,
            userEmail,
            orderData.user_id
          );

          if (phoneNumber) {
            await smsService.sendDeliveryConfirmationSMS(
              orderData.id,
              phoneNumber,
              orderData.user_id
            );
          }
          break;
      }
    } catch (error) {
      console.error('Error sending status update communications:', error);
    }
  }

  async getOrdersByUser(userId: string): Promise<OrderData[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getOrdersByUser:', error);
      return [];
    }
  }

  async getOrderById(orderId: string): Promise<OrderData | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) {
        console.error('Error fetching order:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getOrderById:', error);
      return null;
    }
  }

  // Simulate Dunzo integration for instant delivery
  async bookDunzoDelivery(orderData: OrderData): Promise<{ success: boolean; trackingId?: string }> {
    try {
      // Simulate Dunzo API call
      console.log('Booking Dunzo delivery for order:', orderData.id);
      
      // Mock API response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const trackingId = `DUNZO${Date.now()}`;
      
      // Update order with tracking number
      await this.updateOrderStatus(orderData.id, 'shipped', trackingId);
      
      return { success: true, trackingId };
    } catch (error) {
      console.error('Error booking Dunzo delivery:', error);
      return { success: false };
    }
  }

  async getAllOrders(): Promise<any[]> {
    try {
      // Fetch all orders with buyer profile
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`*, buyer:profiles!orders_user_id_fkey (name, email, id)`)
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching all orders:', error);
        return [];
      }
      // Collect all unique seller IDs from all order items
      const sellerIds = Array.from(new Set(
        orders.flatMap(order =>
          order.items.map((item: any) => item.product?.sellerId).filter(Boolean)
        )
      ));
      // Fetch all seller profiles
      let sellersMap: Record<string, any> = {};
      if (sellerIds.length > 0) {
        const { data: sellers } = await supabase
          .from('profiles')
          .select('id, name, email')
          .in('id', sellerIds);
        if (sellers) {
          sellersMap = Object.fromEntries(sellers.map((s: any) => [s.id, s]));
        }
      }
      // Attach seller info to each item in each order
      for (const order of orders) {
        order.items = order.items.map((item: any) => ({
          ...item,
          seller: sellersMap[item.product?.sellerId] || null
        }));
      }
      return orders || [];
    } catch (error) {
      console.error('Error in getAllOrders:', error);
      return [];
    }
  }
}

export const orderService = new OrderService();