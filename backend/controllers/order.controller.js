import { models } from '../models/models.js';
const { User, typeOfUser, Cart, Product } = models;
const { Transaction } = models;

// POST /orders
// req body: { email: string }
export const createOrder = async (req, res) => {
    try {
        const userEmail = decodeURIComponent(req.query.email);
        if (!userEmail) {
            return res.status(400).json({ message: 'Email is required.' });
        }

        const cart = await Cart.findOne({ email: userEmail });

        if (!cart || cart.shopping_cart.length === 0) {
            return res.status(400).json({ message: 'Shopping cart is empty or not found.', cart });
        }

        // Extract cart items more clearly
        const cartItems = cart.shopping_cart.map(product => ({
            product_id: product.product_id,
            product_info: product.product_info
        }));

        for (let cartItem of cartItems) {
            const product = await Product.findOne({ product_id: cartItem.product_id });
            if (!product) {
                return res.status(404).json({ message: `${cartItem.product_info.name} does not exist, please remove before checkout.` });
            }

            // Check if cart quantity exceeds available stock
            if (cartItem.product_info.cart_qty > product.qty) {
                return res.status(409).json({ message: `${product.name} quantity exceeds available stocks. (Available stock: ${product.qty})` });
            }

            // Update product quantity in database
            await Product.findOneAndUpdate(
                { product_id: cartItem.product_id },
                { $inc: { qty: -cartItem.product_info.cart_qty } }
            );
        }

        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');

        const transactions = cartItems.map(item => ({
            transaction_id: `tx-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
            ordered_products: {
                product_id: item.product_id,
                product_name: item.product_info.name,
                order_qty: item.product_info.cart_qty,
                order_status: 0,
                sum_total: item.product_info.price * item.product_info.cart_qty,
                image: item.product_info.image,
                price: item.product_info.price
            },
            email: userEmail,
            order_date: new Date(),
            time: `${hours}:${minutes}:${seconds}`
        }));

        await Transaction.insertMany(transactions);
        cart.shopping_cart = []; // Clear the cart
        await cart.save();

        res.status(201).json({ message: 'Successful checkout!', transactions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
};


// GET /orders?email=
export const getOrders = async (req, res) => {
    try {
        const userEmail = decodeURIComponent(req.query.email);
        console.log('User Email:', userEmail);

        const transactions = await Transaction.find({ email: userEmail }).sort({ "ordered_products.order_status": 1, "order_date": -1 });
        
        res.status(200).json({ message: 'Orders retrieved successfully', transactions });
    } catch (error) {
        console.error('Error retrieving orders:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


export const getTotalOrders = async (req, res) => {
    try {
        const transactions = await Transaction.find();
        const totalOrders = transactions.length;
        res.status(200).json({ message: 'Total orders retrieved successfully', totalOrders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
}

// GET /orders/pending
export const getPendingOrders = async (req, res) => {
    try {
        const pendingOrders = await Transaction.find({ "ordered_products.order_status": 0 }).sort({ order_date: -1 });
        res.status(200).json({ message: 'Pending orders retrieved successfully', pendingOrders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
};

// GET /orders/confirmed
export const getConfirmedOrders = async (req, res) => {
    try {
        const confirmedOrders = await Transaction.find({ "ordered_products.order_status": 1 }).sort({ order_date: -1 });
        res.status(200).json({ message: 'Confirmed orders retrieved successfully', confirmedOrders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
};

// GET /orders/canceled
export const getCanceledOrders = async (req, res) => {
    try {
        const canceledOrders = await Transaction.find({ "ordered_products.order_status": 2 }).sort({ order_date: -1 });
        res.status(200).json({ message: 'Canceled orders retrieved successfully', canceledOrders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
};

// PATCH /orders/cancel
export const cancelOrder = async (req, res) => {
    try {
        const transactId = decodeURIComponent(req.query.transactId);

        const checkOrder = await Transaction.findOne({ transaction_id: transactId });
        if (checkOrder.ordered_products.order_status === 2) {
            return res.status(400).json({ message: 'Order is already canceled.' });
        }

        const order = await Transaction.findOneAndUpdate(
            { transaction_id: transactId },
            { 
                $set: 
                {
                    "ordered_products.order_status": 2 
                } 
            },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ message: 'Order not found or already completed.' });
        }

        const product = await Product.findOneAndUpdate(
            { product_id: order.ordered_products.product_id },
            { $inc: { qty: order.ordered_products.order_qty } }
        );
        
        res.status(200).json({ message: 'Order canceled successfully', order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
};

// PATCH /orders/confirm?transactId=
export const confirmOrder = async (req, res) => {
    try {
        const transactId = decodeURIComponent(req.query.transactId);

        const checkOrder = await Transaction.findOne({ transaction_id: transactId });
        if (checkOrder.ordered_products.order_status === 2 || checkOrder.ordered_products.order_status === 1) {
            return res.status(400).json({ message: 'Order is already completed or canceled.' });
        }

        const order = await Transaction.findOneAndUpdate(
            { transaction_id: transactId },
            { 
                $set: 
                {
                    "ordered_products.order_status": 1 
                } 
            },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ message: 'Order not found or already completed.' });
        }
        
        res.status(200).json({ message: 'Order confirmed successfully', order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
};
