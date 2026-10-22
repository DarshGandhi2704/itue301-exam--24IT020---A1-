import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import EventsPage from './pages/EventsPage';
import MyTicketsPage from './pages/MyTicketsPage';

// Examination Requirement: Lazy loading for OrganizerPanel using React.lazy and Suspense
const OrganizerPanel = React.lazy(() => import('./pages/OrganizerPanel'));

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Route: / -> LoginPage (Public) */}
          <Route path="/" element={<LoginPage />} />

          {/* Route: /events -> EventsPage (Protected) */}
          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <EventsPage />
              </ProtectedRoute>
            }
          />

          {/* Route: /my-tickets -> MyTicketsPage (Protected) */}
          <Route
            path="/my-tickets"
            element={
              <ProtectedRoute>
                <MyTicketsPage />
              </ProtectedRoute>
            }
          />

          {/* Route: /organizer -> OrganizerPanel (Protected + Role must be organizer + Lazy loaded) */}
          <Route
            path="/organizer"
            element={
              <ProtectedRoute requiredRole="organizer">
                <Suspense
                  fallback={
                    <div className="lazy-loading-fallback">
                      <div className="spinner"></div>
                      <p>Loading Organizer Panel module...</p>
                    </div>
                  }
                >
                  <OrganizerPanel />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Catch-all redirect to / */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
