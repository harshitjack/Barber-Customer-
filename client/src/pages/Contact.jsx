import React, { useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

// Socket connect karo taaki Barber ko turant pata chale
const socket = io("http://localhost:5000");

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if(!formData.name || !formData.email || !formData.message) return alert("Please fill all fields");

    // Check karo agar user login hai
    const user = JSON.parse(localStorage.getItem('user'));
    
    // Agar login hai to UserID use karo, nahi to Email ko hi ID bana do
    const userId = user ? user._id : formData.email; 

    // Message ko CHAT format mein convert karo
    const msgData = {
        customerId: userId,          // ID (taaki list me alag dikhe)
        customerName: formData.name, // Naam
        sender: 'customer',          // User ne bheja hai
        text: `[CONTACT FORM QUERY]\nEmail: ${formData.email}\n\n${formData.message}`, // Email ko message ke andar daal diya
        room: userId                 // Room ID
    };

    try {
      // 1. Database me save karo
      await axios.post("http://localhost:5000/api/messages", msgData);
      
      // 2. Barber ko Live Notification bhejo
      socket.emit("send_message", msgData);

      alert("Message Sent! Barber will reply shortly.");
      setFormData({ name: '', email: '', message: '' }); // Form Clear
    } catch (err) {
      console.error(err);
      alert("Error sending message.");
    }
  };

  return (
    <div className="container">
      <h1 style={{ color: 'var(--gold)', marginBottom: '20px' }}>Contact Us</h1>
      <div className="grid">
        {/* Contact Form */}
        <div className="card">
          <h3>Send a Message</h3>
          <form style={{ marginTop: '15px' }}>
            <div style={{ marginBottom: '15px' }}>
              <label>Full Name</label>
              <input name="name" value={formData.name} onChange={handleChange} type="text" placeholder="Enter your name" style={{width: '100%', padding: '10px', marginTop: '5px'}} />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label>Email</label>
              <input name="email" value={formData.email} onChange={handleChange} type="email" placeholder="email@example.com" style={{width: '100%', padding: '10px', marginTop: '5px'}} />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label>Message</label>
              <textarea name="message" value={formData.message} onChange={handleChange} rows="4" placeholder="Ask about prices, styles, etc..." style={{width: '100%', padding: '10px', marginTop: '5px', background: '#2a2a2a', color: 'white', border: '1px solid #444', borderRadius: '6px'}}></textarea>
            </div>
            <button type="button" onClick={handleSubmit} className="btn-gold">Send Message</button>
          </form>
        </div>

        {/* Shop Info */}
        <div className="card" style={{ borderLeft: '5px solid white' }}>
          <h3>Visit Our Shop</h3>
          <p style={{ margin: '15px 0' }}>📍 123 Grooming Ave, Style City, NY</p>
          <p style={{ margin: '15px 0' }}>📞 +1 (555) 000-9999</p>
          <p style={{ margin: '15px 0' }}>✉️ hello@barberpro.com</p>
          <h4 style={{ color: 'var(--gold)', marginTop: '20px' }}>Hours</h4>
          <ul style={{ listStyle: 'none', fontSize: '0.9rem', padding: 0 }}>
            <li>Mon - Fri: 9:00 AM - 8:00 PM</li>
            <li>Sat: 10:00 AM - 6:00 PM</li>
            <li>Sun: Closed</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Contact;