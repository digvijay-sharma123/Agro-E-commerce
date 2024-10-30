import mongodbConnection from './mongodb.connection.js'; // Ensure the path is correct
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const productState = {
  IN_SHOP: 'in_shop',
  IN_CART: 'in_cart',
  IN_ORDER: 'in_order'
};

const typeOfUser = {
  USER: 'user',
  ADMIN: 'admin'
};

// Create a function to connect and define models
const connectAndDefineModels = async () => {
  await mongodbConnection(); // Ensure the connection is established

  // User model
  const User = mongoose.model('User', {
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
      unique: true
    },
    password: String
  });

  // Product model
  const Product = mongoose.model('Product', {
    product_id: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true
    },
    description: String,
    type: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    qty: Number,
    productState: {
      type: String,
      enum: [productState.IN_SHOP, productState.IN_CART],
      default: productState.IN_SHOP
    },
    image: String,
  });

  // Transaction model
  const Transaction = mongoose.model('Transaction', {
    transaction_id: {
      type: String,
      unique: true
    },
    ordered_products: {
      product_id: {
        type: String,
        required: true
      },
      order_qty: {
        type: Number,
        default: 0
      },
      order_status: {
        type: Number,
        default: 0
      },
      sum_total: {
        type: Number,
        default: 0
      },
      product_name: String,
      image: String,
      price: Number
    },
    email: {
      type: String,
      required: true
    },
    order_date: Date,
    time: String
  });

  const cartItemSchema = mongoose.Schema({
    product_id: {
      type: Number,
      required: true
    },
    product_info: {
      name: {
        type: String,
        required: true
      },
      description: String,
      type: {
        type: Number,
        required: true
      },
      price: {
        type: Number,
        required: true
      },
      cart_qty: Number,
      productState: {
        type: String,
        enum: [productState.IN_SHOP, productState.IN_CART],
        default: productState.IN_SHOP
      },
      image: String,
    }
  });

  const Cart = mongoose.model('Cart', {
    email: {
      type: String,
      required: true
    },
    shopping_cart: [cartItemSchema]
  });

  // Return the models
  return { User, typeOfUser, Product, Transaction, Cart,productState };
};

// Export the models after connecting
const modelsPromise = connectAndDefineModels();
export const models = await modelsPromise; // Await the promise to get the models
