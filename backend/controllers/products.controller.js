import { models } from '../models/models.js';
const { Product } = models;

export const getProduct = async (req, res) => {
    try {
        const { product_id } = req.query;
        console.log(req.query);

        const product = await Product.findOne({ product_id }); // Find by `product_id` instead of `_id`
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
// Sample query: /products?sort=price&order=desc
export const getProducts = async (req, res) => {
    try {
        const { sort = 'name', order = 'asc' } = req.query;
        const sortOrder = order === 'asc' ? 1 : -1;

        const validSortFields = ['name', 'price', 'qty'];
        const sortField = validSortFields.includes(sort) ? sort : 'name';

        const products = await Product.find().sort({ [sortField]: sortOrder });

        res.status(200).json({ message: 'Products retrieved successfully', products });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getTotalProducts = async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments();
        res.status(200).json({ message: 'Total products retrieved successfully', totalProducts });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// POST /products
export const createProduct = async (req, res) => {
    try {
        const { name, product_id, description, price, type, qty, image } = req.body;

        const newProduct = new Product({
            name,
            product_id,
            description: description || 'No description available',
            type,
            price: price || 0,
            qty: qty || 0,
            productState: 'in_shop',
            image: image || ''
        });

        await newProduct.save();
        res.status(201).json({ message: 'Product created successfully', product: newProduct });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// PATCH /products/:id
export const updateProduct = async (req, res) => {
    try {
        const { product_id } = req.params;
        const { name, description, type, price, qty, productState, image } = req.body;

        const productToUpdate = {};
        if (name) productToUpdate.name = name;
        if (description) productToUpdate.description = description;
        if (type) productToUpdate.type = type;
        if (price) productToUpdate.price = price;
        if (qty) productToUpdate.qty = qty;
        if (productState) productToUpdate.productState = productState;
        if (image) productToUpdate.image = image;

        const updatedProduct = await Product.findByIdAndUpdate(
            {product_id},
            productToUpdate,
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};


// DELETE /products/:id
export const deleteProduct = async (req, res) => {
    try {
        const { prodId } = req.params;
        console.log(req.params)

        const deletedProduct = await Product.findOneAndDelete({ product_id: prodId });

        if (deletedProduct) {
            res.status(200).json({ message: 'Product deleted successfully', product: deletedProduct });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
