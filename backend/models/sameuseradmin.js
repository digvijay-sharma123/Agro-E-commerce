const mongoose = require('mongoose');
const { typeOfUser } = require('./models'); // Adjust the path as necessary

// Define the user schema
const UserSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true
  },
  middle_name: String,
  last_name: {
    type: String,
    required: true
  },
  user_type: {
    type: String,
    enum: [typeOfUser.USER, typeOfUser.ADMIN],
    default: typeOfUser.USER
  },
  email: {
    type: String,
    required: true,
    unique: true // This ensures email is unique by itself
  },
  password: {
    type: String,
    required: true
  }
});

// Add a unique composite index on email and user_type
UserSchema.index({ email: 1, user_type: 1 }, { unique: true });

// Create the User model
const User = mongoose.model('User', UserSchema);

module.exports = User;
