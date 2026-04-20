import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Toaster } from 'react-hot-toast';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#ffffff',
          color: '#1e293b',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          padding: '12px 16px',
          fontSize: '14px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        },
        success: {
          iconTheme: {
            primary: '#0ea5e9',
            secondary: '#ffffff',
          },
          style: {
            background: '#ffffff',
            color: '#1e293b',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            padding: '12px 16px',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#ffffff',
          },
          style: {
            background: '#ffffff',
            color: '#1e293b',
            borderRadius: '12px',
            border: '1px solid #fecaca',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.1)',
            padding: '12px 16px',
          },
        },
      }}
    />
  </StrictMode>,
)
