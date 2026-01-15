import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io("http://localhost:5000");

export default function UserDashboard() {
  const [bookings, setBookings] = useState([]);
  const [service, setService] = useState('Haircut');
  
  // CHAT STATES
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  
  // USER INFO FROM LOCAL STORAGE
  const user = JSON.parse(localStorage.getItem('user'));
  const userName = user ? user.name : "Guest"; 
  const userId = user ? user._id : null; // Unique ID for Chat Room

  // --- DATA FETCHING ---
  const fetchList = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/bookings");
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchChat = async () => {
    if(!userId) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/messages/${userId}`);
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // --- USE EFFECT (Live Updates) ---
  useEffect(() => {
    fetchList();
    fetchChat();

    // ✅ IMPORTANT FIX: Join the Chat Room
    if(userId) {
        console.log("Joining chat room:", userId);
        socket.emit("join_chat", userId);
    }

    // Listeners
    socket.on("refresh_data", fetchList); // Update Queue
    
    socket.on("receive_message", (data) => {
        // Update Chat List
        setMessages((prev) => [...prev, data]);
    });

    return () => {
        socket.off("refresh_data");
        socket.off("receive_message");
    };
  }, [userId]);

  // --- BOOKING FUNCTIONS ---
  const handleBook = async (e) => {
    e.preventDefault();
    if (!user) return alert("Please Login First!");

    // Check Duplicate
    const alreadyBooked = bookings.some(b => b.customerName === userName && b.status !== 'completed');
    if (alreadyBooked) return alert("You are already in queue!");

    await axios.post("http://localhost:5000/api/bookings", { customerName: userName, service });
    socket.emit("new_booking");
    alert("Appointment Booked!");
  };

  const handleCancel = async (id) => {
    if (window.confirm("Cancel your appointment?")) {
      try {
        await axios.delete(`http://localhost:5000/api/bookings/${id}`);
        socket.emit("new_booking");
      } catch (err) {
        alert("Error cancelling.");
      }
    }
  };

  // --- CHAT FUNCTIONS ---
  const sendMessage = async () => {
    if (newMessage.trim() === "") return;

    const messageData = {
        customerId: userId,
        customerName: userName,
        sender: 'customer',
        text: newMessage,
        room: userId // Send to my own room
    };

    // 1. Send via Socket (Instant)
    socket.emit("send_message", messageData);
    
    // 2. Save to DB
    await axios.post("http://localhost:5000/api/messages", messageData);

    setNewMessage(""); // Clear input
  };

  return (
    <div className="container">
      
      {/* --- MAIN DASHBOARD GRID --- */}
      <div className="grid">
        
        {/* LEFT: Booking Form */}
        <div className="card">
          <h2 style={{ color: '#d4af37' }}>Book Appointment</h2>
          <p style={{ color: '#aaa', marginBottom: '15px' }}>
            Welcome, <b style={{ color: 'white' }}>{userName}</b>
          </p>
          
          <form onSubmit={handleBook}>
            <input value={userName} disabled style={{ cursor: 'not-allowed', opacity: 0.7 }} />
            
            <select value={service} onChange={(e) => setService(e.target.value)}>
              <option>Haircut</option>
              <option>Beard Trim</option>
              <option>Full Package</option>
            </select>
            
            <button className="btn-gold">Book Ticket</button>
          </form>
        </div>

        {/* RIGHT: Live Queue Status */}
        <div className="card">
          <h2 style={{ color: '#d4af37' }}>Live Waiting Queue</h2>
          
          {bookings.length === 0 ? <p style={{color:'gray'}}>No bookings yet.</p> : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {bookings.map((b, i) => {
                const isMyBooking = b.customerName === userName;

                return (
                  <li key={b._id} style={{ 
                      padding: '15px', 
                      borderBottom: '1px solid #333', 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: isMyBooking ? '#333' : 'transparent', 
                      borderRadius: isMyBooking ? '8px' : '0'
                  }}>
                    
                    <div>
                      <span style={{ color: '#d4af37', fontWeight: 'bold', marginRight: '10px' }}>#{i + 1}</span>
                      <span style={{ color: 'white', fontWeight: isMyBooking ? 'bold' : 'normal' }}>
                        {b.customerName} {isMyBooking && "(You)"}
                      </span>
                      <div style={{ fontSize: '0.8rem', color: '#777' }}>{b.service}</div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ color: b.status === 'completed' ? '#2ecc71' : 'orange', fontWeight: 'bold', fontSize: '0.9rem' }}>
                        {b.status === 'completed' ? 'Done' : 'Pending'}
                      </span>

                      {/* Cancel Button (Only for me) */}
                      {isMyBooking && b.status !== 'completed' && (
                        <button onClick={() => handleCancel(b._id)} className="btn-red" style={{fontSize: '0.8rem', padding: '5px 10px'}}>
                          Cancel
                        </button>
                      )}
                    </div>

                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* --- FLOATING CHAT WIDGET --- */}
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
        {!chatOpen ? (
            <button onClick={() => setChatOpen(true)} style={{ padding: '15px', borderRadius: '50%', background: '#d4af37', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.5rem', boxShadow: '0 4px 10px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px' }}>
                💬
            </button>
        ) : (
            <div style={{ width: '320px', height: '450px', background: '#1e1e1e', border: '1px solid #d4af37', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                
                {/* Chat Header */}
                <div style={{ background: '#d4af37', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'black', fontWeight: 'bold' }}>Chat with Barber</span>
                    <button onClick={() => setChatOpen(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'black' }}>✖</button>
                </div>
                
                {/* Chat Body (Messages) */}
                <div style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', background: '#121212' }}>
                    {messages.length === 0 && <p style={{color: '#555', textAlign: 'center', fontSize: '0.9rem'}}>Start chatting...</p>}
                    
                    {messages.map((m, index) => (
                        <div key={index} style={{ 
                            alignSelf: m.sender === 'customer' ? 'flex-end' : 'flex-start',
                            background: m.sender === 'customer' ? '#444' : '#d4af37',
                            color: m.sender === 'customer' ? 'white' : 'black',
                            padding: '8px 12px',
                            borderRadius: '10px',
                            maxWidth: '80%',
                            fontSize: '0.9rem',
                            wordWrap: 'break-word'
                        }}>
                            {m.text}
                        </div>
                    ))}
                </div>

                {/* Chat Input */}
                <div style={{ display: 'flex', padding: '10px', borderTop: '1px solid #333', background: '#1e1e1e' }}>
                    <input 
                        value={newMessage} 
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type message..." 
                        style={{ flex: 1, padding: '10px', borderRadius: '5px', border: 'none', marginRight: '5px', background: '#333', color: 'white', marginBottom: 0 }}
                    />
                    <button onClick={sendMessage} style={{ background: '#d4af37', border: 'none', padding: '0 15px', borderRadius: '5px', cursor: 'pointer', fontSize: '1.2rem', marginTop: 0 }}>➤</button>
                </div>
            </div>
        )}
      </div>

    </div>
  );
}