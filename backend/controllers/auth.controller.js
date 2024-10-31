import { models } from '../models/models.js';
const { User, typeOfUser } = models;
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY || "Agromart123455"; // Use environment variable

const registerUser = async (req, res) => {
    try {
        const { first_name, middle_name, last_name, email, password, role } = req.body;

        // Validate input
        if (!first_name || !last_name || !email || !password || !role) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const user_type = role === 'admin' ? typeOfUser.ADMIN : typeOfUser.USER; // Ensure typeOfUser is correctly imported

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            first_name,
            middle_name,
            last_name,
            user_type,
            email,
            password: hashedPassword
        });

        await newUser.save();
        res.status(201).json({ message: 'User created successfully' });

    } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).json({ error: 'Error signing up', message: err.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password, user_type } = req.body; // Include user_type here

        // Basic input validation
        if (!email || !password || !user_type) {
            return res.status(400).json({ error: 'Email, password, and user type are required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check if the requested role matches the user's current role
        if (user.user_type !== (user_type === 'admin' ? typeOfUser.ADMIN : typeOfUser.USER)) {
            return res.status(403).json({ error: 'You do not have access to this role' });
        }

        const token = jwt.sign(
            { 
                first_name: user.first_name, 
                userId: user._id, 
                user_type: user.user_type, 
                email: user.email 
            }, 
            SECRET_KEY, 
            { expiresIn: '2h' } // Using '2h' instead of '2hr' for consistency
        );

        res.json({ message: 'Login successful', token });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error logging in', errorMessage: err.message }); // Provide the error message for better debugging
    }
}


const updateUserRole = async (req, res) => {
    try {
        const { userId, newRole } = req.body;

        // Validate role
        if (!userId || !newRole) {
            return res.status(400).json({ error: 'User ID and new role are required' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.user_type = newRole === 'admin' ? typeOfUser.ADMIN : typeOfUser.USER;
        await user.save();

        // Generate a new token after role update
        const token = jwt.sign({ userId: user._id, user_type: user.user_type, email: user.email }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ message: 'User role updated successfully', token });
    } catch (err) {
        console.error('Error updating user role:', err);
        res.status(500).json({ error: 'Error updating user role', message: err.message });
    }
};

export { registerUser, loginUser, updateUserRole };

