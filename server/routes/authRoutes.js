const express = require('express');
const router = express.Router();
const User = require('../models/User');

// REGISTER
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, shopName } = req.body;
        const newUser = new User({ name, email, password, role, shopName });
        await newUser.save();
        res.status(201).json({ message: "Account Created!", user: newUser });
    } catch (err) {
        res.status(500).json({ message: "Error creating user" });
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const user = await User.findOne({ email });
        
        if (!user || user.password !== password) {
            return res.status(400).json({ message: "Invalid Email or Password" });
        }
        if (user.role !== role) {
            return res.status(403).json({ message: `Please login as ${user.role}` });
        }
        res.json({ message: "Login Successful", user });
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;