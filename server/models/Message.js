const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    customerId: String,   // Baat kis customer se ho rahi hai
    customerName: String, // Customer ka naam (display ke liye)
    sender: String,       // 'customer' ya 'barber' (kisne likha?)
    text: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);