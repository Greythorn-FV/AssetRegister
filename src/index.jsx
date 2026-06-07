import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import AuthenticatedApp from './components/AuthenticatedApp.jsx';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <AuthenticatedApp>
        <App />
      </AuthenticatedApp>
    </AuthProvider>
  </React.StrictMode>
);
