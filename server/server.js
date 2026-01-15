const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const messageRoutes = require('./routes/message.Routes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/messages', messageRoutes);
app.use(express.static(path.join(__dirname, '../public')));
mongoose.connect("mongodb+srv://stupidguysboys:ao2EVdes3WRHG0ih@cluster0.ui0lj54.mongodb.net/barber")
    .then(() => console.log("✅ Database Connected"))
    .catch(err => console.log("❌ DB Error", err));

// --- SOCKET LOGIC (Yahan Change Hai) ---
io.on("connection", (socket) => {
    
    // 1. Join Chat Room
    socket.on("join_chat", (roomId) => {
        socket.join(roomId);
        console.log(`User/Barber joined room: ${roomId}`);
    });

    // 2. Booking Refresh
    socket.on("new_booking", () => {
        io.emit("refresh_data"); 
    });

    // 3. Send Message (FIXED HERE)
    socket.on("send_message", (data) => {
        // Step A: Sirf us chat room walo ko message bhejo (Live Chat ke liye)
        io.to(data.room).emit("receive_message", data);

        // Step B: IMPORTANT! Sabko batao ki naya data aaya hai (Taaki Barber ki List update ho jaye)
        io.emit("refresh_data"); 
    });
   
});

 app.get('*name', (req, res) => {
        res.sendFile(path.join(__dirname, '../public/index.html'));
    });

server.listen(5000, () => console.log("🚀 Server Started on 5000"));