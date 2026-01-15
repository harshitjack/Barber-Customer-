import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [role, setRole] = useState('customer'); // Toggle logic
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', shopName: '' });
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isSignup ? 'register' : 'login';
    try {
      const res = await axios.post(`https://barber-customer.onrender.com/api/auth/${endpoint}`, { ...formData, role });
      alert(res.data.message);
      
      if (!isSignup) {
        localStorage.setItem('user', JSON.stringify(res.data.user)); // Session save
        role === 'barber' ? navigate('/barber-dashboard') : navigate('/user-dashboard');
      } else {
        setIsSignup(false); // Register ke baad login screen
      }
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || "Something went wrong"));
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div className="card" style={{ width: '400px', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--gold)' }}>{role.toUpperCase()} PORTAL</h2>
        
        {/* Toggle Buttons */}
        <div style={{ display: 'flex', marginBottom: '20px', background: '#333', borderRadius: '5px' }}>
          <button onClick={() => setRole('customer')} style={{ flex: 1, padding: '10px', background: role === 'customer' ? 'var(--gold)' : 'transparent', border: 'none', cursor: 'pointer' }}>Customer</button>
          <button onClick={() => setRole('barber')} style={{ flex: 1, padding: '10px', background: role === 'barber' ? 'var(--gold)' : 'transparent', border: 'none', cursor: 'pointer' }}>Barber</button>
        </div>

        <form onSubmit={handleSubmit}>
          {isSignup && <input name="name" placeholder="Full Name" onChange={handleChange} required />}
          {isSignup && role === 'barber' && <input name="shopName" placeholder="Shop Name" onChange={handleChange} />}
          <input name="email" type="email" placeholder="Email Address" onChange={handleChange} required />
          <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
          <button className="btn-gold">{isSignup ? 'Register' : 'Login'}</button>
        </form>
        
        <p style={{ marginTop: '15px', cursor: 'pointer', color: '#888' }} onClick={() => setIsSignup(!isSignup)}>
          {isSignup ? "Already have an account? Login" : "New here? Create Account"}
        </p>
      </div>
    </div>
  );
};

export default Login;