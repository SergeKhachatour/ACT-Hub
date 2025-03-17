import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import TradingView from './components/TradingView';
import Home from './pages/Home';
import Market from './pages/Market';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route path="/market" element={
            <ProtectedRoute>
              <Market />
            </ProtectedRoute>
          } />
          <Route path="/trading" element={
            <ProtectedRoute>
              <TradingView />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
      <ToastContainer />
    </Router>
  );
}

export default App; 