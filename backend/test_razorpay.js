import Razorpay from 'razorpay';
import dotenv from 'dotenv';
dotenv.config();

const keyId = "rzp_test_Sk82fOc05dgePr";
const keySecret = "FGyc3y9ozpnPhKO8KkqHDmps";

const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

async function test() {
  try {
    const order = await razorpay.orders.create({
      amount: 100, // 1 INR
      currency: "INR",
      receipt: "test_receipt",
    });
    console.log("✅ Razorpay test successful! Order ID:", order.id);
  } catch (error) {
    console.error("❌ Razorpay test failed:", error);
  }
}

test();
