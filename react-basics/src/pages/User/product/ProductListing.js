import React, { useEffect, useState } from 'react';
import './ProductListing.css';
import axios from 'axios';
import Dropdown from '../../../components/Dropdown.js';
import { jwtDecode } from 'jwt-decode';
import Expire from '../../../components/Expire.js';

const ProductListing = () => {
  const [productList, setProductList] = useState([]);
  const [isProductListEmpty, setIsProductListEmpty] = useState(false);
  const [key, setKey] = useState(0);
  const [requestMessage, setRequestMessage] = useState('');
  const [bgColor, setBgColor] = useState('#0A6847');

  const userEmail = jwtDecode(localStorage.getItem('token')).email;

  useEffect(() => {
    console.log('Product List State Updated:', productList);
}, [productList]);

useEffect(() => {
  fetchProducts();
}, []);

const fetchProducts = async () => {
  try {
      const res = await axios.get(`http://localhost:3001/products`);
      console.log('Fetched Products:', res.data.products);

      if (Array.isArray(res.data.products) && res.data.products.length > 0) {
          // Map the products to include a product_id and other necessary properties
          const productsWithId = res.data.products.map(product => ({
              _id: product._id, // Use _id as product_id
              name: product.name,
              description: product.description,
              type: product.type,
              price: product.price,
              qty: product.qty, // Assuming qty is the stock quantity
              image: product.image || product.pImages[0], // Use the provided image or fallback
              productState: product.productState // Include any other properties you need
          }));
          setProductList(productsWithId);
          setIsProductListEmpty(false);
      } else {
          setIsProductListEmpty(true);
      }
  } catch (error) {
      setIsProductListEmpty(true);
      console.error(error);
  }
};


  
  const sort = async (sortByValue, orderByValue) => {
    try {
      const res = await axios.get(`http://localhost:3001/products?sort=${sortByValue}&order=${orderByValue}`);
      setProductList(res.data.products);
    } catch (error) {
      if (error.response) {
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
      } else if (error.request) {
        console.log(error.request);
      }
    }
  };

  const addToCart = async (productId) => {
    try {
        // Use POST and send the productId and user email in the request body
        const res = await axios.post(`http://localhost:3001/cart`, {
            itemId: productId, // Send the productId as itemId
            email: userEmail // Use dynamic userEmail
        });
        
        // Update product list based on the response
        const updatedProductList = productList.map((product) => {
            if (product._id === productId) {
                return {
                    ...product,
                    qty: res.data.updated_product.qty // Ensure the quantity is applied
                };
            } else {
                return product; // Keep other products as is
            }
        });

        setProductList(updatedProductList);
        setRequestMessage(res.data.message);
        setKey(key + 1);
        setBgColor("#0A6847");
    } catch (error) {
        if (error.response) {
            if (error.response.status === 409) {
                setRequestMessage(`${error.response.data.message} (Qty in cart: ${error.response.data.quantity_in_cart})`);
                setKey(key + 1);
                setBgColor("#D32F2F");
            } else if (error.response.status === 404) {
                setRequestMessage(error.response.data.productListingMessage);
                setKey(key + 1);
                setBgColor("#D32F2F");
            } else {
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
            }
        } else if (error.request) {
            console.log(error.request);
        }
    }
};

  
  return (
    <div className="content">
      <div className="sort">
        <span className="sort-by-text">Sort by</span>
        <div className="dropdown-btns">
          {sortMenus.map((sortMenu, index) => (
            <Dropdown sortMenus={sortMenu} sortFunction={sort} key={index} />
          ))}
        </div>
      </div>
      <div className="product-listing">
    {isProductListEmpty ? (
        <h3>No products found!</h3>
    ) : (
        productList.map((product, index) => (
            <div
                className={`product-card ${product.qty <= 0 ? 'product-unavailable' : ''}`}
                key={product._id || index}
            >
                {product.qty <= 0 && <div className="unavailable">Product is unavailable</div>}
                <img src={product.image} alt={product.name} />
                <div className="product-info">
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>
                    <p>In Stock: {product.qty}</p>
                    <button
                        onClick={product.qty > 0 ? () => addToCart(product._id) : null}
                        disabled={product.qty <= 0}
                    >
                        &#8369;{product.price !== undefined ? product.price.toFixed(2) : '0.00'} Add to Cart
                    </button>
                </div>
            </div>
        ))
    )}
</div>

      <Expire delay="3000" text={requestMessage} bgColor={bgColor} expireKey={key} />
    </div>
  );
};

const sortMenus = [
  {
    title: 'Name',
    menus: ['Name: A-Z', 'Name: Z-A'],
    sortByValue: 'name',
  },
  {
    title: 'Type',
    menus: ['Type: Show Crops First', 'Type: Show Poultry First'],
    sortByValue: 'type',
  },
  {
    title: 'Price',
    menus: ['Price: Low-High', 'Price: High-Low'],
    sortByValue: 'price',
  },
  {
    title: 'Quantity',
    menus: ['Quantity: Low-High', 'Quantity: High-Low'],
    sortByValue: 'qty',
  },
];

export default ProductListing;
