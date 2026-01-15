const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
// FIX 1: Ensure you renamed the file to 'messageRoutes.js' inside /routes folder!
const messageRoutes = require('./routes/messageRoutes'); 

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());

// --- API ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/messages', messageRoutes);

// --- STATIC FILES (FIX 2) ---
// We serve 'client/dist' because that is where Vite creates the build
const buildPath = path.join(__dirname, '../client/dist');
app.use(express.static(buildPath));

// --- DATABASE ---
mongoose.connect("mongodb+srv://stupidguysboys:ao2EVdes3WRHG0ih@cluster0.ui0lj54.mongodb.net/barber")
    .then(() => console.log("✅ Database Connected"))
    .catch(err => console.log("❌ DB Error", err));

// --- SOCKET LOGIC ---
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

    // 3. Send Message
    socket.on("send_message", (data) => {
        io.to(data.room).emit("receive_message", data);
        io.emit("refresh_data"); 
    });

}); // <--- SOCKET BLOCK ENDS HERE (FIX 3)

// --- CATCH-ALL ROUTE (Must be OUTSIDE socket logic) ---
app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
});

server.listen(5000, () => console.log("🚀 Server Started on 5000"));