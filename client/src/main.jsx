/* eslint-disable react-refresh/only-export-components */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { HelmetProvider } from 'react-helmet-async'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID'

// Suppress non-critical feature detection warnings from third-party scripts
if (typeof window !== 'undefined') {
  const originalConsoleError = console.error
  const originalConsoleWarn = console.warn

  console.error = function (...args) {
    const msg = args[0]?.toString?.() || ''
    // Suppress known third-party warnings (Razorpay checkout, etc.)
    if (
      msg.includes('Unrecognized feature') ||
      msg.includes('web-share') ||
      msg.includes('Cross-Origin-Opener-Policy') ||
      msg.includes('postMessage') ||
      msg.includes('Refused to get unsafe header') ||
      msg.includes('Permissions policy violation') ||
      msg.includes('devicemotion events are blocked') ||
      msg.includes('deviceorientation events are blocked') ||
      msg.includes('accelerometer is not allowed') ||
      msg.includes('Mixed Content') ||
      msg.includes('ERR_CONNECTION_REFUSED')
    ) {
      return
    }
    originalConsoleError.apply(console, args)
  }

  console.warn = function (...args) {
    const msg = args[0]?.toString?.() || ''
    if (
      msg.includes('Unrecognized feature') ||
      msg.includes('web-share') ||
      msg.includes('Cross-Origin-Opener-Policy') ||
      msg.includes('[Violation]') ||
      msg.includes('Mixed Content')
    ) {
      return
    }
    originalConsoleWarn.apply(console, args)
  }
}

// Warn if Google Client ID is not configured
if (googleClientId === 'YOUR_GOOGLE_CLIENT_ID') {
  console.warn(
    'Google OAuth Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID in .env file. ' +
    'See .env.example for setup instructions.'
  )
}

const AppWithProviders = () => (
  <HelmetProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </HelmetProvider>
)

// Disable StrictMode in development to prevent double-invoke of effects
// which causes multiple API calls hitting rate limiters
const isDevelopment = import.meta.env.DEV
const Wrapper = isDevelopment ? ({ children }) => children : StrictMode

createRoot(document.getElementById('root')).render(
  <Wrapper>
    <ThemeProvider>
      <GoogleOAuthProvider
        clientId={googleClientId}
        onScriptTagProps={{
          async: true,
          defer: true,
          nonce: undefined,
        }}
      >
        <AppWithProviders />
      </GoogleOAuthProvider>
    </ThemeProvider>
  </Wrapper>,
)
