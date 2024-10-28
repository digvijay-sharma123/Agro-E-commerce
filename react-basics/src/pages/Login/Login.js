import './Login.css';
import Footer from '../User/footer/Footer';
import { Outlet, Link, useNavigate, Navigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import logo from '../../Images/Circular Logo.png';

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const isAuthenticated = !!localStorage.getItem('token');

    useEffect(() => {
        // If you need to fetch users for some reason, handle it here
        // fetchUsers();
    }, []);

    const handleLogin = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('http://localhost:3001/login', { email, password });
            const token = response.data.token;
            console.log(jwtDecode(token)); // Decoding the token for verification

            alert('Login successful');
            setEmail('');
            setPassword('');
            localStorage.setItem('token', token);
            navigate('/'); // Navigate to home page
        } catch (err) {
            alert('Invalid credentials');
            console.error('Login Error:', err); // Log the error for debugging
        }
    };

    return (
        <>
            {isAuthenticated ? <Navigate to="/" /> :
                <div className="login-page">
                    <img className="login-bg-img" src="https://wallpapers.com/images/hd/beautiful-countryside-agriculture-ho7hwjfzpuhqtvnm.jpg" alt="Background" />
                    <div className="login-box">
                        <img className='logo' src={logo} alt="Logo" />
                        <h2>Login to your account</h2>
                        <form onSubmit={handleLogin}>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="email-input" placeholder='Email' required />
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="password-input" placeholder='Password' required />
                            <button type="submit" className='login-button'>Login</button>
                        </form>
                        <p>New here? <Link to={`/signup`} >Sign Up</Link></p>
                    </div>
                </div>}
            <Footer />
            <Outlet />
        </>
    );
}
