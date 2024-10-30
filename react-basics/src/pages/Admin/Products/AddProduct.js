import { useNavigate } from 'react-router-dom';
import './AddProduct.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AddProduct() {
    const navigate = useNavigate();
    const [productId, setProductId] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('');
    const [price, setPrice] = useState(0);
    const [qty, setQty] = useState(0);
    const [image, setImage] = useState('');
    const [displayImg, setDisplayImg] = useState('https://t3.ftcdn.net/jpg/01/80/31/10/360_F_180311099_Vlj8ufdHvec4onKSDLxxdrNiP6yX4PnP.jpg');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = () => {
        axios.get(`http://localhost:3001/products`)
            .then((res) => {
                // Handle product list if needed in future
            })
            .catch((error) => {
                console.log('Error fetching products:', error);
            });
    };

    function getType(inputType) {
        if (inputType === "Crop") return 1;
        if (inputType === "Poultry") return 2;
        return 0;
    }

    const handleAddProduct = (event) => {
        event.preventDefault();
        
        // Generate random 10-digit product ID if empty
        const finalProductId = productId || Math.floor(1000000000 + Math.random() * 9000000000);

        // Ensure price and qty are numbers
        const parsedPrice = parseFloat(price);
        const parsedQty = parseInt(qty, 10);

        axios.post('http://localhost:3001/products', {
            name,
            product_id: finalProductId.toString(),
            description,
            price: parsedPrice,
            type: getType(type),
            qty: parsedQty,
            image
        })
        .then((response) => {
            alert('Product Successfully Added');
            setName('');
            setProductId('');
            setDescription('');
            setType('');
            setPrice(0);
            setQty(0);
            setImage('');
            setDisplayImg('https://t3.ftcdn.net/jpg/01/80/31/10/360_F_180311099_Vlj8ufdHvec4onKSDLxxdrNiP6yX4PnP.jpg');
            fetchProducts();
            navigate('/admin/products');
        })
        .catch((error) => {
            console.log('Unable to add product:', error);
        });
    };
    
    return (
        <div className="addproduct-page">
            <form onSubmit={handleAddProduct}>
                <h1>Add Product</h1>
                <div className='ap-box'>
                    <div className='ap-left'>
                        <div className="general-box">
                            <h2>General Information</h2>
                            <label>Product ID (optional)</label>
                            <input
                                type="text"
                                value={productId}
                                onChange={(e) => setProductId(e.target.value)}
                                placeholder='Enter Product ID or leave blank for auto-generated'
                            />
                            <label>Product Name</label>
                            <input 
                                type="text" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                className="name-input" 
                                placeholder='Enter Product Name' 
                                required 
                            />
                            <label>Product Description</label>
                            <textarea 
                                value={description} 
                                onChange={(e) => setDescription(e.target.value)} 
                                className="desc-input" 
                                placeholder='Description' 
                            />
                        </div>

                        <div className='price-box'>
                            <h2>Price and Stocks</h2>
                            <label>Base Pricing</label>
                            <input 
                                type="number" 
                                value={price} 
                                onChange={(e) => {
                                    const value = parseFloat(e.target.value);
                                    setPrice(value >= 0 ? value : 0);
                                }}
                                placeholder='Price' 
                                required 
                            />
                            <label>Stock</label>
                            <input 
                                type="number" 
                                value={qty} 
                                onChange={(e) => {
                                    const value = parseInt(e.target.value, 10);
                                    setQty(value >= 0 ? value : 0);
                                }}
                                placeholder='Quantity' 
                                required 
                            />
                        </div>
                    </div>

                    <div className='ap-right'>
                        <div className='addimg-box'>
                            <h2>Upload Image</h2>
                            <input 
                                type="text" 
                                value={image} 
                                onChange={(e) => {setImage(e.target.value); setDisplayImg(e.target.value)}} 
                                placeholder='Image URL' 
                            />
                            <img className="display-img" src={displayImg} alt="Product Preview" />
                        </div>

                        <div className='type-box'>
                            <h2>Type</h2>
                            <label>Product Type</label>
                            <input 
                                type="text" 
                                value={type} 
                                onChange={(e) => setType(e.target.value)} 
                                placeholder='Type (Crop, Poultry)' 
                                required 
                            />
                        </div>
                    </div>
                </div>
                <button type="submit" className='ap-button'>Add Product</button>
            </form>
        </div>
    );
}
