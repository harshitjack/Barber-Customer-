const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking'); 

// 1. POST: Create a new Booking
router.post('/', async (req, res) => {
    try {
        const newBooking = new Booking({
            customerName: req.body.customerName,
            service: req.body.service,
            status: 'pending' 
        });
        const savedBooking = await newBooking.save();
        res.status(201).json(savedBooking);
    } catch (err) {
        res.status(400).json({ message: "Error creating booking", error: err });
    }
});

// 2. GET: Fetch ALL bookings (Changed: Now we don't filter out 'completed')
router.get('/', async (req, res) => {
    try {
        // We removed { status: { $ne: 'completed' } } so "Done" users stay in the list
        const bookings = await Booking.find(); 
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 3. PUT: Mark as Done
router.put('/:id', async (req, res) => {
    try {
        const updatedBooking = await Booking.findByIdAndUpdate(
            req.params.id, 
            { status: 'completed' }, 
            { new: true }
        );
        res.json(updatedBooking);
    } catch (err) {
        res.status(400).json({ message: "Error updating status" });
    }
});

// 4. DELETE: Remove Customer Forever
router.delete('/:id', async (req, res) => {
    try {
        const result = await Booking.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).json({ message: "Customer not found" });
        }
        res.json({ message: "Customer deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting customer" });
    }
});

module.exports = router;