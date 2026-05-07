import api from './api.js';
import { loadRazorpaySdk } from '../utils/loadRazorpay.js';

export const ridePaymentService = {
  // Create payment order for ride booking
  async createRidePaymentOrder(bookingData) {
    try {
      const response = await api.post('/payments/ride/create-order', bookingData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create payment order');
    }
  },

  // Verify ride payment after successful transaction
  async verifyRidePayment(paymentData) {
    try {
      const response = await api.post('/payments/ride/verify', paymentData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Payment verification failed');
    }
  },

  // Create payment order for tour booking
  async createTourPaymentOrder(bookingData) {
    try {
      const response = await api.post('/payments/tour/create-order', bookingData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create tour payment order');
    }
  },

  // Verify tour payment
  async verifyTourPayment(paymentData) {
    try {
      const response = await api.post('/payments/tour/verify', paymentData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Tour payment verification failed');
    }
  },

  // Get payment history
  async getPaymentHistory(page = 1, limit = 10) {
    try {
      const response = await api.get('/payments/history', { params: { page, limit } });
      return {
        success: true,
        data: response.data?.payments || response.data || [],
        pagination: response.data?.pagination
      };
    } catch (error) {
      console.error('Error fetching payment history:', error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Failed to fetch payment history'
      };
    }
  },

  async initiateRazorpayPayment(orderData, userDetails, rideDetails, onSuccess, onFailure) {
    console.log('🚀 Initiating Razorpay payment with data:', { orderId: orderData.orderId, amount: orderData.amount });
    
    try {
      await loadRazorpaySdk();
      console.log('📦 Razorpay SDK loaded successfully');
    } catch (sdkError) {
      console.error('❌ Failed to load Razorpay SDK:', sdkError);
      if (onFailure) onFailure('Failed to load payment gateway. Please check your internet connection.');
      return;
    }

    return new Promise((resolve, reject) => {
      if (!window.Razorpay) {
        const msg = 'Razorpay SDK not available on window object';
        console.error('❌ ' + msg);
        if (onFailure) onFailure(msg);
        reject(new Error(msg));
        return;
      }

      // Provide default values if rideDetails is not provided
      const rideType = rideDetails?.rideType || 'Standard';
      const description = rideDetails?.tourName ? `Tour: ${rideDetails.tourName}` : `${rideType} Ride Booking`;

      console.log('💳 Opening Razorpay modal with key:', orderData.keyId);

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'GoElectriQ',
        description: description,
        order_id: orderData.orderId,
        prefill: {
          name: userDetails.name,
          email: userDetails.email,
          contact: userDetails.phone,
        },
        theme: {
          color: '#5CE65C',
        },
        handler: function (response) {
          console.log('✅ Razorpay payment handler triggered:', response.razorpay_payment_id);
          const paymentData = {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            paymentId: orderData.paymentId
          };

          if (onSuccess) {
            onSuccess(paymentData);
          }
          resolve(response);
        },
        modal: {
          ondismiss: function () {
            console.log('⚠️ Razorpay modal dismissed by user');
            if (onFailure) {
              onFailure('Payment cancelled by user');
            }
            reject(new Error('Payment cancelled'));
          },
        },
      };

      try {
        const razorpay = new window.Razorpay(options);
        razorpay.on('payment.failed', function (response) {
          console.error('❌ Razorpay payment failed:', response.error);
          if (onFailure) {
            onFailure(response.error.description || 'Payment failed');
          }
        });
        razorpay.open();
        console.log('📱 Razorpay modal.open() called');
      } catch (openError) {
        console.error('❌ Error opening Razorpay modal:', openError);
        if (onFailure) onFailure('Could not open payment window. ' + openError.message);
        reject(openError);
      }
    });
  }
};

export default ridePaymentService;

