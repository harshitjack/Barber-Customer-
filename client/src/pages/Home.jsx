import { useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io("http://localhost:5000");

export default function Home() {
    const [name, setName] = useState('');
    const [service, setService] = useState('Classic Haircut');

    const handleBooking = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://localhost:5000/api/bookings", { customerName: name, service });
            
            // This is the "Fix": It tells the server a change happened
            socket.emit("new_booking"); 
            
            setName('');
            alert("Ticket Booked! You are now in the waiting list.");
        } catch (err) {
            console.error("Booking error", err);
        }
    };

    return (
        <div className="container">
            <h1 className="gold-text">Book Your Style</h1>
            <form className="card shadow" onSubmit={handleBooking}>
                <input 
                    type="text" 
                    placeholder="Enter Your Name" 
                    value={name}
                    required 
                    onChange={(e) => setName(e.target.value)} 
                />
                <select onChange={(e) => setService(e.target.value)}>
                    <option>Classic Haircut</option>
                    <option>Beard Trim</option>
                    <option>Luxury Shave</option>
                </select>
                <button type="submit" className="btn-gold">Book Now</button>
            </form>
        </div>
    );
}