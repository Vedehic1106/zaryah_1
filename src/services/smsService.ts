import { supabase } from '../lib/supabase';

export interface SMSData {
  to: string;
  message: string;
  userId?: string;
}

class SMSService {
  private async logSMS(smsData: SMSData, status: 'sent' | 'failed' | 'pending', errorMessage?: string) {
    try {
      await supabase
        .from('sms_logs')
        .insert({
          user_id: smsData.userId || null,
          phone_number: smsData.to,
          message: smsData.message,
          status,
          error_message: errorMessage
        });
    } catch (error) {
      console.error('Error logging SMS:', error);
    }
  }

  async sendSMS(smsData: SMSData): Promise<boolean> {
    try {
      // Log SMS as pending
      await this.logSMS(smsData, 'pending');

      // In production, integrate with SMS service like Twilio, AWS SNS, or local providers like MSG91
      console.log('Sending SMS:', smsData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulate success/failure (95% success rate)
      const success = Math.random() > 0.05;
      
      if (success) {
        await this.logSMS(smsData, 'sent');
        return true;
      } else {
        await this.logSMS(smsData, 'failed', 'Simulated SMS service error');
        return false;
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      await this.logSMS(smsData, 'failed', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }

  // SMS Templates
  getOrderConfirmationSMS(orderId: string, totalAmount: number): string {
    return `🎉 GiftFlare: Order ${orderId} confirmed! Total: ₹${(totalAmount / 100).toLocaleString()}. We'll update you on shipping. Track: giftflare.com/orders`;
  }

  getShippingUpdateSMS(orderId: string, trackingNumber: string): string {
    return `📦 GiftFlare: Order ${orderId} shipped! Track with: ${trackingNumber}. Expected delivery in 3-7 days. Track: giftflare.com/orders`;
  }

  getInstantDeliveryUpdateSMS(orderId: string): string {
    return `🚚 GiftFlare: Your instant delivery order ${orderId} is on the way! Delivery partner will contact you shortly. ETA: 2-4 hours.`;
  }

  getDeliveryConfirmationSMS(orderId: string): string {
    return `✅ GiftFlare: Order ${orderId} delivered! Hope you love your handmade treasures. Rate your experience: giftflare.com/rate`;
  }

  getDeliveryAttemptSMS(orderId: string): string {
    return `📞 GiftFlare: Delivery attempted for order ${orderId}. Please ensure someone is available or reschedule: giftflare.com/delivery`;
  }

  // Send specific SMS types
  async sendOrderConfirmationSMS(orderId: string, totalAmount: number, phoneNumber: string, userId: string): Promise<boolean> {
    const message = this.getOrderConfirmationSMS(orderId, totalAmount);
    return this.sendSMS({
      to: phoneNumber,
      message,
      userId
    });
  }

  async sendShippingUpdateSMS(orderId: string, trackingNumber: string, phoneNumber: string, userId: string): Promise<boolean> {
    const message = this.getShippingUpdateSMS(orderId, trackingNumber);
    return this.sendSMS({
      to: phoneNumber,
      message,
      userId
    });
  }

  async sendInstantDeliveryUpdateSMS(orderId: string, phoneNumber: string, userId: string): Promise<boolean> {
    const message = this.getInstantDeliveryUpdateSMS(orderId);
    return this.sendSMS({
      to: phoneNumber,
      message,
      userId
    });
  }

  async sendDeliveryConfirmationSMS(orderId: string, phoneNumber: string, userId: string): Promise<boolean> {
    const message = this.getDeliveryConfirmationSMS(orderId);
    return this.sendSMS({
      to: phoneNumber,
      message,
      userId
    });
  }

  async sendDeliveryAttemptSMS(orderId: string, phoneNumber: string, userId: string): Promise<boolean> {
    const message = this.getDeliveryAttemptSMS(orderId);
    return this.sendSMS({
      to: phoneNumber,
      message,
      userId
    });
  }
}

export const smsService = new SMSService();