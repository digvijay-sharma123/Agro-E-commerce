import { useNavigate, useParams } from 'react-router-dom';
import './AddProduct.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function UpdateProduct() {
    let { product_id } = useParams();
    const navigate = useNavigate();

    // State variables
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('');
    const [price, setPrice] = useState(0);
    const [qty, setQty] = useState(0);
    const [image, setImage] = useState('');
    const [productState, setProductState] = useState('');
    const [productId, setProductId] = useState(product_id); // Set the initial product ID

    useEffect(() => {
        if (product_id) {
            fetchProduct();
        }
    }, [product_id]);

    // Fetch product details using `_id`
    const fetchProduct = () => {
        axios.get(`http://localhost:3001/products/${encodeURIComponent(product_id)}`)
            .then((res) => {
                const product = res.data.product;
                setName(product.name);
                setDescription(product.description);
                setType(intToStringType(product.type));
                setPrice(product.price);
                setQty(product.qty);
                setImage(product.image);
                setProductState(product.productState);
                setProductId(product.product_id || ''); // Set if available, else empty
            })
            .catch((error) => {
                console.error('Error fetching product:', error);
            });
    };

    function intToStringType(inputType) {
        if (inputType === 1) return "Crop";
        if (inputType === 2) return "Poultry";
        return "";
    }

    function getType(inputType) {
        if (inputType === "Crop") return 1;
        if (inputType === "Poultry") return 2;
        return 0;
    }

    const handleUpdateProduct = (event) => {
        event.preventDefault();
        axios.patch(`http://localhost:3001/products/${product_id}`, {
                name,
                description,
                type: getType(type),
                price,
                qty,
                productState,
                image,
                product_id: productId // Send updated product ID
            })
            .then(() => {
                alert('Changes Successfully Saved');
                navigate('/admin/products');
            })
            .catch((error) => {
                console.error('Unable to save changes:', error);
            });
    };

    return (
        <div className="addproduct-page">
            <form onSubmit={handleUpdateProduct}>
                <h1>Update Product</h1>
                <div className='ap-box'>
                    <div className='ap-left'>
                        <div className="general-box">
                            <h2>General Information</h2>
                            <label>Product Name</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder='Enter Product Name' required />
                            <label>Product Description</label>
                            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder='Description' />
                        </div>
                        <div className='price-box'>
                            <h2>Price and Stocks</h2>
                            <label>Base Pricing</label>
                            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder='Price' required />
                            <label>Stock</label>
                            <input type="number" value={qty} onChange={(e) => setQty(e.target.value)} placeholder='Quantity' />
                        </div>
                    </div>
                    <div className='ap-right'>
                        <div className='addimg-box'>
                            <h2>Upload Image</h2>
                            <input type="text" value={image} onChange={(e) => setImage(e.target.value)} placeholder='Image URL' />
                            <img className="display-img" src={image} alt="Product Preview" />
                        </div>
                        <div className='type-box'>
                            <h2>Type</h2>
                            <label>Product Type</label>
                            <input type="text" value={type} onChange={(e) => setType(e.target.value)} placeholder='Type (Crop, Poultry)' required />
                        </div>
                        <div className='product-id-box'>
                            <h2>Product ID</h2>
                            <label>Product ID</label>
                            <input type="text" value={productId} onChange={(e) => setProductId(e.target.value)} placeholder='Enter or Generate Product ID' />
                        </div>
                    </div>
                </div>
                <button type="submit" className='ap-button'>Save Changes</button>
            </form>
        </div>
    );
}
