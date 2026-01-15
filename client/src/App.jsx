import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import UserDashboard from './pages/UserDashboard';
import BarberDashboard from './pages/BarberDashboard';
import Contact from './pages/Contact';

// Navbar Component
const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check karo kaun login hai
  const user = JSON.parse(localStorage.getItem('user'));
  const role = user ? user.role : null; 

  // Agar Login page ('/') par ho, to Navbar mat dikhao
  if (location.pathname === '/') return null;

  const handleLogout = () => {
    localStorage.removeItem('user'); 
    navigate('/'); 
  };

  return (
    <nav style={navStyle}>
      <div style={{ color: '#d4af37', fontSize: '1.5rem', fontWeight: 'bold' }}>
        BARBER PRO
      </div>
      
      <div className="nav-links" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        
        {/* LOGIC START */}
        
        {role === 'barber' ? (
           // 1. Agar BARBER hai -> Sirf Owner Dashboard dikhao
           <Link to="/barber-dashboard" style={linkStyle}>👑 Owner Dashboard</Link>
        ) : (
           // 2. Agar CUSTOMER hai -> Dashboard + Contact dikhao
           <>
             <Link to="/user-dashboard" style={linkStyle}>📅 My Appointments</Link>
             <Link to="/contact" style={linkStyle}>📞 Contact Shop</Link>
           </>
        )}

        {/* LOGIC END */}
        
        <button onClick={handleLogout} style={logoutBtnStyle}>
          Logout
        </button>
      </div>
    </nav>
  );
};

// --- STYLES (Wahi purane wale, Aesthetic) ---
const navStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '15px 30px',
  background: '#000',
  borderBottom: '2px solid #d4af37'
};

const linkStyle = {
  color: 'white',
  textDecoration: 'none',
  fontWeight: '500',
  fontSize: '1rem',
  transition: '0.3s'
};

const logoutBtnStyle = {
  background: '#e74c3c',
  color: 'white',
  border: 'none',
  padding: '8px 15px',
  borderRadius: '5px',
  cursor: 'pointer',
  fontWeight: 'bold',
  marginLeft: '10px'
};

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/barber-dashboard" element={<BarberDashboard />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </Router>
  );
}

export default App;