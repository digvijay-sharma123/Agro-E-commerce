import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import './AdminProductListing.css';
import axios from 'axios';
import Dropdown from '../../../components/Dropdown';

export default function AdminProductListing() {
    const [productList, setProductList] = useState([]);
    const [toDelete, setToDelete] = useState([]);
    const [isCheckAll, setIsCheckAll] = useState(false);
    const [delVisible, setDelVisible] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        setDelVisible(toDelete.length > 0);
    }, [toDelete]);

    const fetchProducts = () => {
        axios.get(`http://localhost:3001/products`)
            .then((res) => {
                setProductList(res.data.products);
            })
            .catch(error => console.log('Error fetching products:', error));
    };

    const sort = (sortByValue, orderByValue) => {
        axios.get(`http://localhost:3001/products?sort=${sortByValue}&order=${orderByValue}`)
            .then((res) => {
                setProductList(res.data.products);
            })
            .catch(error => console.log('Error sorting products:', error));
    };

    const handleSelectAll = (e) => {
        const checked = e.target.checked;
        setIsCheckAll(checked);
        setToDelete(checked ? productList.map(item => item.product_id) : []);
    };

    const handleClick = (e, productId) => {
        const checked = e.target.checked;
        setToDelete(
            checked ? [...toDelete, productId] : toDelete.filter(item => item !== productId)
        );
    };

    const deleteProduct = async (prodId) => {
            await axios.delete(`http://localhost:3001/products/${prodId}`)
            .then(() => {
                setProductList(productList.filter(item => item.product_id !== prodId));
            })
            .catch(error => console.log('Error deleting product:', error));
    };
    

    const handleDeleteClick = () => {
        toDelete.forEach(id => deleteProduct(id));
        setToDelete([]);
    };

    return (
        <>
            <div className='admin-product-page'>
                <div className="admin-product-header">
                    <h1>My Product</h1>
                </div>

                <div className='admin-product-box'>
                    <div className='box-top'>
                        <div className='bt-left'>
                            <h2>{productList.length} Product{productList.length > 1 ? "s" : ""}</h2>
                            {sortMenus.map((sortMenu, index) => (
                                <Dropdown sortMenus={sortMenu} sortFunction={sort} key={index} />
                            ))}
                        </div>
                        <div className='bt-right'>
                            <button className="add-product-btn" onClick={() => navigate('/admin/products/addproduct')}>+ Add a new Product</button>
                        </div>
                    </div>

                    {productList.length > 0 ? (
                        <table className='admin-product-table'>
                            <thead>
                                <tr>
                                    <th>
                                        Product(s)
                                    </th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productList.map((item) => (
                                    <tr key={item.product_id}>
                                        <td>
                                            <div className='col1'>
                                                <input
                                                    className="cb-input"
                                                    id={item.product_id}
                                                    type="checkbox"
                                                    name="select"
                                                    checked={toDelete.includes(item.product_id)}
                                                    onChange={(e) => handleClick(e, item.product_id)}
                                                />
                                                <div className='product-box'>
                                                    <div className='pb-left'>
                                                        <img className="apl-img" src={item.image} alt={item.name}></img>
                                                    </div>
                                                    <div className='pb-right'>
                                                        <h3 className='product-name'>{item.name}</h3>
                                                        <p className='product-detail'>Product ID: {item.product_id}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{(item.price ? item.price.toFixed(2) : "0.00")}</td>
                                        <td>{item.qty}</td>
                                        <td>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); navigate(`/admin/products/update/${item.product_id}`); }}
                                                className='edit-btn'
                                            >
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : <h1>No Products yet</h1>}
                </div>

                {delVisible && (
                    <div className='delete-page'>
                        <div className='delete-content'>
                            <div className='delete-left'>
                                <p>{toDelete.length} product(s) to be deleted</p>
                            </div>
                            <div className='delete-right'>
                                <button onClick={handleDeleteClick} className='delete-btn'>Delete</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

const sortMenus = [
    {
        title: "Name",
        menus: ["Name: A-Z", "Name: Z-A"],
        sortByValue: "name"
    },
    {
        title: "Type",
        menus: ["Type: Show Crops First", "Type: Show Poultry First"],
        sortByValue: "type"
    },
    {
        title: "Price",
        menus: ["Price: Low-High", "Price: High-Low"],
        sortByValue: "price"
    },
    {
        title: "Quantity",
        menus: ["Quantity: Low-High", "Quantity: High-Low"],
        sortByValue: "qty"
    },
];
