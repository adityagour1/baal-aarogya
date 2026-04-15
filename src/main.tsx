import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // Use the name that actually exists in your folder!
import { AuthProvider } from './lib/auth';
import { Toaster } from 'sonner';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
      <Toaster position="top-center" richColors />
    </AuthProvider>
  </React.StrictMode>
);