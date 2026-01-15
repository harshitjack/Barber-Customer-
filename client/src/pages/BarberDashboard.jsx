import React, { useEffect, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

const socket = io("http://localhost:5000");

export default function BarberDashboard() {
  const [view, setView] = useState('queue'); // 'queue' or 'chat'
  const [bookings, setBookings] = useState([]);
  
  // CHAT VARIABLES
  const [chatUsers, setChatUsers] = useState([]); // List of people who messaged
  const [selectedUser, setSelectedUser] = useState(null); // Currently chatting with
  const [chatHistory, setChatHistory] = useState([]);
  const [reply, setReply] = useState("");

  const navigate = useNavigate();

  // Security Check
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'barber') navigate('/');
  }, [navigate]);

  // Initial Data Load
  const fetchData = async () => {
    // 1. Queue Fetch
    const resBookings = await axios.get("http://localhost:5000/api/bookings");
    setBookings(resBookings.data);

    // 2. Chat Users Fetch (Jinhone message kiya hai)
    const resMessages = await axios.get("http://localhost:5000/api/messages/list/users");
    // Filter Unique Users manually for now
    const uniqueUsers = [];
    const map = new Map();
    for (const item of resMessages.data) {
        if(!map.has(item.customerId)){
            map.set(item.customerId, true);
            uniqueUsers.push({ id: item.customerId, name: item.customerName });
        }
    }
    setChatUsers(uniqueUsers);
  };

  useEffect(() => {
    fetchData();
    socket.on("refresh_data", fetchData);
    
    // Live Message Receive
    socket.on("receive_message", (data) => {
        // Agar main usi user se chat kar raha hu, to list update karo
        if (selectedUser && data.customerId === selectedUser.id) {
            setChatHistory((prev) => [...prev, data]);
        }
    });

    return () => {
        socket.off("refresh_data");
        socket.off("receive_message");
    };
  }, [selectedUser]);

  // Open Chat with specific User
  const openChat = async (user) => {
    setSelectedUser(user);
    // Join that user's room to talk
    socket.emit("join_chat", user.id);
    // Fetch old messages
    const res = await axios.get(`http://localhost:5000/api/messages/${user.id}`);
    setChatHistory(res.data);
  };

  // Send Reply
  const sendReply = async () => {
    if(!reply.trim()) return;
    const msgData = {
        customerId: selectedUser.id,
        customerName: selectedUser.name,
        sender: 'barber',
        text: reply,
        room: selectedUser.id
    };
    
    await socket.emit("send_message", msgData);
    await axios.post("http://localhost:5000/api/messages", msgData);
    setReply("");
  };

  // Action Buttons
  const updateStatus = async (id, status) => {
    if (status === 'deleted' && !window.confirm("Delete?")) return;
    if (status === 'deleted') await axios.delete(`http://localhost:5000/api/bookings/${id}`);
    else await axios.put(`http://localhost:5000/api/bookings/${id}`, { status });
    socket.emit("new_booking");
  };

  const pendingCount = bookings.filter(b => b.status !== 'completed').length;

  return (
    <div className="container">
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '15px' }}>
        <h2 style={{ color: '#d4af37', margin: 0 }}>👑 Owner Panel</h2>
        <div>
            <button onClick={() => setView('queue')} style={{ background: view === 'queue' ? '#d4af37' : '#333', padding: '10px', border: 'none', marginRight: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Queue ({pendingCount})</button>
            <button onClick={() => setView('chat')} style={{ background: view === 'chat' ? '#d4af37' : '#333', padding: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Chats</button>
        </div>
      </div>

      {/* VIEW: QUEUE */}
      {view === 'queue' && (
        <div className="grid">
          {bookings.map((b) => (
            <div key={b._id} className="card" style={{ borderLeft: b.status==='completed'?'5px solid green':'5px solid gold' }}>
              <h3>{b.customerName}</h3>
              <p style={{color:'gray'}}>{b.service}</p>
              <div style={{display:'flex', gap:'10px'}}>
                  {b.status!=='completed' && <button className="btn-green" onClick={()=>updateStatus(b._id, 'completed')}>Done</button>}
                  <button className="btn-red" onClick={()=>updateStatus(b._id, 'deleted')}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW: CHAT SYSTEM */}
      {view === 'chat' && (
        <div style={{ display: 'flex', height: '500px', border: '1px solid #333', borderRadius: '10px', overflow: 'hidden' }}>
            
            {/* LEFT: User List */}
            <div style={{ width: '30%', background: '#222', borderRight: '1px solid #333', overflowY: 'auto' }}>
                <h4 style={{ padding: '10px', color: '#d4af37', borderBottom: '1px solid #333', margin: 0 }}>Customers</h4>
                {chatUsers.map(u => (
                    <div key={u.id} onClick={() => openChat(u)} style={{ 
                        padding: '15px', cursor: 'pointer', borderBottom: '1px solid #333',
                        background: selectedUser?.id === u.id ? '#333' : 'transparent' 
                    }}>
                        {u.name}
                    </div>
                ))}
            </div>

            {/* RIGHT: Chat Area */}
            <div style={{ width: '70%', background: '#1e1e1e', display: 'flex', flexDirection: 'column' }}>
                {selectedUser ? (
                    <>
                        {/* Chat Title */}
                        <div style={{ padding: '10px', background: '#333', borderBottom: '1px solid #444', fontWeight: 'bold' }}>
                            Chatting with: <span style={{color: '#d4af37'}}>{selectedUser.name}</span>
                        </div>

                        {/* Messages */}
                        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {chatHistory.map((m, i) => (
                                <div key={i} style={{ 
                                    alignSelf: m.sender === 'barber' ? 'flex-end' : 'flex-start',
                                    background: m.sender === 'barber' ? '#d4af37' : '#444',
                                    color: m.sender === 'barber' ? 'black' : 'white',
                                    padding: '8px 12px', borderRadius: '8px', maxWidth: '70%'
                                }}>
                                    {m.text}
                                </div>
                            ))}
                        </div>

                        {/* Input */}
                        <div style={{ padding: '10px', borderTop: '1px solid #333', display: 'flex' }}>
                            <input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Type reply..." style={{ flex: 1, marginRight: '10px' }} />
                            <button onClick={sendReply} className="btn-gold" style={{ width: 'auto', marginTop: 0 }}>Send</button>
                        </div>
                    </>
                ) : (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'gray' }}>
                        Select a customer to chat
                    </div>
                )}
            </div>
        </div>
      )}

    </div>
  );
}