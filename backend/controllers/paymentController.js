import { createRazorpayOrder, verifyRazorpaySignature, fetchPaymentDetails } from '../config/razorpay.js';
import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import TourBooking from '../models/TourBooking.js';
import Driver from '../models/Driver.js';
import User from '../models/User.js';
import crypto from 'crypto';
import { sendRidePaymentSuccessWhatsApp, sendTourPaymentSuccessWhatsApp } from '../services/whatsappService.js';

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (id) => {
  return id && /^[0-9a-fA-F]{24}$/.test(id);
};

export const createPaymentOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;

    // Validate bookingId format
    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'bookingId is required'
      });
    }

    if (!isValidObjectId(bookingId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID format. Must be a valid MongoDB ObjectId (24 character hex string)',
        received: bookingId
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      console.error(`❌ Booking not found for ID: ${bookingId}`);
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
        details: {
          bookingId: bookingId,
          suggestion: 'Please ensure the booking ID is correct and the booking has been created',
          step1: 'First create a booking using POST /api/bookings',
          step2: 'Copy the _id from the response',
          step3: 'Use that _id in this payment request'
        }
      });
    }

    // Check if booking has valid pricing
    if (!booking.pricing || !booking.pricing.totalFare) {
      console.error(`❌ Booking has invalid pricing:`, booking.pricing);
      return res.status(400).json({
        success: false,
        message: 'Booking pricing not calculated properly',
        details: {
          bookingId: bookingId,
          pricing: booking.pricing
        }
      });
    }

    const order = await createRazorpayOrder(
      booking.pricing.totalFare,
      bookingId
    );

    const payment = await Payment.create({
      booking: bookingId,
      user: req.user._id,
      amount: booking.pricing.totalFare,
      razorpayOrderId: order.id,
      paymentMethod: 'razorpay',
      status: 'pending',
    });

    res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    console.error('Payment order creation error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message,
      errorType: error.name
    });
  }
};

// Create payment order for partner registration
export const createPartnerRegistrationPayment = async (req, res) => {
  try {
    const { partnerType, amount, driverData } = req.body;

    // Define registration fees based on partner type
    const registrationFees = {
      'driver': 2000,
      'car-owner': 5000,
      'ev-charger': 10000
    };

    const registrationAmount = amount || registrationFees[partnerType] || 2000;

    // Generate unique receipt ID
    const receiptId = `partner_reg_${Date.now()}`;

    const order = await createRazorpayOrder(registrationAmount, receiptId);

    // Create payment record
    const payment = await Payment.create({
      user: req.user?._id,
      amount: registrationAmount,
      razorpayOrderId: order.id,
      paymentMethod: 'razorpay',
      status: 'pending',
      paymentType: 'partner_registration',
      partnerType: partnerType,
      driverData: driverData // Store driver data temporarily
    });

    res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        paymentId: payment._id
      },
    });
  } catch (error) {
    console.error('Partner registration payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Payment order creation failed'
    });
  }
};

// Verify partner registration payment
export const verifyPartnerRegistrationPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentId
    } = req.body;

    // Verify signature
    const isSignatureValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isSignatureValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Find payment record
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    // Fetch payment details from Razorpay
    const paymentDetails = await fetchPaymentDetails(razorpay_payment_id);

    // Update payment record
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.status = paymentDetails.status === 'captured' ? 'success' : 'failed';
    payment.paidAt = new Date();
    payment.paymentDetails = {
      method: paymentDetails.method,
      email: paymentDetails.email,
      contact: paymentDetails.contact,
      bank: paymentDetails.bank,
      wallet: paymentDetails.wallet,
      vpa: paymentDetails.vpa,
    };

    await payment.save();

    // If payment successful, create driver account
    if (payment.status === 'success' && payment.driverData) {
      try {
        // Hash password for driver
        const bcrypt = await import('bcryptjs');
        const hashedPassword = await bcrypt.hash(payment.driverData.password, 12);

        // Create driver account
        const driver = await Driver.create({
          ...payment.driverData,
          password: hashedPassword,
          isVerified: false,
          registrationPayment: payment._id,
          status: 'pending_verification'
        });

        // Clear sensitive data from payment record
        payment.driverData = undefined;
        await payment.save();

        res.status(200).json({
          success: true,
          message: 'Payment successful and partner registration initiated',
          data: {
            paymentId: payment._id,
            transactionId: payment.transactionId,
            driverId: driver._id,
            status: 'registration_pending'
          }
        });

      } catch (driverError) {
        console.error('Driver creation error:', driverError);
        res.status(200).json({
          success: true,
          message: 'Payment successful but driver registration failed. Please contact support.',
          data: {
            paymentId: payment._id,
            transactionId: payment.transactionId
          }
        });
      }
    } else {
      res.status(200).json({
        success: payment.status === 'success',
        message: payment.status === 'success' ? 'Payment successful' : 'Payment failed',
        data: {
          paymentId: payment._id,
          transactionId: payment.transactionId,
          status: payment.status
        }
      });
    }

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get payment status
export const getPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId)
      .populate('user', 'firstName lastName email phone')
      .populate('booking');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create payment order for ride booking
export const createRidePaymentOrder = async (req, res) => {
  console.log('🎯 PAYMENT CONTROLLER: createRidePaymentOrder called');
  try {
    console.log('📦 Incoming Payment Request Body:', JSON.stringify(req.body, null, 2));
    const { bookingId, amount, rideType, pickupLocation, dropLocation } = req.body;

    // Validate required fields
    if (!bookingId || !amount) {
      console.warn('⚠️ Missing bookingId or amount:', {
        bookingId: !!bookingId,
        amount: !!amount,
        amountValue: amount
      });
      return res.status(400).json({
        success: false,
        message: 'bookingId and amount are required',
        received: { bookingId, amount }
      });
    }

    // Validate bookingId format
    if (!isValidObjectId(bookingId)) {
      console.warn('⚠️ Invalid bookingId format:', bookingId);
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID format. Must be a valid MongoDB ObjectId',
        received: bookingId
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      console.error(`❌ Booking not found for ID: ${bookingId}`);
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
        details: { bookingId }
      });
    }

    // Check if booking has valid pricing
    console.log('🔍 Checking booking pricing:', JSON.stringify(booking.pricing, null, 2));
    if (!booking.pricing || (!booking.pricing.totalFare && booking.pricing.totalFare !== 0)) {
      console.error(`❌ Booking has invalid pricing:`, booking.pricing);
      return res.status(400).json({
        success: false,
        message: 'Booking pricing not calculated properly',
        details: { pricing: booking.pricing }
      });
    }

    console.log('📡 Proceeding to Razorpay with amount:', amount);

    // Generate unique receipt ID
    const receiptId = `ride_${rideType}_${Date.now()}`;

    const order = await createRazorpayOrder(amount, receiptId);

    // Create payment record
    const payment = await Payment.create({
      user: req.user._id,
      booking: bookingId,
      amount: amount,
      razorpayOrderId: order.id,
      paymentMethod: 'razorpay',
      status: 'pending',
      paymentType: 'ride_booking',
      rideType: rideType,
      rideDetails: {
        pickupLocation,
        dropLocation
      }
    });

    res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        paymentId: payment._id
      },
    });
  } catch (error) {
    console.error('Ride payment order creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Payment order creation failed'
    });
  }
};

// Verify ride payment
export const verifyRidePayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentId
    } = req.body;

    // Find payment record
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      console.error('❌ Payment record not found:', paymentId);
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    // Verify signature
    const isSignatureValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isSignatureValid) {
      payment.status = 'failed';
      payment.paymentDetails = { ...payment.paymentDetails, error: 'Signature verification failed' };
      await payment.save();
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    console.log('✅ Signature valid, fetching payment details from Razorpay...');

    // Update payment record with Razorpay info
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;

    try {
      // Fetch details to be 100% sure and get customer info
      const paymentDetails = await fetchPaymentDetails(razorpay_payment_id);
      payment.status = (paymentDetails.status === 'captured' || paymentDetails.status === 'authorized') ? 'success' : 'failed';

      const methodMap = {
        'upi': 'upi',
        'netbanking': 'razorpay',
        'card': 'razorpay',
        'wallet': 'wallet'
      };
      payment.paymentMethod = methodMap[paymentDetails.method] || 'razorpay';
      payment.paidAt = new Date();
      payment.paymentDetails = {
        method: paymentDetails.method,
        email: paymentDetails.email,
        contact: paymentDetails.contact,
        bank: paymentDetails.bank,
        wallet: paymentDetails.wallet,
        vpa: paymentDetails.vpa,
      };
    } catch (fetchError) {
      console.warn('⚠️ Could not fetch payment details, proceeding with signature-only verification:', fetchError.message);
      // If signature is valid, we can still trust it, but status is unknown
      payment.status = 'success';
      payment.paidAt = new Date();
    }

    await payment.save();
    console.log('✅ Payment record updated:', { status: payment.status });

    // Update booking status
    let bookingData = null;
    if (payment.booking && payment.status === 'success') {
      try {
        const booking = await Booking.findById(payment.booking);
        if (booking) {
          const totalFare = booking.pricing?.totalFare || 0;
          const advanceAmount = Math.round(totalFare * 0.2);

          // Calculate total paid across all successful payments for this booking
          const allPayments = await Payment.find({
            booking: booking._id,
            status: 'success'
          });
          const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);

          console.log('💰 Payment Progress:', { totalFare, totalPaid, advanceAmount });

          booking.paidAmount = totalPaid;

          if (totalPaid >= totalFare) {
            booking.paymentStatus = 'paid';
            if (booking.status === 'pending') booking.status = 'confirmed';
          } else if (totalPaid >= advanceAmount) {
            booking.paymentStatus = 'partial';
            booking.status = 'confirmed';
          } else {
            booking.paymentStatus = 'partial';
          }

          await booking.save();
          bookingData = booking;
          console.log('✅ Booking updated:', { status: booking.status, paymentStatus: booking.paymentStatus });

          // Send WhatsApp notification
          try {
            await booking.populate('user', 'firstName lastName email phone');
            await sendRidePaymentSuccessWhatsApp(booking, booking.user, payment._id);

            // Send Email confirmation for successful payment
            try {
              const { sendBookingConfirmationEmail } = await import('../services/emailService.js');
              await sendBookingConfirmationEmail(booking, booking.user);
            } catch (emailErr) {
              console.error('⚠️ Ride Payment Email notification failed:', emailErr.message);
            }
          } catch (whatsappError) {
            console.error('⚠️ WhatsApp notification failed:', whatsappError.message);
          }
        }
      } catch (err) {
        console.error('❌ Error updating booking status:', err.message);
      }
    }

    res.status(200).json({
      success: payment.status === 'success',
      message: payment.status === 'success' ? 'Payment successful' : 'Payment failed',
      data: {
        paymentId: payment._id,
        bookingId: payment.booking,
        status: payment.status,
        amount: payment.amount,
        paidAt: payment.paidAt,
        paymentMethod: payment.paymentMethod,
        bookingStatus: bookingData?.status,
        paymentStatus: bookingData?.paymentStatus
      }
    });

  } catch (error) {
    console.error('❌ Ride payment verification error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create payment order for tour
export const createTourPaymentOrder = async (req, res) => {
  try {
    const { tourBookingId, amount, paymentOption } = req.body;

    if (!tourBookingId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'tourBookingId and amount are required'
      });
    }

    // Validate tourBookingId format
    if (!isValidObjectId(tourBookingId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tour booking ID format. Must be a valid MongoDB ObjectId (24 character hex string)',
        received: tourBookingId,
        example: '6547a9f8c5d2e1b9a4f3c2d1'
      });
    }

    const booking = await TourBooking.findById(tourBookingId);
    if (!booking) {
      console.error(`❌ Tour Booking not found for ID: ${tourBookingId}`);
      return res.status(404).json({
        success: false,
        message: 'Tour Booking not found',
        details: {
          tourBookingId: tourBookingId,
          suggestion: 'Please ensure the tour booking ID is correct and the booking has been created',
          step1: 'First create a tour booking using POST /api/tour-bookings',
          step2: 'Copy the _id from the response',
          step3: 'Use that _id in this payment request'
        }
      });
    }

    // Check if booking has valid pricing/amount
    if (!booking.pricing || !booking.pricing.totalFare) {
      console.error(`❌ Tour Booking has invalid pricing:`, booking.pricing);
      return res.status(400).json({
        success: false,
        message: 'Tour Booking pricing not calculated properly',
        details: {
          tourBookingId: tourBookingId,
          pricing: booking.pricing
        }
      });
    }

    const receiptId = `tour_${Date.now()}`;
    const order = await createRazorpayOrder(amount, receiptId);

    const payment = await Payment.create({
      user: req.user._id,
      tourBooking: tourBookingId,
      amount: amount,
      razorpayOrderId: order.id,
      paymentMethod: 'razorpay',
      status: 'pending',
      paymentType: 'tour_booking',
    });

    res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        paymentId: payment._id
      },
    });
  } catch (error) {
    console.error('Tour payment order creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Payment order creation failed'
    });
  }
};

// Verify tour payment
export const verifyTourPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentId
    } = req.body;

    console.log('🔍 Verifying tour payment:', { paymentId, razorpay_payment_id });

    const isSignatureValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isSignatureValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      console.error('❌ Tour payment record not found:', paymentId);
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    // Update payment record
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;

    try {
      const paymentDetails = await fetchPaymentDetails(razorpay_payment_id);
      payment.status = (paymentDetails.status === 'captured' || paymentDetails.status === 'authorized') ? 'success' : 'failed';

      const methodMap = {
        'upi': 'upi',
        'netbanking': 'razorpay',
        'card': 'razorpay',
        'wallet': 'wallet'
      };
      payment.paymentMethod = methodMap[paymentDetails.method] || 'razorpay';
      payment.paidAt = new Date();
      payment.paymentDetails = {
        method: paymentDetails.method,
        email: paymentDetails.email,
        contact: paymentDetails.contact,
        bank: paymentDetails.bank,
        wallet: paymentDetails.wallet,
        vpa: paymentDetails.vpa,
      };
    } catch (error) {
      console.warn('⚠️ Could not fetch payment details, using signature verification only');
      payment.status = 'success';
      payment.paidAt = new Date();
    }

    await payment.save();
    console.log('✅ Tour payment record saved:', { status: payment.status });

    if (payment.tourBooking && payment.status === 'success') {
      try {
        const booking = await TourBooking.findById(payment.tourBooking);
        if (booking) {
          booking.paymentStatus = 'paid';
          booking.status = 'confirmed';
          booking.paidAmount = payment.amount;

          const tourMethodMap = {
            'upi': 'online',
            'card': 'online',
            'netbanking': 'online',
            'wallet': 'online'
          };
          booking.paymentMethod = tourMethodMap[payment.paymentMethod] || 'online';

          booking.paymentDetails = {
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
            paidAt: new Date(),
          };

          await booking.save();
          console.log('✅ Tour booking updated:', { bookingId: booking._id });

          // Send WhatsApp
          try {
            await booking.populate('user', 'firstName lastName email phone');
            await sendTourPaymentSuccessWhatsApp(booking, booking.user, payment._id);

            // Send Email confirmation for successful payment
            try {
              const { sendBookingConfirmationEmail } = await import('../services/emailService.js');
              await sendBookingConfirmationEmail(booking, booking.user);
            } catch (emailErr) {
              console.error('⚠️ Tour Payment Email notification failed:', emailErr.message);
            }
          } catch (whatsappError) {
            console.error('⚠️ WhatsApp notification failed:', whatsappError.message);
          }
        }
      } catch (err) {
        console.error('❌ Error updating tour booking:', err.message);
      }
    }

    res.status(200).json({
      success: payment.status === 'success',
      message: payment.status === 'success' ? 'Payment successful' : 'Payment failed',
      data: {
        paymentId: payment._id,
        tourBookingId: payment.tourBooking,
        status: payment.status
      }
    });

  } catch (error) {
    console.error('❌ Tour payment verification error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Handle Razorpay Webhook (Professional implementation for robustness)
export const handleRazorpayWebhook = async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];

  const shasum = crypto.createHmac('sha256', secret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest('hex');

  if (digest !== signature) {
    console.error('❌ Invalid Webhook Signature');
    return res.status(400).json({ status: 'invalid_signature' });
  }

  const event = req.body.event;
  console.log('🔔 Razorpay Webhook received:', event);

  if (event === 'payment.captured') {
    const paymentData = req.body.payload.payment.entity;
    const orderId = paymentData.order_id;
    const paymentId = paymentData.id;

    try {
      // Find the internal payment record by Razorpay Order ID
      const payment = await Payment.findOne({ razorpayOrderId: orderId });

      if (payment && payment.status !== 'success') {
        payment.status = 'success';
        payment.razorpayPaymentId = paymentId;
        payment.paidAt = new Date();
        await payment.save();

        console.log('✅ Payment marked as SUCCESS via Webhook:', paymentId);

        // Trigger booking update logic here if needed (similar to verifyRidePayment)
        // For simplicity, we assume the frontend verify call handles it, 
        // but the webhook is here as a fallback.
      }
    } catch (error) {
      console.error('❌ Webhook processing error:', error.message);
    }
  }

  res.status(200).json({ status: 'ok' });
};

// Get payment history
export const getPaymentHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const payments = await Payment.find({ user: req.user._id })
      .populate({
        path: 'booking',
        select: 'bookingId pickupLocation dropLocation cabType rideType pricing distance',
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments({ user: req.user._id });

    console.log('📋 Payment History Fetched:', {
      userId: req.user._id,
      count: payments.length,
      hasBookingData: payments.map(p => ({ id: p._id, hasBooking: !!p.booking }))
    });

    res.status(200).json({
      success: true,
      data: payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('❌ Error in getPaymentHistory:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};