import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StudentList from './pages/StudentList';
import AddStudent from './pages/AddStudent';
import AdminUsers from './pages/AdminUsers';
import Settings from './pages/Settings';
import StudentProfile from './pages/StudentProfile';
import ClassReport from './pages/ClassReport';
import Alerts from './pages/AlertsPage'; 
import { useAuth } from './lib/auth';
import QuarterlyEntry from './pages/QuarterlyEntry';

export default function App() {
  const { user, isAdmin } = useAuth();

  // The BrowserRouter MUST wrap the entire application 
  // so that both Login and protected routes share the same navigation context.
  return (
    <BrowserRouter>
      {!user ? (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : (
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/students" element={<StudentList />} />
            <Route path="/student/:id" element={<StudentProfile />} />
            <Route path="/add-student" element={<AddStudent />} />
            <Route path="/class-report" element={<ClassReport />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/quarterly-entry" element={<QuarterlyEntry />} />
            
            {/* Admin Only Route */}
            <Route 
              path="/manage-users" 
              element={isAdmin ? <AdminUsers /> : <Navigate to="/" replace />} 
            />
            
            <Route path="/settings" element={<Settings />} />
            {/* Catch-all for logged in users */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      )}
    </BrowserRouter>
  );
}