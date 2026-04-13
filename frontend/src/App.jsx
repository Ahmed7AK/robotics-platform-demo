import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { Cursus } from './pages/Cursus';
import { Profile } from './pages/Profile';
import { Showcase } from './pages/Showcase';
import { Requests } from './pages/Requests';
import { Admin } from './pages/Admin';
import { ProjectDetails } from './pages/ProjectDetails';
import { Evaluations } from './pages/Evaluations';
import { Events } from './pages/Events';
import { useAuth } from './context/AuthContext';

// Placeholders for routes

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user || user.role !== 'admin') return <Navigate to="/home" replace />;
  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/home" replace />} />
      
      {/* Protected Routes Wrapper */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/home" element={<Home />} />
        <Route path="/cursus" element={<Cursus />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/showcase" element={<Showcase />} />
        <Route path="/evaluations" element={<Evaluations />} />
        <Route path="/requests" element={<Requests />} />
        <Route path="/events" element={<Events />} />
        <Route path="/teams/:id" element={<ProjectDetails />} />
        
        {/* Admin only route */}
        <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
      </Route>
    </Routes>
  );
}

export default App;
