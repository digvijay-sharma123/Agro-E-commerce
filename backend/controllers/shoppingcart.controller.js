import { models } from '../models/models.js';
const { Cart, Product, User, productState } = models;

// Add a product to the cart
export const addToCart = async (req, res) => {
    try {
        const { email, itemId } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(404).send('User not found!');

        const product = await Product.findOne({ product_id: itemId });
        if (!product) return res.status(404).json({ message: 'Product not found!' });
        if (product.qty <= 0) return res.status(400).json({ message: 'Product is out of stock!' });

        // Reduce the quantity by 1
        product.qty -= 1;
        await product.save();

        let cart = await Cart.findOne({ email }) || new Cart({ email, shopping_cart: [] });
        let cartItem = cart.shopping_cart.find(item => item.product_id.toString() === itemId.toString());

        if (cartItem) {
            if (cartItem.product_info.cart_qty >= product.qty) {
                return res.status(400).json({
                    message: 'Quantity will exceed available stock.',
                    quantity_in_cart: cartItem.product_info.cart_qty,
                    quantity_in_stock: product.qty
                });
            }
            cartItem.product_info.cart_qty += 1;
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

        await cart.save();

        res.status(200).send({
            message: `Added ${cartItem.product_info.name} to Cart! (Qty in cart: ${cartItem.product_info.cart_qty})`,
            updated_product: product,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


// Get user cart
export const getCart = async (req, res) => {
    try {
        const userEmail = decodeURIComponent(req.query.email);
        const user = await User.findOne({ email: userEmail });
        if (!user) return res.status(404).send('User not found!');

        const cart = await Cart.findOne({ email: userEmail });
        if (!cart || cart.shopping_cart.length === 0) return res.status(404).send('Cart is empty or not found!');

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

        const totalQty = cart.shopping_cart.reduce((acc, item) => acc + item.product_info.cart_qty, 0);
        res.status(200).send({ cart_items: cartItems, totalQty });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
};

// Delete an item from the cart
export const deleteCartItem = async (req, res) => {
    try {
        const clearQty = req.query.clearQty === 'true';
        const userEmail = req.query.email;
        const cart = await Cart.findOne({ email: userEmail });

        if (!cart) return res.status(404).send('Cart not found!');

        const productId = req.params.itemId;
        const product = await Product.findOne({ product_id: productId });
        const cartItemIndex = cart.shopping_cart.findIndex(item => item._id.toString() === productId.toString());

        if (cartItemIndex === -1) return res.status(404).send('Cart item not found!');

        const cartItem = cart.shopping_cart[cartItemIndex];
        if (product) product.productState = productState.IN_SHOP;

        if (clearQty) {
            cartItem.product_info.cart_qty = 0;
        } else {
            cartItem.product_info.cart_qty -= 1;
        }

        if (cartItem.product_info.cart_qty <= 0) {
            cart.shopping_cart.splice(cartItemIndex, 1);
        }

        await product.save();
        await cart.save();

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
};

// Clear the entire cart
export const clearCart = async (req, res) => {
    try {
        const userEmail = req.query.email;
        const cart = await Cart.findOne({ email: userEmail });
        if (!cart) return res.status(404).send('Cart not found!');

        await Cart.deleteOne({ email: userEmail });
        res.status(200).send({ message: 'Successfully cleared cart!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
};
