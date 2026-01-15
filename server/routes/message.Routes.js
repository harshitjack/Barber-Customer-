const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// 1. Message Save Karna (POST)
router.post('/', async (req, res) => {
    try {
        const newMessage = new Message(req.body);
        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (err) {
        res.status(500).json(err);
    }
});

// 2. Kisi ek Customer ki Chat History lana (GET)
router.get('/:customerId', async (req, res) => {
    try {
        const messages = await Message.find({ customerId: req.params.customerId });
        res.json(messages);
    } catch (err) {
        res.status(500).json(err);
    }
});

// 3. Barber ke liye: Un sab customers ki list jinhone message kiya (GET)
router.get('/list/users', async (req, res) => {
    try {
        // Sirf unique customers nikalo
        const chats = await Message.find().distinct('customerId');
        // Unke naam bhi chahiye, to thoda trick lagana padega
        // (Simple tarike se abhi saare messages bhej dete hain, frontend filter kar lega)
        const allMessages = await Message.find();
        res.json(allMessages);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;