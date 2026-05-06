import axios from 'axios';
import twilio from 'twilio';

/**
 * WhatsApp Cloud API Configuration
 */
const whatsappConfig = {
  apiUrl: process.env.WHATSAPP_API_URL ? process.env.WHATSAPP_API_URL.replace(/\/$/, '') : null,
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
};

/**
 * Validate WhatsApp configuration
 */
const validateWhatsAppConfig = () => {
  const missing = [];
  if (!whatsappConfig.apiUrl) missing.push('WHATSAPP_API_URL');
  if (!whatsappConfig.phoneNumberId) missing.push('WHATSAPP_PHONE_NUMBER_ID');
  if (!whatsappConfig.accessToken) missing.push('WHATSAPP_ACCESS_TOKEN');
  
  if (missing.length > 0) {
    console.warn(`⚠️ WhatsApp configuration incomplete. Missing: ${missing.join(', ')}`);
    return false;
  }
  return true;
};

/**
 * Send WhatsApp message using Meta Cloud API
 */
export const sendWhatsAppMessage = async (to, message) => {
  try {
    // 1. Try Twilio first if credentials exist
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      return await sendWhatsAppViaTwilio(to, message);
    }

    // 2. Fallback to Meta Cloud API if configured
    if (!validateWhatsAppConfig()) {
      console.info('ℹ️ WhatsApp not configured - skipping message to', to);
      return { success: false, reason: 'WhatsApp not configured' };
    }

    // Remove +91 prefix if present and ensure 10 digit number
    const phoneNumber = to.replace(/^\+91/, '').replace(/\D/g, '');
    
    // Add country code for India
    const formattedNumber = `91${phoneNumber}`;

    const url = `${whatsappConfig.apiUrl}/${whatsappConfig.phoneNumberId}/messages`;

    const data = {
      messaging_product: 'whatsapp',
      to: formattedNumber,
      type: 'text',
      text: {
        body: message,
      },
    };

    const response = await axios.post(url, data, {
      headers: {
        'Authorization': `Bearer ${whatsappConfig.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`✅ WhatsApp message sent to ${formattedNumber} (Meta Cloud API)`);
    return response.data;
  } catch (error) {
    // Log error but don't throw - allow booking to proceed
    console.error('❌ WhatsApp sending error:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send WhatsApp template message
 */
export const sendWhatsAppTemplate = async (to, templateName, parameters) => {
  try {
    // Validate configuration - if missing, just warn and return gracefully
    if (!validateWhatsAppConfig()) {
      console.info('ℹ️ WhatsApp not configured - skipping template message to', to);
      return { success: false, reason: 'WhatsApp not configured' };
    }

    const phoneNumber = to.replace(/^\+91/, '').replace(/\D/g, '');
    const formattedNumber = `91${phoneNumber}`;

    const url = `${whatsappConfig.apiUrl}/${whatsappConfig.phoneNumberId}/messages`;

    const data = {
      messaging_product: 'whatsapp',
      to: formattedNumber,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: 'en',
        },
        components: [
          {
            type: 'body',
            parameters: parameters.map(param => ({
              type: 'text',
              text: param,
            })),
          },
        ],
      },
    };

    const response = await axios.post(url, data, {
      headers: {
        'Authorization': `Bearer ${whatsappConfig.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`✅ WhatsApp template sent to ${formattedNumber}`);
    return response.data;
  } catch (error) {
    // Log error but don't throw - allow booking to proceed
    console.error('❌ WhatsApp template error:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send WhatsApp using Twilio
 */
export const sendWhatsAppViaTwilio = async (to, message) => {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';
    
    if (!accountSid || !authToken) {
      console.warn('⚠️ Twilio credentials missing. Skipping message.');
      return null;
    }

    const client = twilio(accountSid, authToken);
    
    // Ensure "to" number is in E.164 format and starts with whatsapp:
    // Assuming Indian numbers if no + prefix
    let formattedTo = to.replace(/\D/g, '');
    if (!to.startsWith('+')) {
      formattedTo = `+91${formattedTo.slice(-10)}`;
    } else {
      formattedTo = to;
    }

    const twilioMessage = await client.messages.create({
      body: message,
      from: from,
      to: `whatsapp:${formattedTo}`,
    });
    
    console.log(`✅ WhatsApp sent via Twilio to ${formattedTo}: ${twilioMessage.sid}`);
    return twilioMessage;
  } catch (error) {
    console.error('❌ Twilio WhatsApp error:', error.message);
    return null; // Return null instead of throwing to avoid breaking main flow
  }
};

/**
 * Verify WhatsApp configuration
 */
export const verifyWhatsAppConfig = () => {
  const hasMeta = !!(whatsappConfig.phoneNumberId && whatsappConfig.accessToken);
  const hasTwilio = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);

  if (!hasMeta && !hasTwilio) {
    console.warn('⚠️  WhatsApp not configured. Messages will not be sent.');
    return false;
  }
  
  if (hasTwilio) {
    console.log('✅ WhatsApp configuration verified (Twilio)');
  } else if (hasMeta) {
    console.log('✅ WhatsApp configuration verified (Meta Cloud API)');
  }
  return true;
};

export default {
  sendWhatsAppMessage,
  sendWhatsAppTemplate,
  sendWhatsAppViaTwilio,
  verifyWhatsAppConfig,
};