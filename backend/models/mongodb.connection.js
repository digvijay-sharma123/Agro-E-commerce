import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const mongodbConnection = async () => {
  try {
    await mongoose.connect(process.env.DATABASE, {
    });
    console.log(`MongoDB Connected Successfully`);
    return mongoose; // Return the mongoose instance
  } catch (error) {
    console.log(`Error: ${error.message}`);
    console.log("MongoDB Connection Failed");
    process.exit(1);
  }
};

export default mongodbConnection;