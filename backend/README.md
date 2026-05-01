# GoElectric Backend API

Welcome to the **GoElectric** backend repository! This Node.js/Express application powers the complete infrastructure for the GoElectric cab booking and electric vehicle platform. It serves the frontend client and manages data storage, payments, authentication, and external service integrations.

##  Tech Stack

- **Runtime:** [Node.js](https://nodejs.org/) (ES Modules)
- **Framework:** [Express.js](https://expressjs.com/) v5
- **Database:** [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/)
- **Authentication:** [Passport.js](https://www.passportjs.org/) (Google OAuth 2.0) & [JSON Web Tokens (JWT)](https://jwt.io/)
- **Payment Gateway:** [Razorpay](https://razorpay.com/)
- **Media Storage:** [Cloudinary](https://cloudinary.com/) & [Multer](https://github.com/expressjs/multer)
- **Security:** Helmet, CORS, Express Rate Limit, bcryptjs
- **Other utilities:** Nodemailer, pdfkit, csv-writer, dayjs

##  Project Structure

```text
Goelectricnew-main/
├── backend
│   ├── config
│   │   ├── cloudinary.js
│   │   ├── database.js
│   │   ├── multer.js
│   │   ├── nodemailer.js
│   │   ├── passport.js
│   │   ├── razorpay.js
│   │   └── whatsapp.js
│   ├── controllers
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── bookingController.js
│   │   ├── chargingBookingController.js
│   │   ├── chargingEnquiryController.js
│   │   ├── chargingStationController.js
│   │   ├── driverController.js
│   │   ├── feedbackController.js
│   │   ├── homeChargerController.js
│   │   ├── homeChargerInstallationLeadController.js
│   │   ├── locationController.js
│   │   ├── offerController.js
│   │   ├── packageController.js
│   │   ├── partnerController.js
│   │   ├── paymentController.js
│   │   ├── pricingController.js
│   │   ├── tourBookingController.js
│   │   ├── uploadController.js
│   │   └── userController.js
│   ├── logs
│   ├── middleware
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   ├── rateLimiter.js
│   │   ├── roleCheck.js
│   │   └── validation.js
│   ├── models
│   │   ├── Booking.js
│   │   ├── CabPartner.js
│   │   ├── ChargingEnquiry.js
│   │   ├── ChargingStation.js
│   │   ├── ChargingStationBooking.js
│   │   ├── Driver.js
│   │   ├── Feedback.js
│   │   ├── HomeChargerInstallationLead.js
│   │   ├── Offer.js
│   │   ├── Package.js
│   │   ├── Payment.js
│   │   ├── Pricing.js
│   │   ├── TourBooking.js
│   │   ├── Transaction.js
│   │   └── User.js
│   ├── routes
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── chargingBookingRoutes.js
│   │   ├── chargingEnquiryRoutes.js
│   │   ├── driverRoutes.js
│   │   ├── feedbackRoutes.js
│   │   ├── homeChargerInstallationLeadRoutes.js
│   │   ├── locationRoutes.js
│   │   ├── offerRoutes.js
│   │   ├── packageRoutes.js
│   │   ├── partnerRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── pricingRoutes.js
│   │   ├── tourBookingRoutes.js
│   │   └── userRoutes.js
│   ├── services
│   │   ├── emailService.js
│   │   ├── notificationService.js
│   │   ├── smsService.js
│   │   └── whatsappService.js
│   ├── utils
│   │   ├── clearAllBookings.js
│   │   ├── csvExporter.js
│   │   ├── deleteAllUserHistory.js
│   │   ├── deleteMineCar.js
│   │   ├── distanceCalculator.js
│   │   ├── emailTemplates.js
│   │   ├── fareCalculator.js
│   │   ├── logger.js
│   │   ├── migrateTourPayments.js
│   │   ├── pdfGenerator.js
│   │   ├── seed.js
│   │   └── whatsappTemplates.js
│   ├── validators
│   │   ├── authValidator.js
│   │   ├── bookingValidator.js
│   │   └── userValidator.js
│   ├── API_TESTING_GUIDE.md
│   ├── FINAL_5_APIS_TESTING_FORMAT.md
│   ├── FINAL_TESTING_STATUS.md
│   ├── PAYMENT_API_DEBUGGING_GUIDE.md
│   ├── README.md
│   ├── TESTING_CHECKLIST.md
│   ├── WHATSAPP_NOTIFICATION_TESTING.md
│   ├── api_repose.md
│   ├── package-lock.json
│   ├── package.json
│   └── server.js
├── client
│   ├── src
│   │   ├── components
│   │   │   ├── Home
│   │   │   │   ├── Home.jsx
│   │   │   │   └── MacBookShowcase.jsx
│   │   │   ├── auth
│   │   │   │   ├── AdminAuthLayout.jsx
│   │   │   │   ├── AuthButton.jsx
│   │   │   │   ├── FormInput.jsx
│   │   │   │   └── SocialButton.jsx
│   │   │   ├── common
│   │   │   │   └── ImageWithFallback.jsx
│   │   │   ├── ui
│   │   │   │   ├── button.jsx
│   │   │   │   └── input.jsx
│   │   │   ├── AuthImageSlider.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── ImageUpload.jsx
│   │   │   ├── Loader.jsx
│   │   │   ├── LocationPickerComponent.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── OfferBanner.jsx
│   │   │   ├── PartnerRegistrationModal.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── RideBookingModal_NEW.jsx
│   │   │   ├── Services.jsx
│   │   │   ├── ThemeToggle.jsx
│   │   │   ├── TourBookingModal.jsx
│   │   │   └── WhatsAppButton.jsx
│   │   ├── config
│   │   │   └── api.config.json
│   │   ├── context
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── hooks
│   │   │   ├── useAuth.js
│   │   │   └── useSessionTimeout.js
│   │   ├── pages
│   │   │   ├── admin
│   │   │   │   ├── AdminLayout.jsx
│   │   │   │   ├── AdminLoginPage.jsx
│   │   │   │   ├── AdminProfilePage.jsx
│   │   │   │   ├── AirportRidesPage.jsx
│   │   │   │   ├── CabPartnerDashboard.jsx
│   │   │   │   ├── ChargingBookingDashboard.jsx
│   │   │   │   ├── DashboardPage.jsx
│   │   │   │   ├── DriverBookingDashboard.jsx
│   │   │   │   ├── FeedbackPage.jsx
│   │   │   │   ├── OffersPage.jsx
│   │   │   │   ├── PackagesPage.jsx
│   │   │   │   ├── PaymentsPage.jsx
│   │   │   │   ├── PendingPaymentsDashboard.jsx
│   │   │   │   ├── PricingPage.jsx
│   │   │   │   ├── RidesPage.jsx
│   │   │   │   ├── SettingsPage.jsx
│   │   │   │   ├── ToursPage.jsx
│   │   │   │   └── UsersPage.jsx
│   │   │   ├── publicpage
│   │   │   │   ├── Aboutpage.jsx
│   │   │   │   ├── DriverPartnerPolicyPage.jsx
│   │   │   │   ├── PrivacyPolicyPage.jsx
│   │   │   │   ├── PublicPricingPage.jsx
│   │   │   │   ├── RefundPolicyPage.jsx
│   │   │   │   ├── ReviewsPage.jsx
│   │   │   │   ├── ServicesPage.jsx
│   │   │   │   ├── TermsAndConditionsPage.jsx
│   │   │   │   ├── contactpage.jsx
│   │   │   │   └── feedbackpage.jsx
│   │   │   ├── user
│   │   │   │   ├── BookingConfirmationPage.jsx
│   │   │   │   ├── RidesPage.jsx
│   │   │   │   ├── ToursPage.jsx
│   │   │   │   ├── UserLayout.jsx
│   │   │   │   └── UserProfile.jsx
│   │   │   ├── Airportride.jsx
│   │   │   ├── CabPartnerPage.jsx
│   │   │   ├── ChargingBookingPage.jsx
│   │   │   ├── DriverPartnerPage.jsx
│   │   │   ├── ForgotPasswordPage.jsx
│   │   │   ├── IntercityRide.jsx
│   │   │   ├── LocalRide.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   └── ToursPage.jsx
│   │   ├── services
│   │   │   ├── adminService.js
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── bookingService.js
│   │   │   ├── feedbackService.js
│   │   │   ├── googleMapsService.js
│   │   │   ├── googlePlacesService.js
│   │   │   ├── locationService.js
│   │   │   ├── offerService.js
│   │   │   ├── packageService.js
│   │   │   ├── partnerPaymentService.js
│   │   │   ├── pricingService.js
│   │   │   ├── rateService.js
│   │   │   ├── retryUtils.js
│   │   │   ├── ridePaymentService.js
│   │   │   └── userService.js
│   │   ├── styles
│   │   │   ├── Auth.css
│   │   │   └── Loader.css
│   │   ├── utils
│   │   │   ├── bookingValidator.js
│   │   │   ├── consoleFilters.js
│   │   │   ├── distanceCalculator.js
│   │   │   ├── googleMapsApiTester.js
│   │   │   ├── imageUrl.js
│   │   │   └── loadRazorpay.js
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── package-lock.json
└── package.json
```

## ⚡ Core Features & Modules

### 1. **Authentication & Authorization** (`/api/auth`)
- Local email/password registration and login with `bcryptjs`.
- Google OAuth 2.0 integration via `passport`.
- Role-based access control (Admin, User, Driver).
- JWT generation and verification.

### 2. **Booking Management** (`/api/bookings`, `/api/tour-bookings`, `/api/charging-bookings`)
- **Cab Bookings:** Handle Local, Airport, and Intercity ride reservations.
- **Tour Packages:** Manage multi-day electric tour bookings.
- **Charging Stations:** Facilitate EV charging slot bookings and enquiries.
- Distance estimation and dynamic pricing logic based on active rates.

### 3. **Payments & Billing** (`/api/payments`)
- Full Razorpay integration for initial advances and final balances.
- Secure webhook handling and payment verification.
- Invoice generation using `pdfkit`.

### 4. **User & Partner Management** (`/api/users`, `/api/partners`, `/api/drivers`)
- Profile management for riders.
- Driver onboarding and document verification.
- Cab Partner (fleet owner) registration.

### 5. **Admin Dashboard** (`/api/admin`)
- Comprehensive endpoints for admins to manage users, bookings, drivers, pricing rates, and feedback.
- CSV export functionality (`csv-writer`) for reporting.

### 6. **Dynamic Pricing & Offers** (`/api/pricing`, `/api/offers`)
- Manage base rates and per-km charges for different cab types.
- Create and validate promotional discount codes.

## ⚙️ Setup and Installation

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB instance (Local or Atlas)
- Razorpay Account
- Cloudinary Account
- Google Cloud Console Project (for OAuth)

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root of the `backend` directory. Use the following template:

```env
# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database
MONGO_URI=your_mongodb_connection_string

# Authentication
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Cloudinary (Image Uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email / Notifications (Optional)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
```

### 3. Start the Server
To run the server in development mode (with hot-reloading via nodemon):
```bash
npm run dev
```

To run the server in production mode:
```bash
npm start
```

## 🔒 Security Measures
- **Helmet:** Sets secure HTTP headers.
- **CORS:** Configured to strictly accept requests from allowed client URLs.
- **Rate Limiting:** Prevents brute-force attacks on the API.
- **Payload Limits:** Strict JSON body size limits (10mb) to prevent DOS attacks.
- **Data Sanitization:** Cleans incoming data against NoSQL injection and XSS (Cross-Site Scripting).

---
*Built for GoElectric - Leading the way in sustainable electric mobility.*
