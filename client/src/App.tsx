import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute } from './components/Auth/PrivateRoute';
import { Header } from './components/Layout/Header';
import { Footer } from './components/Layout/Footer';

// Import all pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Papers from './pages/Papers';
import PaperDetails from './pages/PaperDetails';
import SubmitPaper from './pages/SubmitPaper';
import DiseaseMap from './pages/DiseaseMap';
import Jobs from './pages/Jobs';
import Researchers from './pages/Researchers';
import Profile from './pages/Profile';
import Collaborations from './pages/Collaborations';
import AdminVetting from './pages/AdminVetting';

// Import styles
import './App.css';
import 'react-toastify/dist/ReactToastify.css';
import 'leaflet/dist/leaflet.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="app">
            <Header />
            <main className="main-content">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/disease-map" element={<DiseaseMap />} />
                <Route path="/jobs" element={<Jobs />} />
                <Route path="/researchers" element={<Researchers />} />

                {/* Protected Routes */}
                <Route path="/dashboard" element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } />
                <Route path="/papers" element={
                  <PrivateRoute>
                    <Papers />
                  </PrivateRoute>
                } />
                <Route path="/papers/:id" element={
                  <PrivateRoute>
                    <PaperDetails />
                  </PrivateRoute>
                } />
                <Route path="/submit-paper" element={
                  <PrivateRoute>
                    <SubmitPaper />
                  </PrivateRoute>
                } />
                <Route path="/profile" element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                } />
                <Route path="/collaborations" element={
                  <PrivateRoute>
                    <Collaborations />
                  </PrivateRoute>
                } />
                <Route path="/admin/vetting" element={
                  <PrivateRoute>
                    <AdminVetting />
                  </PrivateRoute>
                } />
              </Routes>
            </main>
            <Footer />
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}