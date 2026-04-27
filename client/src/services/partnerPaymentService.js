import api from './api.js';
import { loadRazorpaySdk } from '../utils/loadRazorpay.js';

export const partnerPaymentService = {
  // Create payment order for partner registration
  async createRegistrationPayment(partnerType, amount, driverData) {
    try {
      const response = await api.post('/payments/partner/create-order', {
        partnerType,
        amount,
        driverData
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create payment order');
    }
  },

  // Verify payment after successful transaction
  async verifyPayment(paymentData) {
    try {
      const response = await api.post('/payments/partner/verify', paymentData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Payment verification failed');
    }
  },

  // Get payment status
  async getPaymentStatus(paymentId) {
    try {
      const response = await api.get(`/payments/status/${paymentId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get payment status');
    }
  },

  // Initialize Razorpay payment
  async initiateRazorpayPayment(orderData, userDetails, onSuccess, onFailure) {
    await loadRazorpaySdk();

    return new Promise((resolve, reject) => {
      if (!window.Razorpay) {
        reject(new Error('Razorpay SDK not loaded'));
        return;
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'GoElectriQ',
        description: 'Partner Registration Fee',
        order_id: orderData.orderId,
        prefill: {
          name: userDetails.name,
          email: userDetails.email,
          contact: userDetails.phone,
        },
        theme: {
          color: '#00FF00',
        },
        handler: function (response) {
          const paymentData = {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            paymentId: orderData.paymentId
          };
          
          onSuccess(paymentData);
          resolve(response);
        },
        modal: {
          ondismiss: function () {
            onFailure('Payment cancelled by user');
            reject(new Error('Payment cancelled'));
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    });
  }
};

export default partnerPaymentService;