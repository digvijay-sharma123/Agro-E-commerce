import { Outlet, Link, useNavigate } from 'react-router-dom';
import './SignUp.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Expire from '../../components/Expire';

export default function SignUp() {
    const navigate = useNavigate();
    const [user, setUsers] = useState([]);
    const [email, setEmail] = useState('');
    const [first_name, setFirstName] = useState('');
    const [middle_name, setMiddleName] = useState('');
    const [last_name, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [userType, setUserType] = useState('user'); // Default to user role

    const [key, setKey] = useState(0);
    const [requestMessage, setRequestMessage] = useState('');
    const [bgColor, setBgColor] = useState("#0A6847");

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = () => {
        axios
            .get('http://localhost:3001/register')
            .then((res) => {
                console.log(res.data); // REMOVE! For testing purposes only!
            })
            .catch((error) => {
                console.error('Error fetching users:', error); // Log any errors
            });
    };

    const handleRegister = (event) => {
        event.preventDefault();
        axios
            .post('http://localhost:3001/register', {
                email,
                password,
                first_name,
                middle_name,
                last_name,
                role: userType // Include the user type in the request
            })
            .then(() => {
                alert('Registration Successful');
                setEmail('');
                setPassword('');
                setFirstName('');
                setMiddleName('');
                setLastName('');
                fetchUsers();
                navigate('/login');
            })
            .catch((error) => {
                setBgColor("#D32F2F");
                setKey(key + 1);
                setRequestMessage('Signup Error: Email already in use!');
                console.error('Registration error:', error); // Log any errors
            });
    };

    return (
        <>
            <div className="signup-page">
                <div className="signup-box">
                    <h1>Sign up</h1>
                    <form onSubmit={handleRegister}>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="email-input"
                            placeholder='Email'
                            required
                        />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="password-input"
                            placeholder='Password'
                            required
                        />
                        <input
                            type="text"
                            value={first_name}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder='First name'
                            required
                        />
                        <input
                            type="text"
                            value={middle_name}
                            onChange={(e) => setMiddleName(e.target.value)}
                            placeholder='Middle name (optional)'
                        />
                        <input
                            type="text"
                            value={last_name}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder='Last name'
                            required
                        />

                        {/* User Type Selection */}
                        <div className="user-type-selection">
                            <label>
                                <input 
                                    type="radio" 
                                    value="user" 
                                    checked={userType === 'user'} 
                                    onChange={() => setUserType('user')} 
                                />
                                User
                            </label>
                            <label>
                                <input 
                                    type="radio" 
                                    value="admin" 
                                    checked={userType === 'admin'} 
                                    onChange={() => setUserType('admin')} 
                                />
                                Admin
                            </label>
                        </div>

                        <button
                            type="submit"
                            className='login-button'>Submit</button>
                    </form>
                    <Link to={`/login`}><p>back</p></Link>
                    <Outlet />
                </div>
                {<Expire delay="3000" text={requestMessage} bgColor={bgColor} expireKey={key} />}
            </div>
        </>
    );
}
