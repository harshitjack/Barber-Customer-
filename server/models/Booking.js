const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    customerName: String,
    service: String,
    status: { type: String, default: 'pending' }, // pending, confirmed, completed
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', BookingSchema);
