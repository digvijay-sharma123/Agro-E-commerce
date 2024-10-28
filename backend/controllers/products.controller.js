import { models } from '../models/models.js';
const { Product, product_id} = models;


export const getProduct = async (req, res) => {
    try {
        const { product_id } = req.query;

        const product = await Product.findOne({ product_id: Number(product_id) }); // Ensure product_id is treated as a number
        if (product) {
            return res.status(200).json({ message: 'Product retrieved successfully', product });
        }

        res.status(404).json({ message: 'Product not found' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};



// GET /products
// @param (string)[sort]. Default: 'name', Options: 'price', 'qty'
// @param (string)[order]. Default: 'asc', Options: 'asc', 'desc'
// sample quert: /products?sort=price&order=desc
export const getProducts = async (req, res) => {
    try {
        const { sort = 'name', order = 'asc' } = req.query;
        const sortOrder = order === 'asc' ? 1 : -1;

        const validSortFields = ['name', 'price', 'qty', 'product_id'];
        const sortField = validSortFields.includes(sort) ? sort : 'name';

        const products = await Product.find().sort({ [sortField]: sortOrder });

        res.status(200).json({ message: 'Products retrieved successfully', products });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};



export const getTotalProducts = async (req, res) => {
    try {
        const products = await Product.find({}, 'product_id');
        const totalProducts = products.length;

        res.status(200).json({ message: 'Total products retrieved successfully', totalProducts });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};



// POST /products
export const createProduct = async (req, res) => {
    try {
        const { product_id, name, description, price, type, qty, image } = req.body;
        
        let newId = product_id || 0;

        if (!product_id) {
            const latestProduct = await Product.findOne().sort({ product_id: -1 });
            newId = latestProduct ? latestProduct.product_id + 1 : 1; // Increment based on the last product_id
        }

        const newProduct = new Product({
            product_id: newId,  // Ensure product_id is stored as a number
            name,
            description: description || 'No description available',
            type,
            price: price || 0,
            qty: qty || 0,
            productState: 'in_shop',
            image: image || ''
        });

        await newProduct.save();
        res.status(201).json({ message: 'Product created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server errors', error });
    }
};


// PATCH /products/:prodId
// @param (Number)prodId
export const updateProduct = async (req, res) => {
    try {
        const prodId = Number(req.params.prodId); // Ensure product_id is treated as a number
        const { name, description, type, price, qty, productState, image } = req.body;

        const product = await Product.findOne({ product_id: prodId });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const productToUpdate = {};
        if (name) productToUpdate.name = name;
        if (description) productToUpdate.description = description;
        if (type) productToUpdate.type = type;
        if (price) productToUpdate.price = price;
        if (qty) productToUpdate.qty = qty;
        if (productState) productToUpdate.productState = productState;
        if (image) productToUpdate.image = image;

        const updatedProduct = await Product.findByIdAndUpdate(
            product._id,
            productToUpdate,
            { new: true }
        );

        res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};




// DELETE /products/:prodId
// @param (Number)prodId
export const deleteProduct = async (req, res) => {
    try {
        const prodId = Number(req.params.prodId); // Ensure product_id is treated as a number

        const product = await Product.findOne({ product_id: prodId });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const deletedProduct = await Product.findByIdAndDelete(product._id);

        if (deletedProduct) {
            res.status(200).json({ message: 'Product deleted successfully', product: deletedProduct });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};


