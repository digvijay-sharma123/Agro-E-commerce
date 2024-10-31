import { models } from '../models/models.js';
const { User, typeOfUser } = models;

export const getTotalUsers = async (req, res) => {
    try {
        // Count users based on user_type
        const users = await User.find({ user_type: typeOfUser.USER });
        const totalUsers = users.length;
        res.status(200).json({ message: 'Total users retrieved successfully', totalUsers });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

export const getUsers = async (req, res) => {
    try {
        // Fetch users based on user_type
        const users = await User.find({ user_type: typeOfUser.USER });
        res.status(200).send({ message: 'Users retrieved successfully', users, totalUsers: users.length });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

export const getUser = async (req, res) => {
    try {
        const email = req.query.email;
        // Fetch user based on email and user_type (optional)
        const user = await User.findOne({ email: email });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.status(200).send({ message: 'User retrieved successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

export const updateUser = async (req, res) => {
    try {
        const { first_name, middle_name, last_name, email, user_type } = req.body; // Include user_type if needed
        // Update user info based on email
        const updatedUser = await User.findOneAndUpdate(
            { email: email },
            {
                first_name: first_name,
                middle_name: middle_name,
                last_name: last_name,
                user_type: user_type // Allow updating the user_type if necessary
            },
            { new: true } // Return the updated document
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).send({ message: 'User information updated successfully!', updatedUser });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}
