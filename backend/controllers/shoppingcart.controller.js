import { models } from '../models/models.js';
const { Cart, Product, productState, User, product_id } = models;

export const addToCart = async (req, res) => {
    try {
        const { email, itemId } = req.body; // Extract email and itemId from the request body

        // Check if user email exists in User
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send('User not found!');
        }

        const productId = parseInt(itemId, 10); // Convert the itemId to a number
        console.log('Parsed Product ID:', productId); // Log the productId for debugging

        if (isNaN(productId)) {
            return res.status(400).send({ message: 'Invalid Product ID' });
        }

        const product = await Product.findOne({ product_id: productId });

        // Check if product exists
        if (!product) {
            return res.status(404).json({ message: 'Product not found!' });
        } else if (product.qty <= 0) {
            return res.status(400).json({ message: 'Product is out of stock!' });
        }

        // Update product state
        product.productState = productState.IN_CART;

        // Find user cart or create a new cart document for that new user
        let cart = await Cart.findOne({ email }) || new Cart({ email, shopping_cart: [] });

        // Find the product in the cart or add it to the cart
        let cartItem = cart.shopping_cart.find(item => item.product_id.toString() === productId.toString());
        if (cartItem) {
            if (cartItem.product_info.cart_qty >= product.qty) {
                return res.status(400).json({
                    message: 'Quantity will exceed available stock.',
                    quantity_in_cart: cartItem.product_info.cart_qty,
                    quantity_in_stock: product.qty
                });
            }
            cartItem.product_info.cart_qty += 1; // Increase cart qty
        } else {
            cartItem = {
                product_id: product.product_id,
                product_info: {
                    name: product.name,
                    description: product.description,
                    type: product.type,
                    price: product.price,
                    cart_qty: 1,
                    productState: productState.IN_CART,
                    image: product.image
                }
            };
            cart.shopping_cart.push(cartItem);
        }

        const cartItems = cart.shopping_cart.map(item => ({
            cartItemID: item.cart_id,
            product_id: item.product_id,
            name: item.product_info.name,
            description: item.product_info.description,
            type: item.product_info.type,
            price: item.product_info.price,
            cart_qty: item.product_info.cart_qty,
            productState: item.product_info.productState,
            image: item.product_info.image
        }));

        const totalCartQty = cartItems.reduce((acc, item) => acc + item.cart_qty, 0);

        await product.save();
        await cart.save();

        res.status(200).send({
            totalCartQty,
            message: `Added ${cartItem.product_info.name} to Cart! (Qty in cart: ${cartItem.product_info.cart_qty})`,
            cartItem: cartItem,
            updated_product: product,
            cartItems: cartItems
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message }); // Log the error message
    }
};


// GET /cart?email
export const getCart = async (req, res) => {
    try {
        const userEmail = decodeURIComponent(req.query.email);
        
        // Check if user email exists in User
        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return res.status(404).send('User is not found!');
        }
        
        const cart = await Cart.findOne({ email: userEmail });
        if (!cart || cart.shopping_cart.length === 0) { // If cart is empty or doesn't exist
            return res.status(404).send('Cart is empty or not found!');
        }

        // Map out each document in the shopping_cart array
        const cartItems = cart.shopping_cart.map(item => ({
            cartItemID: item.cart_id,
            product_id: item.product_id, // product_id is now a number
            name: item.product_info.name,
            description: item.product_info.description,
            type: item.product_info.type,
            price: item.product_info.price,
            cart_qty: item.product_info.cart_qty,
            productState: item.product_info.productState,
            image: item.product_info.image
        }));

        const totalQty = cart.shopping_cart.reduce((acc, item) => acc + item.product_info.cart_qty, 0);
        
        res.status(200).send({ cart_items: cartItems, totalQty });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
}

// DELETE /cart/:itemId
export const deleteCartItem = async (req, res) => {
    try {
        const clearQty = req.query.clearQty === 'true'; // Convert query parameter to boolean
        const userEmail = req.query.email;
        const cart = await Cart.findOne({ email: userEmail });
        
        if (!cart) { // Check for cart existence
            return res.status(404).send('Cart not found!');
        }

        const productId = parseInt(req.params.itemId, 10); // Convert the itemId from the request to a number
        const product = await Product.findOne({ product_id: productId }); // product_id is now a number
        const cartItemIndex = cart.shopping_cart.findIndex(item => item.product_id === productId); // Compare with number
        
        if (cartItemIndex === -1) { // Check if item exists in the cart
            return res.status(404).send('Cart item not found!');
        }

        const cartItem = cart.shopping_cart[cartItemIndex];
        
        // If the product exists, update the product state
        if (product) {
            product.productState = productState.IN_SHOP; // Change product state
        }

        // Deduct cart_qty of the product in the cart
        if (clearQty) {
            cartItem.product_info.cart_qty = 0;
        } else {
            if (cartItem.product_info.cart_qty > product.qty) {
                cartItem.product_info.cart_qty = product.qty; // Set to stock quantity
            } else {
                cartItem.product_info.cart_qty -= 1; // Decrease quantity
            }
        }

        // If cart_qty is less than or equal to 0, remove the product from the shopping_cart
        if (cartItem.product_info.cart_qty <= 0) {
            cart.shopping_cart.splice(cartItemIndex, 1);
        }

        await product.save();
        await cart.save();

        const cartItems = cart.shopping_cart.map(item => ({
            cartItemID: item.cart_id,
            product_id: item.product_id, // product_id is now a number
            name: item.product_info.name,
            description: item.product_info.description,
            type: item.product_info.type,
            price: item.product_info.price,
            cart_qty: item.product_info.cart_qty,
            productState: item.product_info.productState,
            image: item.product_info.image
        }));

        const totalQuantity = cart.shopping_cart.reduce((acc, item) => acc + item.product_info.cart_qty, 0);
        
        res.status(200).send({
            message: `Successfully removed ${cartItem.product_info.name} from cart!`,
            your_cart: {
                cart_items: cartItems,
                total_quantity: totalQuantity
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
}

export const clearCart = async (req, res) => {
    try {
        const userEmail = req.query.email;
        
        const cart = await Cart.findOne({ email: userEmail });
        if (!cart) { // Check for cart existence
            return res.status(404).send('Cart not found!');
        }

        // Delete user's cart
        await Cart.deleteOne({ email: userEmail });

        res.status(200).send({ message: 'Successfully cleared cart!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
}
