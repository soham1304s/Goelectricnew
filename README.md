# GoElectriQ - Premium Electric Vehicle Mobility Solutions


GoElectriQ is a state-of-the-art, full-stack mobility platform dedicated to premium electric vehicle transportation services in Rajasthan. Built for scale and sustainability, it offers a seamless booking experience for local rides, intercity travel, airport transfers, and curated tours.

## Key Features

###  Booking Experience
- **Multi-Service Engine**: Support for Local Rides, Intercity (One-Way/Round-Trip), Airport Transfers, and Tour Packages.
- **Smart Fare Estimation**: Real-time distance and duration calculation using Google Maps API.
- **20% Advance Payment Model**: Secure booking with a professional 20% advance payment flow via Razorpay.
- **Automated Routing**: Precise pathfinding and vehicle assignment logic.

###  Management Dashboards
- **User Command Center**: Personalized dashboard for users to manage their bookings, ride history, and profiles.
- **Admin Command Center**: A comprehensive suite for administrators to monitor:
  - **Ride Operations**: Live ride tracking and management.
  - **Partner Management**: Onboarding and verification for Drivers, Cab Owners, and EV Station partners.
  - **Financial Analytics**: Transaction history, pending payments, and revenue tracking.
  - **Service Customization**: Dynamic pricing, package management, and offer configurations.

###  Security & Reliability
- **Razorpay Integration**: Professional payment gateway with signature verification and webhook support.
- **Google OAuth**: One-tap secure social login.
- **Verified Communication**: Automated WhatsApp notifications (Twilio) and Email confirmations (Nodemailer).
- **Advanced Validation**: Robust server-side and client-side validation for all booking parameters.

##  Technology Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS 4.0
- **Animations**: Framer Motion & Anime.js
- **Icons**: Lucide React
- **Charts**: Recharts (Admin Analytics)
- **State Management**: React Context API

### Backend
- **Environment**: Node.js
- **Framework**: Express 5.0
- **Database**: MongoDB (Mongoose)
- **Storage**: Cloudinary (Image Hosting)
- **Authentication**: JWT & Passport.js (Google OAuth)
- **Payments**: Razorpay Node SDK
- **Messaging**: Twilio (WhatsApp) & Nodemailer (SMTP)

##  Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account
- Razorpay API keys
- Google Cloud Console Project (Maps & OAuth)
- Cloudinary Account
- Twilio Account

### Root Level Setup
```bash
# Install dependencies for root, client, and backend
npm run install:all
```

### Backend Configuration
1. Navigate to the `backend` directory.
2. Create a `.env` file based on `.env.example`.
3. Provide your MongoDB URI, Razorpay Keys, Google Server Key, etc.
```bash
# Start backend in development mode
npm run dev
```

### Frontend Configuration
1. Navigate to the `client` directory.
2. Create a `.env` file based on `.env.example`.
3. Provide your VITE_API_URL, Google Maps Browser Key, and Razorpay Key ID.
```bash
# Start frontend in development mode
npm run dev
```

### Running the Full Project
From the root directory:
```bash
npm run dev
```

## 🏗️ Project Structure

```text
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI Components
│   │   ├── pages/          # Page Views (Public, User, Admin)
│   │   ├── services/       # API Integration Layer
│   │   ├── context/        # Global State (Auth, Theme)
│   │   └── utils/          # Formatting & Validation
├── backend/                # Node.js Express Backend
│   ├── config/             # Third-party service configs
│   ├── controllers/        # Business Logic
│   ├── models/             # Database Schemas
│   ├── routes/             # API Endpoints
│   ├── services/           # External Service Wrappers
│   └── utils/              # Helper functions & Templates
└── README.md
```

## 🚀 Deployment Checklist

For production deployment:
1. Ensure `NODE_ENV` is set to `production` in the backend.
2. Replace `rzp_test_` keys with `rzp_live_` keys in both `.env` files.
3. Configure the Razorpay Webhook URL to point to `your-domain.com/api/payments/webhook`.
4. Update `CLIENT_URL` in backend `.env` for CORS security.
5. Set up a production MongoDB cluster for optimal performance.

---

**Developed for GoElectriQ - Redefining Electric Mobility in Rajasthan.**
