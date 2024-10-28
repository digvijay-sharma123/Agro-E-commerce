import { models } from '../models/models.js';
const { User, typeOfUser } = models;
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

// console.log('typeOfUser:', typeOfUser);
const SECRET_KEY = "Agromart123455"
const registerUser = async (req, res) => {
    try {
        // console.log('Incoming registration data:', req.body); // Log incoming data

        const { first_name, middle_name, last_name, email, password, role } = req.body;

        const user_type = role === 'admin' ? typeOfUser.ADMIN : typeOfUser.USER; // Ensure typeOfUser is correctly imported

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
        console.error('Error registering user:', err); // Log the error for debugging
        res.status(500).json({ error: 'Error signing up', message: err.message });
    }
};


const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Basic input validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
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
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.user_type = newRole === 'admin' ? typeOfUser.ADMIN : typeOfUser.USER;
        await user.save();

        // Generate a new token after role update
        const token = jwt.sign({ user_id: user._id, user_type: user.user_type }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ message: 'User role updated successfully', token });
    } catch (err) {
        console.error('Error updating user role:', err);
        res.status(500).json({ error: 'Error updating user role', message: err.message });
    }
};


export { registerUser, loginUser,updateUserRole }